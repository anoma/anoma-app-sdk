import type { EncodedResource } from "@anomaorg/arm-bindings";
import type { Address } from "viem";
import type { UserPublicKeys } from "./keys/types";
export * from "./keys/types";
export * from "./transfer/types";

export type Network = string;
export type TokenId = `${string}:${string}`; // {network}:{symbol}
export type NetworkAddress = `${Network}:${Address}`; // {network}:{address}

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type AppResource = EncodedResource & {
  chainId: number;
  network: Network;
  erc20TokenAddress: Address;
  forwarder: Address;
};

export type TokenBalance = {
  token: TokenRegistry;
  amount?: bigint;
  amountInUsd?: number;
};

/** Swap providers a token can be sold through. Only bebop today. */
export type SwapProvider = "bebop";

export type TokenRegistry = {
  address: Address;
  decimals: number;
  name: string;
  symbol: string;
  network: string;
  feeEnabled: boolean;
  apy?: number | null;
  swapProviders?: SwapProvider[];
};

export interface WalletBalance {
  address: Address;
  network: Network;
  value: bigint;
  decimals: number;
  symbol: string;
}

/**
 * A chain the app supports, as the domain sees it. Spelled out rather than
 * derived from the backend's NetworkConfigurationResponse: that response is a
 * wire format owned by the api package, and the domain must not depend on it.
 * The api package maps one into the other.
 */
export type SupportedChainConfig = {
  chainId: number;
  enabled: boolean;
  testnet: boolean;
  protocolAdapterAddress: Address;
  trivialLogicVerifyingKey: string;
  transferLogicVerifyingKey: string;
  forwarderAddress: Address;
  percentageFee: number;
  baseFee: number;
  resourceFee: number;
  genericCallForwarderAddress: Address;
  genericCallLogicVerifyingKey: string;
  network: Network;
  networkName?: string;
  tokens: TokenRegistry[];
  feePublicKeys: UserPublicKeys;
  explorerUrl?: string;
  explorerName?: string;
};
