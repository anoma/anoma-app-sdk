import type { Address, Hex } from "viem";
import { normalizeHex } from "./primitives";

/**
 * Indexer vocabulary the domain itself speaks: the transactions and nullifiers
 * it reasons about, and the raw resource payload it decodes. These stay in the
 * SDK rather than the transport layer because resource selection, transfer and
 * history all depend on them. The HTTP response envelopes that carry them
 * belong to the api package, which composes these types.
 */

/** Composite indexer id for a transaction: `{chainId}_{txHash}`. */
export type IndexerId = `${number}_${Address}`;

export type IndexerEVMTransaction = {
  id: IndexerId;
  chainId: number;
  txHash: Address;
  timestamp: number;
};

export type IndexerTransaction = {
  id: IndexerId;
  evmTransaction: IndexerEVMTransaction;
};

export type NullifierRecord = {
  id: IndexerId;
  nullifier: Hex;
  transaction: IndexerTransaction;
};

/** Builds the indexer's composite id for a transaction: `{chainId}_{txHash}`. */
export const buildIndexerId = (chainId: number, txHash: Address): IndexerId =>
  `${chainId}_${txHash}`;

/** Builds an IndexerEVMTransaction from its parts, deriving the composite id. */
export const buildEvmTransaction = (
  chainId: number,
  txHash: Address,
  timestamp: number
): IndexerEVMTransaction => ({
  id: buildIndexerId(chainId, txHash),
  chainId,
  txHash,
  timestamp,
});

/**
 * Builds a NullifierRecord for a just-consumed tag. The raw nullifier hex is
 * normalized to canonical `0x`-prefixed lowercase form. Takes a prebuilt
 * IndexerEVMTransaction so batch nullifiers from the same transaction can
 * share one instance.
 */
export const buildNullifierRecord = (
  nullifier: string,
  evmTransaction: IndexerEVMTransaction
): NullifierRecord => ({
  id: evmTransaction.id,
  nullifier: `0x${normalizeHex(nullifier)}`,
  transaction: { id: evmTransaction.id, evmTransaction },
});
