import type {
  IndexerEVMTransaction,
  IndexerId,
  IndexerResource,
  IndexerTag,
} from "api";
import { getTokenByResource, tokenId } from "lib/tokenUtils";
import { formatBalance, fromHex, normalizeHex } from "lib/utils";
import type {
  AppResource,
  TokenId,
  TokenRegistryIndex,
  UserKeyring,
} from "types";
import { type Address, type Hex, formatUnits } from "viem";
import { NullifierKey, Resource, ResourceWithLabel } from "wasm";
import { InsufficientResourcesError } from "./errors";
import type {
  AggregatedTokenBalance,
  TransferResources,
  TransferResourceWithAmount,
} from "./types";

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
function deserializeResourcePayload(
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
 * 3. Attaches the associated transaction details.
 *
 * @param keyring - The caller's full {@link UserKeyring}; `nullifierKeyPair.nk` is
 *   used to compute nullifiers.
 * @param resources - Decrypted resource list (e.g. from {@link parseIndexerResourceResponse}).
 * @param transactionLookup - Pre-built lookup maps (see {@link buildTransactionLookup}).
 * @param onlyAvailableResources - When `true` (default), only unspent resources are
 *   returned. Set to `false` to include already-consumed resources.
 * @returns A promise resolving to an array of {@link AppResource} objects annotated
 *   with `isConsumed`, `erc20TokenAddress`, `forwarder`, and a transaction reference.
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
      const transaction = transactionLookup.byTxHash.get(transactionHash);
      const isConsumed = transactionLookup.byNullifier.has(nullifierHex);

      if (!onlyAvailableResources || !isConsumed) {
        updatedResources.push({
          ...resourceProps,
          isConsumed,
          erc20TokenAddress,
          forwarder,
          transaction,
        });
      }
    }
  }

  return updatedResources;
};

function omitSelectedFromRemaining(
  selected: TransferResourceWithAmount[],
  remaining: AppResource[]
): TransferResources {
  return {
    selected,
    remaining: remaining.filter(
      r => !selected.some(s => s.resource.rand_seed === r.rand_seed)
    ),
  };
}

/**
 * Finds the smallest subset of `resources` whose quantities sum exactly to
 * `targetQuantity`.
 *
 * Uses recursive subset-sum search; suitable for small resource sets (≤ ~20).
 * Returns `undefined` if no exact-sum combination exists.
 *
 * @param resources - Available app resources.
 * @param targetQuantity - The exact total quantity to match.
 * @returns The smallest subset that sums to `targetQuantity`, or `undefined` if
 *   no exact match is possible.
 */
