import type { Resource } from "@anoma/lib";
import type { ApiConfig } from "api";
import type { Address } from "viem";

export * from "domain/keys/types";
export * from "domain/crypto/types";
export * from "domain/transfer/types";

export type ResourceBalance = {
  label: string;
  quantity: bigint;
};

export type ResourcesWithBalance = {
  balances: ResourceBalance[];
  resources: ResourceWithMetadata[];
};

export type ResourceWithMetadata = {
  resource: Resource;
  tag: string;
  isConsumed: boolean;
};

export type TokenBalance = {
  tokenSymbol: string;
  amount: bigint;
  network?: string;
};

export const TRANSACTION_STATUS = [
  "sent",
  "sending",
  "waiting-receiver",
  "received",
  "receiving",
  "deposited",
  "depositing",
  "withdraw",
  "withdrawing",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUS)[number];

/**
 * Represents the runtime configuration of Transfer Example
 */
export type Config = {
  permit2Address: Address;
  permit2Deadline: number;
  forwarderAddress: Address;
  backend: ApiConfig;
  indexer: ApiConfig;
  envio: ApiConfig;
};
