import type {
  IndexerEVMTransaction,
  IndexerId,
  NetworkConfigurationResponse,
} from "api";
import type { UserPublicKeys } from "types";
import type { Address } from "viem";
import type { EncodedResource } from "wasm";
export * from "domain/keys/types";
export * from "domain/transfer/types";

export type AuthType = "wallet" | "passkey";

export type Network = string;
export type TokenId = `${string}:${string}`; // {network}:{symbol}
export type NetworkAddress = `${Network}:${Address}`; // {network}:{address}

export type AppResource = EncodedResource & {
  network: Network;
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

export type TokenBalance = {
  token: TokenRegistry;
  amount?: bigint;
  amountInUsd?: number;
};

export type TokenRegistry = {
  address: Address;
  decimals: number;
  name: string;
  symbol: string;
  network: string;
  feeEnabled: boolean;
};

export type SupportedChainConfig = Omit<
  NetworkConfigurationResponse,
  | "chain"
  | "feeDiscoveryPk"
  | "feeEncryptionPk"
  | "feeAuthorityPk"
  | "feeNullifierKeyCommitment"
  | "tokens"
> & {
  network: Network;
  tokens: TokenRegistry[];
  feePublicKeys: UserPublicKeys;
  explorerUrl?: string;
  explorerName?: string;
};
