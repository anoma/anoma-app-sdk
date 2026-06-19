import {
  buildEvmTransaction,
  type IndexerEVMTransaction,
  type IndexerResource,
  type NullifierRecord,
  type NullifyingTransactionsResponse,
} from "api";
import { getFiatAmount, getTokenByResource, tokenId } from "lib/tokenUtils";
import {
  formatBalance,
  formatTokenAmount,
  fromHex,
  normalizeHex,
} from "lib/utils";
import type {
  AppResource,
  NetworkAddress,
  SupportedChainConfig,
  TokenId,
  TokenRegistry,
} from "types";
import type { Address, Hex } from "viem";
import {
  type EncodedResource,
  NullifierKey,
  Resource,
  ResourceWithLabel,
} from "wasm";
import { InsufficientResourcesError } from "./errors";
import { selectUTXOs } from "./selectUTXOs";
import type {
  AggregatedTokenBalance,
  TransferResourceWithAmount,
} from "./types";

type TransactionLookup = {
  /** Nullifier hash → the transaction that consumed it (a resource's `consumedIn`). */
  byNullifier: Map<string, IndexerEVMTransaction>;
  /** Transaction hash → transaction, used to enrich a resource's `createdIn`. */
  byTxHash: Map<Address, IndexerEVMTransaction>;
};

type ResourceWithDetails = {
  resource: Resource;
  /** Cached `resource.encode()` — encoding crosses the wasm boundary, so do it once. */
  encoded: EncodedResource;
  forwarder: Address;
  erc20TokenAddress: Address;
  transactionHash: string;
};

export type ResourceWithNullifier = ResourceWithDetails & {
  /** Hex nullifier (tag) for this resource. */
  nullifierHex: string;
};

/**
 * Indexes the user's nullifying transactions by nullifier hash (`consumedIn`)
 * and by transaction hash (`createdIn` enrichment). Optimistic consumed tags
 * (just-spent, not yet indexed) are merged last so they take precedence.
 */
export function buildTransactionLookup(
  response: NullifyingTransactionsResponse
): TransactionLookup {
  const byNullifier = new Map<string, IndexerEVMTransaction>();
  const byTxHash = new Map<Address, IndexerEVMTransaction>();

  for (const { chain_id, nullifiers } of response) {
    for (const { tag, transaction_hash, timestamp } of nullifiers) {
      const txHash: Address = `0x${normalizeHex(transaction_hash)}`;
      const evmTransaction = buildEvmTransaction(chain_id, txHash, timestamp);
      byNullifier.set(normalizeHex(tag), evmTransaction);
      byTxHash.set(txHash, evmTransaction);
    }
  }

  return { byNullifier, byTxHash };
}

/**
 * Merges the just-spent (optimistic) tags into the indexer lookup so the spent
 * resources are masked immediately, and reports which optimistic tags are now
 * stale and can be dropped from storage.
 *
 * A tag is stale once its optimistic mask is no longer needed, which happens
 * when any of these hold:
 *  - the indexer now reports the nullifier as consumed (it caught up); or
 *  - the resource has dropped out of `knownTags` entirely, so it can't surface
 *    as available regardless (the indexer removed it from the resource set);
 *
 * @param knownTags Nullifiers of the user's currently-known resources. Pass the
 *   live decoded tags so a tag whose resource is gone gets cleaned up; when
 *   empty the "resource gone" check is skipped (nothing to compare against).
 */
export function buildOptimisticTransactionLookup(
  transactionLookup: TransactionLookup,
  optimisticConsumedTags: NullifierRecord[],
  knownTags: Iterable<string> = []
): TransactionLookup & { staleOptimisticTags: NullifierRecord[] } {
  const output = {
    byNullifier: new Map(transactionLookup.byNullifier),
    byTxHash: new Map(transactionLookup.byTxHash),
  };

  const staleOptimisticTags: NullifierRecord[] = [];
  const known = new Set<string>();
  for (const tag of knownTags) known.add(normalizeHex(tag));
  const hasKnownTags = known.size > 0;

  for (const record of optimisticConsumedTags) {
    const { evmTransaction } = record.transaction;
    const hex = normalizeHex(record.nullifier);

    const isConfirmed = output.byNullifier.has(hex);
    const isResourceGone = hasKnownTags && !known.has(hex);

    if (isConfirmed || isResourceGone) {
      staleOptimisticTags.push(record);
      continue;
    }

    const txHash: Address = `0x${normalizeHex(evmTransaction.txHash)}`;
    output.byNullifier.set(hex, evmTransaction);
    output.byTxHash.set(txHash, evmTransaction);
  }

  return { ...output, staleOptimisticTags };
}

function deserializeResourcePayload(
  blobHex: Hex,
  encryptionPrivateKey: Uint8Array
): ResourceWithLabel {
  const payload = fromHex(blobHex);
  return ResourceWithLabel.fromEncrypted(payload, encryptionPrivateKey);
}

const tryToDeserializeResourcePayload = (
  encryptionPrivateKey: Uint8Array<ArrayBuffer>,
  indexerResource: IndexerResource
) => {
  try {
    return deserializeResourcePayload(
      indexerResource.resource_payload.blob,
      encryptionPrivateKey
    );
  } catch {
    return false;
  }
};

