import Papa from "papaparse";
import type { TokenRegistry } from "types";
import { buildRowSchema } from "./schema";
import type {
  CsvImportResult,
  CsvRowError,
  ParsedPayrollRecipient,
} from "./types";

const REQUIRED_COLUMNS = [
  "name",
  "category",
  "address",
  "network",
  "token",
  "usd",
] as const;

const ALLOWED_COLUMNS = new Set<string>([...REQUIRED_COLUMNS, "uuid"]);

/**
 * Parses and strictly validates a payroll CSV. On any failure the whole file is
 * rejected and every collected error is returned. `tokenQuantity` is intentionally
 * not produced here — it depends on live prices and is filled by the import hook.
 *
 * @param csvText - Raw CSV text (header row required, `;`-delimited).
 * @param supportedTokens - The backend token registry; supported networks are
 *   derived from it.
 */
export const importPayrollCsv = (
  csvText: string,
  supportedTokens: TokenRegistry[]
): CsvImportResult => {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    return {
      ok: false,
      errors: parsed.errors.map(e => ({
        row: typeof e.row === "number" ? e.row + 1 : 0,
        message: `Malformed CSV: ${e.message}`,
      })),
    };
  }

  // Header validation: all required present, no unknown columns.
  const fields = parsed.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter(c => !fields.includes(c));
  const unknown = fields.filter(c => !ALLOWED_COLUMNS.has(c));
  if (missing.length > 0 || unknown.length > 0) {
    const headerErrors: CsvRowError[] = [];
    if (missing.length)
      headerErrors.push({
        row: 0,
        message: `Missing required column(s): ${missing.join(", ")}`,
      });
    if (unknown.length)
      headerErrors.push({
        row: 0,
        message: `Unknown column(s): ${unknown.join(", ")}`,
      });
    return { ok: false, errors: headerErrors };
  }

  if (parsed.data.length === 0) {
    return { ok: false, errors: [{ row: 0, message: "CSV has no data rows" }] };
  }

  const rowSchema = buildRowSchema(supportedTokens);
  const errors: CsvRowError[] = [];
  const recipients: ParsedPayrollRecipient[] = [];
  const seenUuids = new Set<string>();

  parsed.data.forEach((raw, index) => {
    const rowNumber = index + 1;
    const result = rowSchema.safeParse(raw);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          row: rowNumber,
          column: issue.path.length ? String(issue.path[0]) : undefined,
          message: issue.message,
        });
      }
      return;
    }

    // The schema validated each `uuid`'s format; duplicate detection needs
    // cross-row state, so it lives here. A missing/blank uuid gets a fresh one.
    const { uuid, ...recipient } = result.data;
    let id: string = crypto.randomUUID();
    if (uuid) {
      if (seenUuids.has(uuid))
        errors.push({
          row: rowNumber,
          column: "uuid",
          message: `Duplicate uuid: ${uuid}`,
        });
      else seenUuids.add(uuid);
      id = uuid;
    }

    recipients.push({ id, ...recipient });
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, recipients };
};
