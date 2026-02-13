import {
  BaseMainnetChainId,
  EthereumMainnetChainId,
  EthereumSepoliaChainId,
} from "app-constants";
import type { Address } from "viem";
import type { EncodedResource } from "wasm";
export * from "domain/keys/types";
export * from "domain/transfer/types";
export * from "domain/vault/types";

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

export type TransactionReceipt = {
  hash: Address;
  status: TransactionStatus;
  sender: string;
  receiver: string;
  token: Address;
  quantity: bigint;
  dateTime: Date;
};

export type TokenRegistry = {
  symbol: string;
  address: Address;
  decimals: number;
  network: Network;
};

export type TokenBalance = {
  token: TokenRegistry;
  amount: bigint;
};

export const chainIds = [
  EthereumMainnetChainId,
  EthereumSepoliaChainId,
  BaseMainnetChainId,
] as const;
export type SupportedChainId = (typeof chainIds)[number];
export type ChainSettings = {
  forwarderAddress: Address;
  chainId: SupportedChainId;
  network: Network;
};

export type ChainLookup = Record<SupportedChainId, ChainSettings>;

export type Network = "base" | "ethereum" | "ethereum-sepolia" | "unknown";

export type TokenId = `${Network}:${string}`; // {network}:{symbol}

/**
 * Represents the runtime configuration of Transfer Example
 */
export type Config = {
  permit2Address: Address;
  permit2DeadlineOffset: number;
  forwarderAddress: Address;
  backendUrl: string;
  indexerUrl: string;
  envioUrl: string;
  chain: ChainSettings;
};
