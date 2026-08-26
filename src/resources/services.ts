import {
  type EncodedResource,
  NullifierKey,
  type Resource,
  ResourceWithLabel,
} from "@anomaorg/arm-bindings";
import { fromHex, normalizeHex } from "primitives";
import {
  formatBalance,
  formatTokenAmount,
  getFiatAmount,
  getTokenByResource,
  tokenId,
} from "tokens";
import type {
  AppResource,
  NetworkAddress,
  TokenId,
  TokenRegistry,
} from "types";
import type { Address, Hex } from "viem";
import { InsufficientResourcesError } from "./errors";
import { selectUTXOs } from "./selectUTXOs";
import type {
  AggregatedTokenBalance,
  EncryptedResource,
  TransferResourceWithAmount,
} from "./types";

type ResourceWithDetails = {
  resource: Resource;
  /** Cached `resource.encode()` — encoding crosses the wasm boundary, so do it once. */
  encoded: EncodedResource;
  forwarder: Address;
  erc20TokenAddress: Address;
  transactionHash: string;
  transactionTimestamp: number;
  chainId: number;
};

export type ResourceWithNullifier = ResourceWithDetails & {
  /** Hex nullifier (tag) for this resource. */
  nullifierHex: string;
};

function deserializeResourcePayload(
  blobHex: Hex,
  encryptionPrivateKey: Uint8Array
): ResourceWithLabel {
  const payload = fromHex(blobHex);
  return ResourceWithLabel.fromEncrypted(payload, encryptionPrivateKey);
}

const tryToDeserializeResourcePayload = (
  encryptionPrivateKey: Uint8Array<ArrayBuffer>,
  encryptedResource: EncryptedResource
) => {
  try {
    return deserializeResourcePayload(
      encryptedResource.payload,
      encryptionPrivateKey
    );
  } catch {
    return false;
  }
};

/** Decrypts and deserializes indexer resource payloads using the user's encryption key. */
export const deserializeResourcesPayload = async (
  encryptionPrivateKey: Uint8Array<ArrayBuffer>,
  resourceResponseCollection: EncryptedResource[]
): Promise<ResourceWithDetails[]> => {
  return resourceResponseCollection.flatMap(item => {
    const payload = tryToDeserializeResourcePayload(encryptionPrivateKey, item);
    if (!payload) {
      return [];
    }
    return {
      resource: payload.resource(),
      encoded: payload.resource().encode(),
      forwarder: payload.forwarder() as Address,
      erc20TokenAddress: payload.erc20TokenAddress() as Address,
      transactionHash: item.transactionHash,
      transactionTimestamp: item.transactionTimestamp,
      chainId: item.chainId,
    };
  });
};

/** Filters out ephemeral resources, returning only persistent ones. */
export const pickNonEphemeralResources = (
  resources: ResourceWithDetails[]
): ResourceWithDetails[] => {
  return resources.filter(item => !item.encoded.isEphemeral);
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
