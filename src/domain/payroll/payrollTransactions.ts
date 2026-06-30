import { decryptJson, encryptJson } from "lib/encryptedJson";
import { buildBigIntReviver } from "lib/utils";
import type { Hex } from "viem";
import type {
  DecryptedPayroll,
  PayrollTransactionEntry,
  PayrollTransactionMetadata,
} from "./types";

// Bigints are revived by key name across the whole graph: `usdQuantity` and
// `tokenQuantity` live on each nested PayrollRecipient (see ./types), while
// `tokenTotal`/`usdTotal` (totals) and `amount` (fee) are transaction-level.
// `token` is excluded — it is an object, so reviving its key as a bigint would
// corrupt it; the fee bigint is named `amount` to avoid that collision.
const reviveMetadata = buildBigIntReviver([
  "usdQuantity",
  "tokenQuantity",
  "tokenTotal",
  "usdTotal",
  "amount",
]);

/**
 * Adds an entry to a run, replacing any prior one with the same tx hash. The
 * replacement is appended at the end, so order is not preserved on replace.
 */
export const upsertTransaction = (
  transactions: PayrollTransactionEntry[],
  entry: PayrollTransactionEntry
): PayrollTransactionEntry[] => [
  ...transactions.filter(t => t.txHash !== entry.txHash),
  entry,
];

/** Flattens decrypted payrolls into a `txHash -> payroll uuid` lookup. */
export const buildTxHashMap = (
  payrolls: DecryptedPayroll[]
): Map<Hex, string> => {
  const map = new Map<Hex, string>();
  for (const payroll of payrolls) {
    for (const { txHash } of payroll.transactions) {
      map.set(txHash, payroll.id);
    }
  }
  return map;
};

/** Decrypts a stored payroll blob, reviving its bigint fields. */
export const decryptPayroll = (
  storageKey: Uint8Array<ArrayBuffer>,
  encrypted: string
): Promise<PayrollTransactionMetadata> =>
  decryptJson<PayrollTransactionMetadata>(
    storageKey,
    encrypted,
    reviveMetadata
  );

/**
 * Merges `entry` into a run's existing encrypted blob and re-encrypts it. Throws
 * if the existing blob can't be decrypted, so a corrupt read aborts the append
 * rather than overwriting the run's other transactions.
 */
export const mergeEncryptedRun = async (
  storageKey: Uint8Array<ArrayBuffer>,
  existingEncrypted: string | undefined,
  entry: PayrollTransactionEntry
): Promise<string> => {
  const transactions =
    existingEncrypted ?
      (await decryptPayroll(storageKey, existingEncrypted)).transactions
    : [];
  return encryptJson(storageKey, {
    transactions: upsertTransaction(transactions, entry),
  });
};
