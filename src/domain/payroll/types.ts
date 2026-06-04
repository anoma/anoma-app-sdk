import type { TokenRegistry } from "types";

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

export const REQUIRED_COLUMNS = [
  "name",
  "category",
  "address",
  "network",
  "token",
  "usd",
] as const;

export const ALLOWED_COLUMNS = new Set<string>([...REQUIRED_COLUMNS, "uuid"]);
