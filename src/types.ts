import type { ApiConfig } from "api";
import {
  BaseMainnetChainId,
  BaseSepoliaChainId,
  EthereumSepoliaChainId,
} from "app-constants";
import type { Address } from "viem";
import type { EncodedResource } from "wasm";
export * from "domain/keys/types";
export * from "domain/transfer/types";
export * from "domain/vault/types";

export type ResourceBalance = {
  erc20TokenAddress: Address;
  forwarder: Address;
  label: string;
  quantity: bigint;
};

export type ResourcesWithBalance = {
  balances: ResourceBalance[];
  resources: EncodedResourceWithStatus[];
};

export type EncodedResourceWithStatus = EncodedResource & {
  isConsumed: boolean;
  erc20TokenAddress: Address;
  forwarder: Address;
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
  decimals: number;
  network: Network;
};

export type TokenBalance = {
  symbol: string;
  amount: bigint;
  network?: string;
};

export const chainIds = [
  EthereumSepoliaChainId,
  BaseMainnetChainId,
  BaseSepoliaChainId,
] as const;
export type SupportedChainId = (typeof chainIds)[number];
export type ChainSettings = {
  forwarderAddress: Address;
  chainId: SupportedChainId;
  network: Network;
  rpc?: string;
};

export type ChainLookup = Record<SupportedChainId, ChainSettings>;

export type Network =
  | "base-mainnet"
  | "base-sepolia"
  | "eth-sepolia"
  | "unknown";

/**
 * Represents the runtime configuration of Transfer Example
 */
export type Config = {
  permit2Address: Address;
  permit2DeadlineOffset: number;
  forwarderAddress: Address;
  backend: ApiConfig;
  indexer: ApiConfig;
  envio: ApiConfig;
  chain: ChainSettings;
};
