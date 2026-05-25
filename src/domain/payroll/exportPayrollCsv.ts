import { encodePayAddress } from "lib/payAddress";
import Papa from "papaparse";
import type { TokenRegistry } from "types";
import type { PayrollRecipient } from "./types";

/** Columns emitted, matching the import schema's expected header (and order). */
const COLUMNS = [
  "uuid",
  "name",
  "category",
  "address",
  "network",
  "token",
  "usd",
] as const;

/** Inverse of the schema's `usdCents` parser: integer cents to a plain dollar string. */
const usdCentsToString = (cents: bigint): string => {
  const whole = cents / 100n;
  const frac = cents % 100n;
  return frac === 0n ?
      `${whole}`
    : `${whole}.${frac.toString().padStart(2, "0")}`;
};

/**
 * Serializes payroll recipients into the semicolon-delimited CSV import format,
 * so an exported file can be re-imported via {@link importPayrollCsv}. Each
 * recipient's `id` is written as the `uuid` column to preserve identity on
 * round-trip; `usdQuantity` (cents) is rendered back to a dollar string.
 */
export const exportPayrollCsv = (recipients: PayrollRecipient[]): string =>
  Papa.unparse(
    {
      fields: [...COLUMNS],
      data: recipients.map(r => [
        r.id,
        r.name,
        r.category,
        r.address,
        r.token.network,
        r.token.symbol,
        usdCentsToString(r.usdQuantity),
      ]),
    },
    { delimiter: ";" }
  );

/** A syntactically valid (CRC-correct) placeholder AnomaPay address for examples. */
const exampleAddress = (): string =>
  encodePayAddress({
    authorityPublicKey: new Uint8Array(33),
    discoveryPublicKey: new Uint8Array(33),
    encryptionPublicKey: new Uint8Array(33),
    nullifierKeyCommitment: new Uint8Array(32),
  });

const EXAMPLE_TOKEN: TokenRegistry = {
  symbol: "usdc",
  network: "bsc",
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
  name: "USD Coin",
  feeEnabled: true,
};

/**
 * Builds a small, importable example file (blank `uuid`s to show the column is
 * optional). Reuses {@link exportPayrollCsv} so the example always matches the
 * exact format the importer accepts.
 */
export const buildPayrollCsvExample = (): string => {
  const address = exampleAddress();
  const base = {
    address,
    token: EXAMPLE_TOKEN,
    tokenQuantity: 0n,
  };
  return exportPayrollCsv([
    {
      ...base,
      id: "",
      name: "Alice",
      category: "Engineering",
      usdQuantity: 500000n,
    },
    { ...base, id: "", name: "Bob", category: "Design", usdQuantity: 250050n },
  ]);
};
