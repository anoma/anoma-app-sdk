import type { IndexerEVMTransaction, IndexerId } from "api";
import {
  BaseMainnetChainId,
  EthereumMainnetChainId,
  EthereumSepoliaChainId,
} from "lib-constants";
import type { Address } from "viem";
import type { EncodedResource } from "wasm";
export * from "domain/keys/types";
export * from "domain/transfer/types";

export type AuthType = "wallet" | "passkey";

export type AppResource = EncodedResource & {
  isConsumed: boolean;
  erc20TokenAddress: Address;
  forwarder: Address;
  transaction?: IndexerEVMTransaction;
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
  id: IndexerId;
  hash: Address;
  status: TransactionStatus;
  token: TokenRegistry;
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
export type NetworkAddress = `${Network}:${Address}`; // {network}:{address}

export type TokenRegistryIndex = {
  byTokenId: Record<TokenId, TokenRegistry>;
  byAddress: Record<NetworkAddress, TokenRegistry>;
};

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
