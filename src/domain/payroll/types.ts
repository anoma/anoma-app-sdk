import type { TokenRegistry } from "types";
import type { Hex } from "viem";

/** A payroll payment line for a single recipient. */
export type PayrollRecipient = {
  id: string;
  name: string;
  category: string;
  address: string;
  token: TokenRegistry;
  /** USD amount in integer cents. */
  usdQuantity: bigint;
  /** Token amount in minimal denomination, derived from price. */
  tokenQuantity: bigint;
};

/** A recipient parsed from CSV before its price-derived `tokenQuantity` is known. */
export type ParsedPayrollRecipient = Omit<PayrollRecipient, "tokenQuantity">;

/** A single CSV validation failure. `row` is 1-based; 0 means a file-level error. */
export type CsvRowError = {
  row: number;
  column?: string;
  message: string;
};

/** Result of importing a payroll CSV. */
export type CsvImportResult =
  | { ok: true; recipients: ParsedPayrollRecipient[] }
  | { ok: false; errors: CsvRowError[] };

/**
 * One on-chain transaction within a payroll run (a payroll splits into one
 * transaction per token). `fee.usd` is omitted when no price feed was available,
 * so an unknown fee is never recorded as $0.
 */
export type PayrollTransactionEntry = {
  txHash: Hex;
  recipients: PayrollRecipient[];
  totals: { tokenTotal: bigint; usdTotal: bigint };
  fee: { amount: bigint; usd?: number };
};

/** A payroll run: its per-token transactions, keyed in the store by a uuid. */
export type PayrollTransactionMetadata = {
  transactions: PayrollTransactionEntry[];
};

/** A decrypted payroll run tagged with its store key (the run uuid in `id`). */
export type DecryptedPayroll = PayrollTransactionMetadata & { id: string };

export const REQUIRED_COLUMNS = [
  "name",
  "category",
  "address",
  "network",
  "token",
  "usd",
] as const;

export const ALLOWED_COLUMNS = new Set<string>([...REQUIRED_COLUMNS, "uuid"]);
