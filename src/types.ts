import type { IndexerEVMTransaction, IndexerId } from "api";
import type { Address } from "viem";
import type { EncodedResource } from "wasm";
import {
  BaseMainnetChainId,
  EthereumMainnetChainId,
  EthereumSepoliaChainId,
} from "./lib-constants";
export * from "domain/keys/types";
export * from "domain/transfer/types";

/** The authentication method used to derive the user keyring. */
export type AuthType = "wallet" | "passkey";

/**
 * A decoded, on-chain-validated resource augmented with balance and
 * transaction metadata.
 *
 * Extends the WASM {@link EncodedResource} with:
 * - `isConsumed` — whether the resource has already been spent.
 * - `erc20TokenAddress` — the ERC-20 contract this resource represents.
 * - `forwarder` — the forwarder contract that handled the original deposit.
 * - `createdTransaction` — the EVM transaction that created the resource, if known.
 * - `consumedTransaction` — the EVM transaction that consumed the resource, if spent.
 *
 * Returned by {@link openResourceMetadata}.
 */
export type AppResource = EncodedResource & {
  isConsumed: boolean;
  erc20TokenAddress: Address;
  forwarder: Address;
  createdTransaction?: IndexerEVMTransaction;
  consumedTransaction?: IndexerEVMTransaction;
};

/**
 * All possible lifecycle states of a user-facing transaction.
 *
 * States progress as follows:
 * - Deposit:  `depositing` → `deposited`
 * - Transfer: `sending` → `sent` → `waiting-receiver` → `receiving` → `received`
 * - Withdraw: `withdrawing` → `withdraw`
 */
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

/** Union of all valid transaction status strings. */
export type TransactionStatus = (typeof TRANSACTION_STATUS)[number];

/**
 * A user-facing receipt for a completed or in-progress Anoma Pay transaction.
 */
export type TransactionReceipt = {
  /** Indexer-assigned identifier `{chainId}_{address}`. */
  id: IndexerId;
  /** On-chain EVM transaction hash. */
  hash: Address;
  /** Current lifecycle status of the transaction. */
  status: TransactionStatus;
  /** The token transferred. */
  token: TokenRegistry;
  /** Amount transferred, in the token's base unit. */
  quantity: bigint;
  /** Timestamp of the transaction. */
  dateTime: Date;
};

/**
 * Describes a supported ERC-20 token on a specific network.
 */
export type TokenRegistry = {
  /** Ticker symbol (e.g. `"USDC"`). */
  symbol: string;
  /** ERC-20 contract address. */
  address: Address;
  /** Number of decimal places (e.g. `6` for USDC). */
  decimals: number;
  /** The network this token lives on. */
  network: Network;
};

/**
 * A token together with its spendable balance for the current user.
 */
export type TokenBalance = {
  token: TokenRegistry;
  /** Balance in the token's base unit (before applying `decimals`). */
  amount: bigint;
};

/** All EVM chain IDs supported by the Anoma Pay protocol. */
export const chainIds = [
  EthereumMainnetChainId,
  EthereumSepoliaChainId,
  BaseMainnetChainId,
] as const;

/** Union type of the numeric chain IDs supported by Anoma Pay. */
export type SupportedChainId = (typeof chainIds)[number];

/** Per-chain configuration required to interact with the forwarder contract. */
export type ChainSettings = {
  /** Address of the Anoma Pay forwarder contract on this chain. */
  forwarderAddress: Address;
  /** EVM numeric chain ID. */
  chainId: SupportedChainId;
  /** Human-readable network name. */
  network: Network;
};

/** Mapping from chain ID to its {@link ChainSettings}. */
export type ChainLookup = Record<SupportedChainId, ChainSettings>;

/** Human-readable network identifier used throughout the SDK. */
export type Network = "base" | "ethereum" | "ethereum-sepolia" | "unknown";

/** Composite key identifying a token by network and symbol: `"{network}:{symbol}"`. */
export type TokenId = `${Network}:${string}`;

/** Composite key identifying a contract by network and address: `"{network}:{address}"`. */
export type NetworkAddress = `${Network}:${Address}`;

/**
 * Dual-index registry of {@link TokenRegistry} entries for fast lookup by
 * both token ID and network-scoped contract address.
 */
export type TokenRegistryIndex = {
  byTokenId: Record<TokenId, TokenRegistry>;
  byAddress: Record<NetworkAddress, TokenRegistry>;
};

/**
 * Runtime configuration for an Anoma Pay SDK integration.
 *
 * Typically loaded from environment variables at application startup and
 * passed to client/service constructors.
 */
export type Config = {
  /** Address of the Permit2 contract used for ERC-20 approvals. */
  permit2Address: Address;
  /** Seconds added to `block.timestamp` for Permit2 deadline calculation. */
  permit2DeadlineOffset: number;
  /** Address of the Anoma Pay forwarder contract for the active chain. */
  forwarderAddress: Address;
  /** Base URL of the proving backend. */
  backendUrl: string;
  /** Base URL of the resource indexer. */
  indexerUrl: string;
  /** Base URL of the Envio data API. */
  envioUrl: string;
  /** Active chain settings. */
  chain: ChainSettings;
};
