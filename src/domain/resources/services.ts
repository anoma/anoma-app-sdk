import type { IndexerEVMTransaction, IndexerResource, IndexerTag } from "api";
import { fromHex, normalizeHex } from "lib/utils";
import type { AppResource, Parameters, UserKeyring } from "types";
import { type Address, type Hex } from "viem";
import {
  NullifierKey,
  Resource,
  ResourceWithLabel,
  type EncodedResource,
} from "wasm";

type TransactionLookup = {
  byNullifier: Map<string, IndexerEVMTransaction>;
  byTxHash: Map<Address, IndexerEVMTransaction>;
};

type ResourceWithDetails = {
  resource: Resource;
  forwarder: Address;
  erc20TokenAddress: Address;
  transactionHash: Address;
};

/**
 * Builds two lookup maps from a flat array of {@link IndexerTag} objects:
 * one keyed by normalized nullifier hex and one keyed by EVM transaction hash.
 *
 * These maps are used internally by {@link openResourceMetadata} to check
 * whether a resource has been consumed and to attach transaction metadata.
 *
 * @param tags - Array of {@link IndexerTag} objects returned by the indexer.
 * @returns A `TransactionLookup` with `byNullifier` and `byTxHash` maps.
 */
export function buildTransactionLookup(tags: IndexerTag[]): TransactionLookup {
  const lookup: TransactionLookup = {
    byNullifier: new Map(),
    byTxHash: new Map(),
  };
  for (const tag of tags) {
    lookup.byNullifier.set(
      normalizeHex(tag.tagHash),
      tag.transaction.evmTransaction
    );
    lookup.byTxHash.set(
      tag.transaction.evmTransaction.txHash,
      tag.transaction.evmTransaction
    );
  }
  return lookup;
}

/**
 * Decrypts and deserializes a single encrypted resource blob received from the indexer.
 *
 * The blob is decrypted using the caller's encryption private key. The result
 * contains the raw `Resource` object along with its `forwarder` address and
 * `erc20TokenAddress` metadata.
 *
 * @param blobHex - The hex-encoded encrypted resource payload.
 * @param encryptionPrivateKey - The caller's encryption private key (from `keyring.encryptionKeyPair.privateKey`).
 * @returns A {@link ResourceWithLabel} containing the decrypted resource and label metadata.
 * @throws If decryption fails or the payload cannot be deserialized.
 */
export function deserializeResourcePayload(
  blobHex: Hex,
  encryptionPrivateKey: Uint8Array
): ResourceWithLabel {
  const payload = fromHex(blobHex);
  return ResourceWithLabel.fromEncrypted(payload, encryptionPrivateKey);
}

const tryToDeserializeResourcePayload = (
  keyring: UserKeyring,
  indexerResource: IndexerResource
) => {
  try {
    return deserializeResourcePayload(
      indexerResource.resource_payload.blob,
      keyring.encryptionKeyPair.privateKey
    );
  } catch {
    return false;
  }
};

/**
 * Decrypts and deserializes a collection of encrypted resource blobs returned by
 * {@link IndexerClient.resources}.
 *
 * Each blob is attempted in isolation; blobs that cannot be decrypted with the
 * provided keyring are silently skipped (they belong to other users). The
 * returned array contains only resources that belong to the caller.
 *
 * @param keyring - The caller's full {@link UserKeyring}; the encryption private
 *   key is used to decrypt each payload.
 * @param resourceResponseCollection - Raw {@link IndexerResource} objects from the indexer response.
 * @returns A promise resolving to the successfully-decrypted resources with their
 *   forwarder, token address, and transaction hash metadata attached.
 *
 * @example
 * ```typescript
 * const { resources } = await indexerClient.resources(discoveryPrivKey);
 * const decrypted = await parseIndexerResourceResponse(keyring, resources);
 * ```
 */
export const parseIndexerResourceResponse = async (
  keyring: UserKeyring,
  resourceResponseCollection: IndexerResource[]
): Promise<ResourceWithDetails[]> => {
  return resourceResponseCollection.flatMap(item => {
    const payload = tryToDeserializeResourcePayload(keyring, item);
    if (!payload) {
      return [];
    }
    return {
      resource: payload.resource,
      forwarder: payload.forwarder as Address,
      erc20TokenAddress: payload.erc20TokenAddress as Address,
      transactionHash: item.transaction_hash,
    };
  });
};

/**
 * Filters out ephemeral resources from a decoded resource list.
 *
 * Ephemeral resources are transient (e.g. consumed in the same action batch)
 * and should not be shown as spendable balances to the user.
 *
 * @param resources - Array of decoded resources with metadata.
 * @returns Only the non-ephemeral (persistent) resources.
 */
export const pickNonEphemeralResources = (
  resources: ResourceWithDetails[]
): ResourceWithDetails[] => {
  return resources.filter(item => !item.resource.encode().is_ephemeral);
};

