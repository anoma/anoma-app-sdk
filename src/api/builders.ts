import { normalizeHex } from "lib/utils";
import type { Address } from "viem";
import type {
  IndexerEVMTransaction,
  IndexerId,
  NullifierRecord,
} from "./types";

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
 * normalized to a canonical `0x`-prefixed lowercase form. Takes a prebuilt
 * IndexerEVMTransaction so a batch of nullifiers from the same transaction can
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
