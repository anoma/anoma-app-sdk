import type { IndexerEVMTransaction, IndexerId } from "api";
import type { Address } from "viem";
import type { EncodedResource } from "wasm/armRisc0Bindings";
export * from "domain/keys/types";
export * from "domain/transfer/types";

export type SupportedChain = {
  id: number;
  network: string;
  forwarderAddress: Address;
  iconName: string;
  explorerUrl: string;
  explorerName: string;
};

export type AuthType = "wallet" | "passkey";

export type AppResource = EncodedResource & {
  erc20TokenAddress: Address;
  forwarder: Address;
  createdIn?: IndexerEVMTransaction;
  consumedIn?: IndexerEVMTransaction;
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
  timestamp: number;
};

export type TokenRegistry = {
  symbol: string;
  address: Address;
  decimals: number;
  network: string;
};

export type TokenBalance = {
  token: TokenRegistry;
  amount: bigint;
};

export type TokenId = `${string}:${string}`; // {network}:{symbol}
export type NetworkAddress = `${string}:${Address}`; // {network}:{address}

export type TokenRegistryIndex = {
  byTokenId: Record<TokenId, TokenRegistry>;
  byAddress: Record<NetworkAddress, TokenRegistry>;
};

export type Config = {
  permit2Address: Address;
  permit2DeadlineOffset: number;
  backendUrl: string;
  indexerUrl: string;
  envioUrl: string;
  chain: SupportedChain;
};
