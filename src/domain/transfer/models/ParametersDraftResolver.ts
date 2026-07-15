import { NullifierKey, Resource } from "@anomaorg/arm-bindings";
import { selectTransferResources } from "domain/resources";
import type { TransferResourceWithAmount } from "domain/resources/types";
import { getResourcesForToken } from "lib/resources";
import { tokenId } from "lib/tokenUtils";
import type {
  AppResource,
  ConsumeIntent,
  CreateIntent,
  Receiver,
  ResolvedParameters,
  SupportedChainConfig,
  TokenId,
  TokenRegistry,
  UserPublicKeys,
} from "types";
import type { TransferBuilder } from "./TransferBuilder";

type TokenAmount = {
  quantity: bigint;
  token: TokenRegistry;
};

type TokenResourceWithAmount = {
  token: TokenRegistry;
  resourceWithAmount: TransferResourceWithAmount[];
};

/**
 * Orchestrates resource selection, creation, and padding for transfers
 * supporting multiple receivers and mixed address types.
 */
export class ParametersDraftResolver {
  protected chain: SupportedChainConfig;
  protected transferBuilder: TransferBuilder;
  protected senderPublicKeys: UserPublicKeys;
  protected senderNullifierKey: Uint8Array<ArrayBuffer>;
  protected receivers: Receiver[] = [];

  constructor(
    transferBuilder: TransferBuilder,
    senderPublicKeys: UserPublicKeys,
    senderNullifierKey: Uint8Array<ArrayBuffer>,
    chain: SupportedChainConfig
  ) {
    this.senderPublicKeys = senderPublicKeys;
    this.senderNullifierKey = senderNullifierKey;
    this.transferBuilder = transferBuilder;
    this.chain = chain;
  }

  /** Adds a receiver to the transfer. */
  addReceiver(receiver: Receiver) {
    this.receivers.push(receiver);
    return this;
  }

  /**
   * Returns a Map of token IDs to the total amount payable for a given token.
   */
  protected groupPayableAmountsByToken(): Map<TokenId, TokenAmount> {
    const totals = new Map<TokenId, TokenAmount>();

    for (const { token, quantity } of this.receivers) {
      const id = tokenId(token);
      const existing = totals.get(id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        totals.set(id, { quantity, token });
      }
    }

    return totals;
  }

  /** Selects the minimum set of user resources needed to fulfill all receivers, grouped by token. */
  protected selectResources(
    resources: AppResource[]
  ): Map<TokenId, TokenResourceWithAmount> {
    const result = new Map<TokenId, TokenResourceWithAmount>();
    const amountsByToken = this.groupPayableAmountsByToken();

    // Pick available user resources to fulfill the required amounts for each token
    for (const [id, { quantity: amount, token }] of amountsByToken) {
      const tokenResources = getResourcesForToken(token.address, resources);
      const selected = selectTransferResources(tokenResources, amount);
      result.set(id, { token, resourceWithAmount: selected });
    }

    // Validate that we have enough resources for each token
    for (const [id, { resourceWithAmount }] of result) {
      if (resourceWithAmount.length === 0) {
        throw new Error("Not enough resources for token: " + id);
      }
    }

    return result;
  }

  /**
   * Checks for remainder amounts after resource selection and returns
   * receivers for the change that should go back to the sender.
   */
  protected checkForRemainders(
    selectedResourcesMap: Map<TokenId, TokenResourceWithAmount>
  ): Receiver[] {
    const remainderReceivers: Receiver[] = [];

    for (const [, { token, resourceWithAmount }] of selectedResourcesMap) {
      const lastResource = resourceWithAmount.at(-1);
      if (!lastResource) continue;

      const remainderAmount =
        lastResource.resource.quantity - lastResource.targetAmount;

      if (remainderAmount > 0n) {
        remainderReceivers.push({
          type: "AnomaAddress",
          userPublicKeys: this.senderPublicKeys,
          quantity: remainderAmount,
          token,
        });
      }
    }

    return remainderReceivers;
  }

