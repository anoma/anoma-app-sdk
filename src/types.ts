import type { ApiConfig } from "api";
import type { Address } from "viem";
import type { ResourceWithLabel } from "wasm";

export * from "domain/crypto/types";
export * from "domain/keys/types";
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
  resourceWithLabel: ResourceWithLabel;
  tag: string;
  isConsumed: boolean;
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

export type TokenRegistry = {
  symbol: string;
  address: Address;
  label: string;
  decimals: number;
  network: string;
};

export type TokenBalance = {
  symbol: string;
  amount: bigint;
  network?: string;
};

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
