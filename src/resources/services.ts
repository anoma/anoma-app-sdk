import {
  type EncodedResource,
  NullifierKey,
  type Resource,
  ResourceWithLabel,
} from "@anomaorg/arm-bindings";
import { fromHex, normalizeHex, toBase64 } from "primitives";
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

/** Logic ref of v1 transfer resources; the backend migrates them to v2 on consume. */
export const LEGACY_TRANSFER_LOGIC_REF: Hex =
  "0xbc12323668c37c3d381ca798f11116f35fb1639d12239b29da7810df3985e7ad";

// EncodedResource carries logicRef as base64, so compare in that encoding.
const LEGACY_TRANSFER_LOGIC_REF_BASE64 = toBase64(
  fromHex(LEGACY_TRANSFER_LOGIC_REF)
);

export const isLegacyResource = (resource: AppResource): boolean =>
  resource.logicRef === LEGACY_TRANSFER_LOGIC_REF_BASE64;

/**
 * Most legacy resources one transfer spends ahead of the rest. Each consumed
 * resource costs gas, so spending every legacy one would make a small payment
 * from a large legacy balance arbitrarily expensive.
 */
export const MAX_PREFERRED_LEGACY_RESOURCES = 10;

const byQuantityDesc = (a: AppResource, b: AppResource) =>
  a.quantity < b.quantity ? 1
  : a.quantity > b.quantity ? -1
  : 0;

/**
 * Spends the largest legacy resources (up to the cap) before anything else, so
 * each operation migrates what it can. The rest, legacy and v2 alike, only
 * covers what those can't. Preferred resources come first and the
 * change-absorbing resource last.
 */
const selectPreferringLegacy = (
  resources: AppResource[],
  targetAmount: bigint
): AppResource[] | undefined => {
  const preferred = resources
    .filter(isLegacyResource)
    .sort(byQuantityDesc)
    .slice(0, MAX_PREFERRED_LEGACY_RESOURCES);
  const preferredSum = preferred.reduce((sum, r) => sum + r.quantity, 0n);
  if (preferredSum >= targetAmount) return selectUTXOs(preferred, targetAmount);

  const preferredSet = new Set(preferred);
  const rest = resources.filter(r => !preferredSet.has(r));
  const restSelected = selectUTXOs(rest, targetAmount - preferredSum);
  return restSelected && [...preferred, ...restSelected];
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

  const selected = selectPreferringLegacy(resources, targetAmount);

  if (!selected) {
    const available = resources.reduce((sum, r) => sum + r.quantity, 0n);
    throw new InsufficientResourcesError(targetAmount, available);
  }

  const selectedSum = selected.reduce((sum, r) => sum + r.quantity, 0n);
  const overage = selectedSum - targetAmount;

  // the last resource is the smallest of its selection, so it absorbs the split
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
