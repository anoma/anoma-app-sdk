import { isValidPayAddress } from "lib/payAddress";
import { isUnsafeText } from "lib/sanitize";
import { findTokenBySymbol } from "lib/tokenUtils";
import type { TokenRegistry } from "types";
import z from "zod";
import type { PayrollRecipient } from "./types";

/** Positive number with up to two decimal places. */
const twoDecimalCasesRegex = /^\d+(\.\d{1,2})?$/;
const trimmed = () => z.string().trim();

/** Trimmed free-text field that is required and safe against XSS / CSV injection. */
const freeText = (label: string) =>
  trimmed()
    .transform(s => s.trim())
    .refine(s => s.length > 0, { message: `${label} is required` })
    .refine(s => !isUnsafeText(s), {
      message: `${label} contains disallowed characters`,
    });

/** Trimmed USD string (max 2 decimals) parsed into positive integer cents. */
const usdCents = z
  .string()
  .trim()
  .regex(
    twoDecimalCasesRegex,
    "USD must be a positive number with up to 2 decimals"
  )
  // String-based conversion to integer cents avoids floating-point rounding.
  .transform(value => {
    const [whole, frac = ""] = value.split(".");
    return BigInt(whole) * 100n + BigInt(frac.padEnd(2, "0") || "0");
  })
  .pipe(z.bigint().positive("USD must be greater than zero"));

/**
 * Builds the zod schema for a single CSV row. Closes over the token registry so
 * `network`/`token` can be resolved to a canonical {@link TokenRegistry}. The
 * optional `uuid` is format-checked here, but duplicate detection across rows is
 * handled statefully by the caller.
 */
export const buildRowSchema = (supportedTokens: TokenRegistry[]) => {
  const supportedNetworks = new Set(
    supportedTokens.map(t => t.network.toLowerCase())
  );

  return z
    .object({
      // Optional: the column may be absent (undefined) or an empty cell, both
      // of which normalize to undefined and skip the uuid format check.
      uuid: trimmed()
        .optional()
        .transform(v => (v === "" ? undefined : v))
        .pipe(z.uuid("Invalid uuid").optional()),
      name: freeText("Name"),
      category: freeText("Category"),
      address: trimmed()
        .transform(s => s.trim())
        .refine(isValidPayAddress, { message: "Invalid AnomaPay address" }),
      network: trimmed().transform(s => s.trim()),
      token: trimmed().transform(s => s.trim()),
      usd: usdCents,
    })
    .transform((row, ctx) => {
      // Validation and token resolution happen together so the resolved
      // `TokenRegistry` is in scope here; `z.NEVER` halts the pipeline on failure.
      if (!supportedNetworks.has(row.network.toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          path: ["network"],
          message: `Unsupported network: ${row.network || "(empty)"}`,
        });
        return z.NEVER;
      }

      const token = findTokenBySymbol(supportedTokens, row.network, row.token);
      if (!token) {
        ctx.addIssue({
          code: "custom",
          path: ["token"],
          message: `Unsupported token "${row.token}" on ${row.network}`,
        });
        return z.NEVER;
      }

      return {
        uuid: row.uuid,
        name: row.name,
        category: row.category,
        address: row.address,
        token,
        usdQuantity: row.usd,
      };
    });
};

/**
 * Validates an in-memory {@link PayrollRecipient} (after its price-derived
 * `tokenQuantity` is known). Unlike {@link buildRowSchema}, which parses raw CSV
 * strings, this checks the recipient as edited in the payroll grid: a valid pay
 * address and a positive USD amount that resolved to a token quantity.
 */
export const payrollRecipientSchema = z
  .object({
    address: z.string().refine(isValidPayAddress, {
      message: "Invalid AnomaPay address",
    }),
    usdQuantity: z.bigint().positive("Amount must be greater than zero"),
    tokenQuantity: z.bigint(),
  })
  // `tokenQuantity` is price-derived, so only flag it once a USD amount exists;
  // a zero amount already surfaces its own error above.
  .refine(r => r.usdQuantity <= 0n || r.tokenQuantity > 0n, {
    path: ["tokenQuantity"],
    message: "Token price unavailable",
  });

/**
 * Returns human-readable validation messages for a recipient, or an empty array
 * when the recipient is valid. Intended for surfacing inline errors in the UI.
 */
export const getRecipientErrors = (recipient: PayrollRecipient): string[] => {
  const result = payrollRecipientSchema.safeParse(recipient);
  return result.success ? [] : result.error.issues.map(issue => issue.message);
};

/** Message shown when a recipient's token amount exceeds the held balance. */
export const INSUFFICIENT_FUNDS_ERROR = "Insufficient funds";

/**
 * Returns an insufficient-funds error when the recipient's token amount exceeds
 * `heldAmount` (the balance held for its token). Returns `undefined` while
 * balances are still loading — to avoid a false negative — or when funds suffice.
 * Kept separate from {@link getRecipientErrors} because it depends on live
 * balances rather than the recipient's own fields.
 */
export const getInsufficientFundsError = (
  recipient: PayrollRecipient,
  heldAmount: bigint,
  balancesLoaded: boolean
): string | undefined => {
  if (!balancesLoaded) return undefined;
  if (recipient.tokenQuantity > 0n && recipient.tokenQuantity > heldAmount) {
    return INSUFFICIENT_FUNDS_ERROR;
  }
  return undefined;
};
