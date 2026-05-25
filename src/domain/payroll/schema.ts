import { isValidPayAddress } from "lib/payAddress";
import { isUnsafeText } from "lib/sanitize";
import { findTokenBySymbol } from "lib/tokenUtils";
import type { TokenRegistry } from "types";
import z from "zod";

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
