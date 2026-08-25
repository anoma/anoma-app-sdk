import type { AppResource, TokenRegistry } from "types";
import type { Hex } from "viem";

/**
 * A collection of transfer resources with the amount to transfer.
 * NOTE: Amount may be less than resource quantity, in this case,
 * we have a split:
 */
export type TransferResourceWithAmount = {
  resource: AppResource;
  targetAmount: bigint;
};

export type AggregatedTokenBalance = {
  raw: bigint;
  formattedRounded: string;
  formatted: string;
  amountInUsd: number;
  token: TokenRegistry;
  resources: AppResource[];
};

/**
 * An encrypted resource payload handed to {@link deserializeResourcesPayload},
 * with the transaction it arrived in. Deliberately not the indexer's JSON
 * shape: transports own their own wire formats and map into this.
 */
export type EncryptedResource = {
  payload: Hex;
  transactionHash: string;
  chainId: number;
};