  /** Converts selected resources into ConsumeIntent entries for the sender. */
  getConsumeIntents(
    selectedResourcesMap: Map<TokenId, TokenResourceWithAmount>
  ): ConsumeIntent[] {
    const consumeIntents: ConsumeIntent[] = [];

    for (const [, value] of selectedResourcesMap) {
      const { token, resourceWithAmount } = value;
      const items: ConsumeIntent[] = resourceWithAmount.map(({ resource }) => ({
        type: "AnomaAddress",
        userPublicKeys: this.senderPublicKeys,
        resource: Resource.decode(resource),
        nullifierKey: new NullifierKey(this.senderNullifierKey),
        token,
      }));
      consumeIntents.push(...items);
    }

    return consumeIntents;
  }

  /**
   * Creates transfer resources for each receiver, using the
   * corresponding consumed resource as the input.
   */
  getCreateIntents(
    consumeIntents: ConsumeIntent[],
    receivers: Receiver[]
  ): CreateIntent[] {
    return receivers.map((receiver, i) => {
      const { resource: consumedResource, nullifierKey } = consumeIntents[i];

      if (!receiver.token)
        throw new Error("Consumed resource is missing token information");

      // Params that will be shared between different resource creation methods (burn vs transfer)
      const commonParams = {
        forwarderAddress: this.chain.forwarderAddress,
        token: receiver.token.address,
        quantity: receiver.quantity,
        resource: consumedResource,
        nullifierKey,
      };

      // Resource destination -> Ethereum address
      if (receiver.type === "EvmAddress") {
        return {
          resource: this.transferBuilder.client.createBurnResource({
            ...commonParams,
            receiverAddress: receiver.address,
          }),
          receiver,
        };
      }

      // Resource destination -> Anoma address (public keys)
      if (receiver.type === "AnomaAddress") {
        return {
          resource: this.transferBuilder.client.createTransferResource({
            ...commonParams,
            receiverPublicKeys: receiver.userPublicKeys,
          }),
          receiver,
        };
      }

      throw new Error("Unknown receiver type");
    });
  }

  /** Creates a padding CreateIntent with a trivial resource. */
  getCreateIntentPadding(consumedResource: ConsumeIntent): CreateIntent {
    return {
      resource: this.transferBuilder.client.createPaddingResource({
        nullifierKey: consumedResource.nullifierKey,
        resource: consumedResource.resource,
      }),
      receiver: undefined,
    };
  }

  /** Creates a padding ConsumeIntent with a trivial resource. */
  getConsumeIntentPadding(): ConsumeIntent {
    return {
      type: "Padding",
      resource: this.transferBuilder.client.createPaddingResource(),
      nullifierKey: NullifierKey.default(),
    };
  }

  /**
   * Builds the full transfer parameters by selecting resources, creating
   * consumed/created entries, balancing with padding, authorizing, and
   * serializing into the Parameters structure.
   */
  build(userResources: AppResource[]): ResolvedParameters {
    // Select user resources
    const selectedResources = this.selectResources(userResources);
    const remainderReceivers = this.checkForRemainders(selectedResources);
    const receivers = [...this.receivers, ...remainderReceivers];

    // Create consume intents from selected user resources
    const consumeIntents: ConsumeIntent[] = [
      ...this.getConsumeIntents(selectedResources),
    ];

    // Pad consume intents so there is one per receiver before creating outputs
    const consumedPaddingCount = Math.max(
      0,
      receivers.length - consumeIntents.length
    );

    for (let i = 0; i < consumedPaddingCount; i++) {
      consumeIntents.push(this.getConsumeIntentPadding());
    }

    // Create intents using the (now padded) consume intents
    const createIntents: CreateIntent[] = [
      ...this.getCreateIntents(consumeIntents, receivers),
    ];

    // Pad create intents if consume intents still outnumber them
    const createdPaddingCount = Math.max(
      0,
      consumeIntents.length - createIntents.length
    );

    for (let i = 0; i < createdPaddingCount; i++) {
      const consumedIndex = createIntents.length;
      const consumed = consumeIntents[consumedIndex];
      createIntents.push(this.getCreateIntentPadding(consumed));
    }

    return {
      consumeIntents,
      createIntents,
    };
  }
}