/** Decrypts and deserializes indexer resource payloads using the user's encryption key. */
export const deserializeResourcesPayload = async (
  encryptionPrivateKey: Uint8Array<ArrayBuffer>,
  resourceResponseCollection: IndexerResource[]
): Promise<ResourceWithDetails[]> => {
  return resourceResponseCollection.flatMap(item => {
    const payload = tryToDeserializeResourcePayload(encryptionPrivateKey, item);
    if (!payload) {
      return [];
    }
    return {
      resource: payload.resource,
      encoded: payload.resource.encode(),
      forwarder: payload.forwarder as Address,
      erc20TokenAddress: payload.erc20TokenAddress as Address,
      transactionHash: item.transaction_hash,
    };
  });
};

/** Filters out ephemeral resources, returning only persistent ones. */
export const pickNonEphemeralResources = (
  resources: ResourceWithDetails[]
): ResourceWithDetails[] => {
  return resources.filter(item => !item.encoded.is_ephemeral);
};

/**
 * Computes the nullifier (tag) for each resource. Resources whose nullifier
 * can't be derived are unusable downstream, so they are dropped (with a warning).
 */
export const attachNullifiers = (
  resources: ResourceWithDetails[],
  nullifierKey: NullifierKey
): ResourceWithNullifier[] => {
  return resources.flatMap(resourceWithDetails => {
    const { resource, encoded } = resourceWithDetails;
    try {
      const nullifierHex = normalizeHex(
        resource.nullifier(nullifierKey).toHex()
      );
      return { ...resourceWithDetails, nullifierHex };
    } catch {
      console.warn("Couldn't compute nullifier for resource " + encoded.nonce);
      return [];
    }
  });
};

/** Resolves consumption status for each resource, returning enriched AppResource entries. */
export const buildAppResources = (
  chainConfig: SupportedChainConfig[],
  resources: ResourceWithNullifier[],
  transactionLookup: TransactionLookup,
  onlyAvailableResources = true
): AppResource[] => {
  const forwarderChainMap = new Map(
    chainConfig.map(chain => [chain.forwarderAddress, chain])
  );
  const updatedResources: AppResource[] = [];

  for (const deserializedResource of resources) {
    const {
      encoded,
      erc20TokenAddress,
      forwarder,
      transactionHash,
      nullifierHex,
    } = deserializedResource;

    const chain = forwarderChainMap.get(forwarder);
    if (!chain) continue;

    const consumedIn = transactionLookup.byNullifier.get(nullifierHex);
    if (onlyAvailableResources && consumedIn) continue;

    // Resources created by the user's own nullifying transactions get the
    // indexed transaction; others (received/deposited) get a minimal record
    // with no real timestamp.
    const txHash: Address = `0x${normalizeHex(transactionHash)}`;
    const createdIn =
      transactionLookup.byTxHash.get(txHash) ??
      buildEvmTransaction(chain.chainId, txHash, 0);

    updatedResources.push({
      ...encoded,
      network: chain.network,
      erc20TokenAddress,
      forwarder,
      createdIn,
      consumedIn,
    });
  }

  return updatedResources;
};

/**
 * Determine what resources are needed to fulfill a transfer, either by exact
 * sum or by selecting resources and splitting the last one to cover the remainder.
 */
export const selectTransferResources = (
  resources: AppResource[],
  targetAmount: bigint
): TransferResourceWithAmount[] => {
  if (resources.length === 0) {
    throw new Error("No resources provided!");
  }
  if (targetAmount === 0n) {
    throw new Error("Must specify a quantity greater than 0");
  }

  const selected = selectUTXOs(resources, targetAmount);

  if (!selected) {
    const available = resources.reduce((sum, r) => sum + r.quantity, 0n);
    throw new InsufficientResourcesError(targetAmount, available);
  }

  const selectedSum = selected.reduce((sum, r) => sum + r.quantity, 0n);
  const overage = selectedSum - targetAmount;

  // selected is sorted descending; the last (smallest) resource absorbs the split
  return selected.map((r, i) => ({
    resource: r,
    targetAmount: i === selected.length - 1 ? r.quantity - overage : r.quantity,
  }));
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
  tokens: TokenRegistry[],
  prices: Record<NetworkAddress, number>
): AggregatedTokenBalancesOutput => {
  const output: AggregatedTokenBalancesOutput = {
    totalInUsd: 0,
    balancesPerToken: {},
    resources,
  };

  resources.forEach(item => {
    const token = getTokenByResource(tokens, item);
    const id = tokenId(token);

    const itemAmountInUsd = getFiatAmount(token, item.quantity, prices);
    output.totalInUsd += itemAmountInUsd;

    const prev = output.balancesPerToken[id];
    output.balancesPerToken[id] = {
      raw: (prev?.raw ?? 0n) + item.quantity,
      formattedRounded: "",
      formatted: "",
      amountInUsd: (prev?.amountInUsd ?? 0) + itemAmountInUsd,
      token,
      resources: (prev?.resources ?? []).concat(item),
    };
  });

  for (const id of Object.keys(output.balancesPerToken) as TokenId[]) {
    const item = output.balancesPerToken[id];
    item.formatted = formatBalance(item.raw, item.token.decimals);
    item.formattedRounded = formatTokenAmount(item.formatted, item.token, true);
  }

  return output;
};