function findMinResourceQuantitySum(
  resources: AppResource[],
  targetQuantity: bigint
): AppResource[] | undefined {
  if (resources.length === 0) return undefined;

  let min: AppResource[] | undefined;
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
 * Finds the single smallest resource whose quantity is greater than or equal to
 * `targetAmount`, enabling fulfillment via an exact match or a split.
 *
 * Resources are sorted ascending by quantity before searching. When the match
 * quantity exceeds `targetAmount`, the caller is expected to split the resource.
 *
 * @param resources - Available app resources.
 * @param targetAmount - The amount to fulfill.
 * @returns A `[TransferResourceWithAmount, remaining[]]` tuple if a single resource
 *   can cover the amount, otherwise `undefined`.
 */
function findMinTransferResource(
  resources: AppResource[],
  targetAmount: bigint
): [TransferResourceWithAmount, AppResource[]] | undefined {
  // Sort by ascending quantity to find first resource which might fulfill targetQuantity
  const sortedResources = [...resources].sort((a, b) =>
    Number(a.quantity - b.quantity)
  );
  // return first matching resource which can provide target amount
  const matchIndex = sortedResources.findIndex(
    ({ quantity }) => quantity >= targetAmount
  );

  if (matchIndex > -1) {
    const resource = sortedResources.splice(matchIndex, 1)[0];
    return [
      {
        resource,
        targetAmount,
      },
      sortedResources,
    ];
  }
}

/**
 * Greedily combines resources (largest first) until their total covers
 * `targetQuantity`, using a split on the final resource if necessary.
 *
 * Call this only when no exact-sum subset exists. The last entry in the
 * returned array may have a `targetAmount` less than its resource quantity,
 * indicating a split is needed.
 *
 * @param resources - Available app resources.
 * @param targetQuantity - The amount to fulfill.
 * @returns A `[selected[], remaining[]]` tuple whose selected amounts sum to `targetQuantity`.
 * @throws {@link InsufficientResourcesError} If the total available quantity is less than `targetQuantity`.
 */
function findTransferResourcesWithSplit(
  resources: AppResource[],
  targetQuantity: bigint
): [TransferResourceWithAmount[], AppResource[]] {
  const selected: TransferResourceWithAmount[] = [];
  const remaining: AppResource[] = [];

  // Sort by descending quantity to find *fewest* number of resources for transfer
  const sortedResources = resources.sort((a, b) =>
    Number(b.quantity - a.quantity)
  );
  let missingQuantity = targetQuantity;
  for (let i = 0; i < sortedResources.length; i++) {
    const resource = sortedResources[i];
    const quantity =
      missingQuantity < resource.quantity ? missingQuantity : resource.quantity;
    selected.push({ resource, targetAmount: quantity });
    missingQuantity -= quantity;
    if (missingQuantity === 0n) {
      // This is the last item we want, and is a split, so break
      remaining.push(...sortedResources.slice(i + 1));
      break;
    }
  }

  if (missingQuantity > 0) {
    throw new InsufficientResourcesError(
      targetQuantity,
      targetQuantity - missingQuantity
    );
  }

  return [selected, remaining];
}

/**
 * Selects the optimal set of resources to fulfill a transfer of `targetAmount`.
 *
 * The selection strategy (in priority order):
 * 1. A single resource with quantity ≥ `targetAmount` (split if needed).
 * 2. The smallest subset of resources whose quantities sum exactly to `targetAmount`.
 * 3. A greedy combination of resources (largest-first) with a final split.
 *
 * @param resources - Available spendable {@link AppResource} objects.
 * @param targetAmount - The total amount to transfer (must be > 0).
 * @returns A {@link TransferResources} object with `selected` and `remaining` arrays.
 * @throws {Error} If `resources` is empty or `targetAmount` is zero.
 * @throws {@link InsufficientResourcesError} If the available balance is insufficient.
 *
 * @example
 * ```typescript
 * const { selected, remaining } = selectTransferResources(appResources, 500_000n);
 * // selected[0].resource is the AppResource, selected[0].targetAmount is the amount to use
 * ```
 */
export const selectTransferResources = (
  resources: AppResource[],
  targetAmount: bigint
): TransferResources => {
  if (resources.length === 0) {
    throw new Error("No resources provided!");
  }
  if (targetAmount === 0n) {
    throw new Error("Must specify a quantity greater than 0");
  }

  // Check if a single resource can provide target amount
  const [match, unmatchedResources = resources] =
    findMinTransferResource(resources, targetAmount) ?? [];

  if (match) {
    // Either a resource with matched quantity or a split resource
    return {
      selected: [match],
      remaining: unmatchedResources,
    };
  }

  // Check if summing can provide target quantity
  const summedResources = findMinResourceQuantitySum(resources, targetAmount);

  if (summedResources) {
    return omitSelectedFromRemaining(
      summedResources.map(sr => ({
        resource: sr,
        targetAmount: sr.quantity,
      })),
      resources
    );
  }

  const [selected, remaining] = findTransferResourcesWithSplit(
    resources,
    targetAmount
  );
  return {
    selected,
    remaining,
  };
};

type TransactionResourceGroup = {
  tx: IndexerEVMTransaction;
  createdResources: AppResource[];
  consumedResources: AppResource[];
};

/**
 * Groups resources by their associated transaction ID.
 *
 * For each resource that has a `transaction`, the resource is classified as either
 * created or consumed (based on `isConsumed`) and placed into the corresponding
 * bucket of a {@link TransactionResourceGroup}. Resources without a transaction
 * are skipped.
 *
 * @param resources - The list of app resources to group.
 * @returns A map from {@link IndexerId} to its {@link TransactionResourceGroup},
 *   containing the transaction metadata and its created/consumed resources.
 */
export const groupResourcesByTransaction = (resources: AppResource[]) => {
  const transactionMap = new Map<IndexerId, TransactionResourceGroup>();
  resources?.forEach(resource => {
    const { transaction, isConsumed } = resource;

    if (transaction) {
      const entry = transactionMap.get(transaction.id);
      const createdResources = isConsumed ? [] : [resource];
      const consumedResources = isConsumed ? [resource] : [];

      if (entry) {
        entry.createdResources.push(...createdResources);
        entry.consumedResources.push(...consumedResources);
      } else {
        transactionMap.set(transaction.id, {
          tx: transaction,
          createdResources,
          consumedResources,
        });
      }
    }
  });
  return transactionMap;
};

export type AggregatedTokenBalancesOutput = {
  totalInUsd: number;
  balancesPerToken: Record<TokenId, AggregatedTokenBalance>;
  resources: AppResource[];
};

/**
 * Aggregates a flat list of resources into per-token balances with USD totals.
 *
 * Groups resources by their token (resolved via registry), sums raw quantities,
 * computes a USD total using the provided price map, and formats each balance
 * for display.
 *
 * @param resources - Decoded app resources (consumed or available).
 * @param registry - Token registry index for resolving resource → token.
 * @param prices - Map of ERC-20 address → USD price.
 * @returns Aggregated balances per token and a grand total in USD.
 */
export const aggregateTokenBalances = (
  resources: AppResource[],
  registry: TokenRegistryIndex,
  prices: Record<Address, number>
): AggregatedTokenBalancesOutput => {
  const output: AggregatedTokenBalancesOutput = {
    totalInUsd: 0,
    balancesPerToken: {},
    resources,
  };

  resources.forEach(item => {
    const token = getTokenByResource(registry, item);
    const id = tokenId(token);
    const amount = Number(formatUnits(item.quantity, token.decimals));

    const price = prices[item.erc20TokenAddress] ?? 0;
    output.totalInUsd += amount * price;

    const prev = output.balancesPerToken[id];
    output.balancesPerToken[id] = {
      raw: (prev?.raw ?? 0n) + item.quantity,
      formatted: "",
      token,
      resources: (prev?.resources ?? []).concat(item),
    };
  });

  for (const id of Object.keys(output.balancesPerToken) as TokenId[]) {
    const item = output.balancesPerToken[id];
    item.formatted = formatBalance(item.raw, item.token.decimals);
  }

  return output;
};
