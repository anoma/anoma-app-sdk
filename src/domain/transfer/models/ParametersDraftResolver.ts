import type { SupportedChain } from "app-constants";
import { selectTransferResources } from "domain/resources";
import type { TransferResourceWithAmount } from "domain/resources/types";
import { getUserPublicKeysFromKeyring } from "lib/keyUtils";
import { getResourcesForToken } from "lib/resources";
import { tokenId } from "lib/tokenUtils";
import type {
  AppResource,
  ConsumedResourceDraft,
  CreatedResourceDraft,
  Receiver,
  ResolvedParameters,
  TokenId,
  TokenRegistry,
  UserKeyring,
} from "types";
import { NullifierKey, Resource } from "wasm";
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
  protected transferBuilder: TransferBuilder;
  protected keyring: UserKeyring;
  protected chain: SupportedChain;
  protected receivers: Receiver[] = [];

  constructor(transferBuilder: TransferBuilder, keyring: UserKeyring, chain: SupportedChain) {
    this.keyring = keyring;
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
      const { selected } = selectTransferResources(tokenResources, amount);
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
          userPublicKeys: getUserPublicKeysFromKeyring(this.keyring),
          quantity: remainderAmount,
          token,
        });
      }
    }

    return remainderReceivers;
  }

  /** Converts selected resources into ConsumedResourceDraft entries for the sender. */
  getConsumedResourceDraftList(
    selectedResourcesMap: Map<TokenId, TokenResourceWithAmount>
  ): ConsumedResourceDraft[] {
    const consumedResources: ConsumedResourceDraft[] = [];

    for (const [, value] of selectedResourcesMap) {
      const { token, resourceWithAmount } = value;
      const items: ConsumedResourceDraft[] = resourceWithAmount.map(
        ({ resource }) => ({
          type: "AnomaAddress",
          userPublicKeys: getUserPublicKeysFromKeyring(this.keyring),
          resource: Resource.decode(resource),
          nullifierKey: new NullifierKey(this.keyring.nullifierKeyPair.nk),
          token,
        })
      );
      consumedResources.push(...items);
    }

    return consumedResources;
  }

  /**
   * Creates transfer resources for each receiver, using the
   * corresponding consumed resource as the input.
   */
  getCreatedResourceDraftList(
    consumedResources: ConsumedResourceDraft[],
    receivers: Receiver[]
  ): CreatedResourceDraft[] {
    return receivers.map((receiver, i) => {
      const { resource: consumedResource, nullifierKey } = consumedResources[i];

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
            receiverKeyring: receiver.userPublicKeys,
          }),
          receiver,
        };
      }

      throw new Error("Unknown receiver type");
    });
  }

  /** Creates a padding CreatedResourceDraft with a trivial resource. */
  getCreatedResourceDraftPadding(
    consumedResource: ConsumedResourceDraft
  ): CreatedResourceDraft {
    return {
      resource: this.transferBuilder.client.createPaddingResource({
        nullifierKey: consumedResource.nullifierKey,
        resource: consumedResource.resource,
      }),
      receiver: undefined,
    };
  }

  /** Creates a padding ConsumedResourceDraft with a trivial resource. */
  getConsumedResourceDraftPadding(): ConsumedResourceDraft {
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

    // Create consumed resources from selected user resources
    const consumedResourceDrafts: ConsumedResourceDraft[] = [
      ...this.getConsumedResourceDraftList(selectedResources),
    ];

    // Pad consumed resources so there is one per receiver before creating outputs
    const consumedPaddingCount = Math.max(
      0,
      receivers.length - consumedResourceDrafts.length
    );

    for (let i = 0; i < consumedPaddingCount; i++) {
      consumedResourceDrafts.push(this.getConsumedResourceDraftPadding());
    }

    // Create resources using the (now padded) consumed resources
    const createdResourceDrafts: CreatedResourceDraft[] = [
      ...this.getCreatedResourceDraftList(consumedResourceDrafts, receivers),
    ];

    // Pad created resources if consumed still outnumbers them
    const createdPaddingCount = Math.max(
      0,
      consumedResourceDrafts.length - createdResourceDrafts.length
    );

    for (let i = 0; i < createdPaddingCount; i++) {
      const consumedIndex = createdResourceDrafts.length;
      const consumed = consumedResourceDrafts[consumedIndex];
      createdResourceDrafts.push(this.getCreatedResourceDraftPadding(consumed));
    }

    return {
      consumedResourceDrafts,
      createdResourceDrafts,
    };
  }
}