/**
 * Enriches a list of decrypted resources with on-chain nullifier status and
 * transaction metadata, returning {@link AppResource} objects.
 *
 * For each resource the function:
 * 1. Computes the resource's nullifier using the caller's nullifier key (`nk`).
 * 2. Checks whether that nullifier appears in `transactionLookup.byNullifier` to
 *    determine if the resource has already been spent.
 * 3. Attaches the creation and (if spent) consumption transaction details.
 *
 * @param keyring - The caller's full {@link UserKeyring}; `nullifierKeyPair.nk` is
 *   used to compute nullifiers.
 * @param resources - Decrypted resource list (e.g. from {@link parseIndexerResourceResponse}).
 * @param transactionLookup - Pre-built lookup maps (see {@link buildTransactionLookup}).
 * @param onlyAvailableResources - When `true` (default), only unspent resources are
 *   returned. Set to `false` to include already-consumed resources.
 * @returns A promise resolving to an array of {@link AppResource} objects annotated
 *   with `isConsumed`, `erc20TokenAddress`, `forwarder`, and transaction references.
 *
 * @example
 * ```typescript
 * const lookup = buildTransactionLookup(tags);
 * const appResources = await openResourceMetadata(keyring, decryptedResources, lookup);
 * // appResources only contains unspent resources belonging to keyring
 * ```
 */
export const openResourceMetadata = async (
  keyring: UserKeyring,
  resources: ResourceWithDetails[],
  transactionLookup: TransactionLookup,
  onlyAvailableResources = true
): Promise<AppResource[]> => {
  const updatedResources: AppResource[] = [];
  const nullifierKey = new NullifierKey(keyring.nullifierKeyPair.nk);

  // Step 1: Compute optimistic balance from all decrypted resources quantities
  for (const deserializedResource of resources) {
    const { resource, erc20TokenAddress, forwarder, transactionHash } =
      deserializedResource;

    const resourceProps = resource.encode();

    // Step 2: Compute nullifier for each resource
    let nullifierHex: string | undefined;
    try {
      nullifierHex = normalizeHex(resource.nullifier(nullifierKey).toHex());
    } catch {
      console.warn("Couldn't nullify resource " + resourceProps.nonce);
    }

    if (nullifierHex) {
      // Step 3: Compare computed nullifier with indexer-provided nullifiers
      // Update the actual consumed status based on nullifier comparison
      const createdTransaction =
        transactionLookup.byTxHash.get(transactionHash);
      const consumedTransaction =
        transactionLookup.byNullifier.get(nullifierHex);
      const isConsumed = !!consumedTransaction;
      if (!onlyAvailableResources || !isConsumed) {
        updatedResources.push({
          ...resourceProps,
          isConsumed,
          erc20TokenAddress,
          forwarder,
          createdTransaction,
          consumedTransaction,
        });
      }
    }
  }

  return updatedResources;
};

/**
 * Finds the smallest subset of `resources` whose quantities sum exactly to
 * `targetQuantity`.
 *
 * Uses recursive subset-sum search; suitable for small resource sets (≤ ~20).
 * Returns `undefined` if no exact-sum combination exists.
 *
 * @param resources - Available encoded resources.
 * @param targetQuantity - The exact total quantity to match.
 * @returns The smallest subset that sums to `targetQuantity`, or `undefined` if
 *   no exact match is possible.
 */
export function findMinResourceQuantitySum(
  resources: EncodedResource[],
  targetQuantity: bigint
): EncodedResource[] | undefined {
  if (resources.length === 0) return undefined;

  let min: EncodedResource[] | undefined;
  for (let i = 0; i < resources.length; i++) {
    // If a quantity equals the targetQuantity, it is the shortest set of length 1
    if (resources[i].quantity === targetQuantity) return [resources[i]];

    // Recursively call on subset with sum adjusted for removed element
    const next = findMinResourceQuantitySum(
      resources.slice(i + 1),
      targetQuantity - resources[i].quantity
    );

    if (next) {
      if (min === undefined || next.length < min.length) {
        min = [resources[i], ...next];
      }
    }
  }
  return min;
}

/**
 * A collection of transfer resources with the amount to transfer.
 * NOTE: Amount may be less than resource quantity, in this case,
 * we have a split:
 */
export type TransferResourceWithAmount = [EncodedResource, bigint];
export type TransferResources = TransferResourceWithAmount[];

/**
 * Finds the single smallest resource whose quantity is greater than or equal to
 * `targetQuantity`, enabling fulfillment via an exact match or a split.
 *
 * Resources are sorted ascending by quantity before searching. When the match
 * quantity exceeds `targetQuantity`, the caller is expected to split the resource.
 *
 * @param resources - Available encoded resources.
 * @param targetQuantity - The amount to fulfill.
 * @returns A {@link TransferResourceWithAmount} tuple `[resource, targetQuantity]`
 *   if a single resource can cover the amount, otherwise `undefined`.
 */
