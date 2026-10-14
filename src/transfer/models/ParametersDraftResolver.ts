import { NullifierKey, Resource } from "@anomaorg/arm-bindings";
import { selectTransferResources } from "resources";
import { getResourcesForToken } from "resources/forToken";
import type { TransferResourceWithAmount } from "resources/types";
import { tokenId } from "tokens";
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
 * Orchestrates resource selection and creation for transfers supporting
 * multiple receivers and mixed address types.
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

  /** Creates a transfer or burn resource for each receiver. */
  getCreateIntents(receivers: Receiver[]): CreateIntent[] {
    return receivers.map(receiver => {
      if (!receiver.token)
        throw new Error("Consumed resource is missing token information");

      // Params that will be shared between different resource creation methods (burn vs transfer)
      const commonParams = {
        forwarderAddress: this.chain.forwarderAddress,
        token: receiver.token.address,
        quantity: receiver.quantity,
      };

      // Resource destination -> Ethereum address
      if (receiver.type === "EvmAddress") {
        return {
          resource: this.transferBuilder.client.createBurnResource({
            ...commonParams,
            nullifierKey: new NullifierKey(this.senderNullifierKey),
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

  /**
   * Builds the full transfer parameters by selecting resources and creating
   * the consumed/created entries for every receiver plus any change.
   */
  build(userResources: AppResource[]): ResolvedParameters {
    const selectedResources = this.selectResources(userResources);
    const remainderReceivers = this.checkForRemainders(selectedResources);

    return {
      consumeIntents: this.getConsumeIntents(selectedResources),
      createIntents: this.getCreateIntents([
        ...this.receivers,
        ...remainderReceivers,
      ]),
    };
  }
}
