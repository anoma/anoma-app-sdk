import type {
  IndexerEVMTransaction,
  IndexerResource,
  NullifierRecord,
} from "api";
import { buildForwarderNetworkMap } from "lib/chainUtils";
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
import { NullifierKey, Resource, ResourceWithLabel } from "wasm";
import { InsufficientResourcesError } from "./errors";
import { selectUTXOs } from "./selectUTXOs";
import type {
  AggregatedTokenBalance,
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
  transactionHash: string;
};

/** Creates lookup maps for transactions indexed by nullifier hash and transaction hash. */
export function buildTransactionLookup(
  nullifierRecordList: NullifierRecord[]
): TransactionLookup {
  const lookup: TransactionLookup = {
    byNullifier: new Map(),
    byTxHash: new Map(),
  };
  for (const data of nullifierRecordList) {
    lookup.byNullifier.set(
      normalizeHex(data.nullifier),
      data.transaction.evmTransaction
    );
    lookup.byTxHash.set(
      data.transaction.evmTransaction.txHash,
      data.transaction.evmTransaction
    );
  }
  return lookup;
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
export const parseIndexerResourceResponse = async (
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
  return resources.filter(item => !item.resource.encode().is_ephemeral);
};

/** Computes nullifiers and consumption status for each resource, returning enriched AppResource entries. */
export const buildAppResources = async (
  chainConfig: SupportedChainConfig[],
  resources: ResourceWithDetails[],
  transactionLookup: TransactionLookup,
  nullifierKey: NullifierKey,
  onlyAvailableResources = true
): Promise<AppResource[]> => {
  const forwarderNetworkMap = buildForwarderNetworkMap(chainConfig);
  const updatedResources: AppResource[] = [];

  for (const deserializedResource of resources) {
    const { resource, erc20TokenAddress, forwarder, transactionHash } =
      deserializedResource;

    const resourceProps = resource.encode();

    // Compute the nullifier for the resource
    let nullifierHex: string | undefined;
    try {
      nullifierHex = normalizeHex(resource.nullifier(nullifierKey).toHex());
    } catch {
      console.warn(
        "Couldn't compute nullifier for resource " + resourceProps.nonce
      );
    }

    const network = forwarderNetworkMap.get(forwarder);

    if (nullifierHex && network) {
      // Resolve creation and consumption transactions
      const createdInTxHash: Address = `0x${transactionHash.toLowerCase()}`;
      const createdIn = transactionLookup.byTxHash.get(createdInTxHash);
      const consumedIn = transactionLookup.byNullifier.get(nullifierHex);

      if (!createdIn) {
        console.warn("Resource missing createdIn", createdInTxHash);
      }

      if (!onlyAvailableResources || !consumedIn) {
        updatedResources.push({
          ...resourceProps,
          network,
          erc20TokenAddress,
          forwarder,
          createdIn,
          consumedIn,
        });
      }
    }
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