export function findMinTransferResource(
  resources: EncodedResource[],
  targetQuantity: bigint
): TransferResourceWithAmount | undefined {
  // Sort by ascending quantity to find first resource which might fulfill targetQuantity
  const sortedResources = resources.sort((a, b) =>
    Number(a.quantity - b.quantity)
  );

  // return first matching resource which can provide target amount
  const match = sortedResources.find(
    ({ quantity }) => quantity >= targetQuantity
  );

  if (match) {
    return [match, targetQuantity];
  }
}
/**
 * Greedily combines resources (largest first) until their total covers
 * `targetQuantity`, using a split on the final resource if necessary.
 *
 * Call this only when no exact-sum subset exists. The last entry in the
 * returned array may have an amount less than its resource quantity, indicating
 * a split is needed.
 *
 * @param resources - Available encoded resources.
 * @param targetQuantity - The amount to fulfill.
 * @returns An ordered array of {@link TransferResourceWithAmount} tuples whose
 *   amounts sum to `targetQuantity`.
 */
export function findTransferResourcesWithSplit(
  resources: EncodedResource[],
  targetQuantity: bigint
): TransferResources {
  const transferResources: TransferResources = [];

  // Sort by descending quantity to find *fewest* number of resources for transfer
  const sortedResources = resources.sort((a, b) =>
    Number(b.quantity - a.quantity)
  );
  let missingQuantity = targetQuantity;
  for (let i = 0; i < sortedResources.length; i++) {
    const resource = resources[i];
    const quantity =
      missingQuantity < resource.quantity ? missingQuantity : resource.quantity;
    transferResources.push([resource, quantity]);
    missingQuantity -= quantity;
    if (missingQuantity === 0n) {
      // This is the last item we want, and is a split, so break
      break;
    }
  }

  return transferResources;
}

/**
 * Selects the optimal set of resources to fulfill a transfer of `targetQuantity`.
 *
 * The selection strategy (in priority order):
 * 1. A single resource with quantity ≥ `targetQuantity` (split if needed).
 * 2. The smallest subset of resources whose quantities sum exactly to `targetQuantity`.
 * 3. A greedy combination of resources (largest-first) with a final split.
 *
 * @param resources - Available spendable {@link EncodedResource} objects.
 * @param targetQuantity - The total amount to transfer (must be > 0).
 * @returns An ordered array of {@link TransferResourceWithAmount} tuples.
 * @throws {Error} If `resources` is empty or `targetQuantity` is zero.
 *
 * @example
 * ```typescript
 * const selected = selectTransferResources(appResources, 500_000n);
 * // selected is e.g. [[resource, 300_000n], [resource2, 200_000n]]
 * ```
 */
export const selectTransferResources = (
  resources: EncodedResource[],
  targetQuantity: bigint
): TransferResources => {
  if (resources.length === 0) {
    throw new Error("No resources provided!");
  }
  if (targetQuantity === 0n) {
    throw new Error("Must specify a quantity greater than 0");
  }

  // Check if a single resource can provide target amount
  const match = findMinTransferResource(resources, targetQuantity);

  if (match) {
    // Either a resource with matched quantity or a split resource
    return [match];
  }

  // Check if summing can provide target quantity
  const summedResources =
    findMinResourceQuantitySum(resources, targetQuantity) || [];

  if (summedResources.length > 0) {
    // Resources whose quantities sum to exact targetQuantity
    return summedResources.map(summedResource => [
      summedResource,
      summedResource.quantity,
    ]);
  }

  // Resources to sum plus a split resource
  return findTransferResourcesWithSplit(resources, targetQuantity);
};

/**
 * Merges multiple {@link Parameters} objects into a single one by concatenating
 * their `consumed_resources` and `created_resources` arrays in the order received.
 *
 * Use this when several independent operations (e.g. a fee transfer alongside a
 * main transfer) must be submitted to the backend as a single atomic request.
 *
 * @param parameters - Ordered array of {@link Parameters} objects to merge.
 * @returns A new {@link Parameters} whose resource lists are the union of all inputs.
 *
 * @example
 * ```typescript
 * const combined = mergeParameters([mainParams, feeParams]);
 * await backendClient.transfer(combined);
 * ```
 */
export const mergeParameters = (parameters: Parameters[]): Parameters =>
  parameters.reduce(
    (mergedParameters, parameters) => ({
      consumed_resources: [
        ...mergedParameters.consumed_resources,
        ...parameters.consumed_resources,
      ],
      created_resources: [
        ...mergedParameters.created_resources,
        ...parameters.created_resources,
      ],
    }),
    { consumed_resources: [], created_resources: [] }
  );
