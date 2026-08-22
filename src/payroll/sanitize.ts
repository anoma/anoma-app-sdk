/** Leading characters that spreadsheet software interprets as a formula. */
const FORMULA_PREFIXES = new Set(["=", "+", "-", "@"]);

/**
 * Matches characters that are unsafe in free-text values:
 * - `<` / `>` — angle brackets (defense-in-depth against HTML/XSS sinks)
 * - `\p{Cc}` — C0/C1 control characters and DEL
 * - `\p{Cf}` — format characters, incl. zero-width chars and bidi overrides
 *   (U+202A–202E / U+2066–2069) that can be used for visual spoofing
 * - `\p{Zl}` / `\p{Zp}` — line and paragraph separators (U+2028 / U+2029)
 *
 * Regular spaces (`\p{Zs}`) are intentionally allowed.
 */
const UNSAFE_CHAR = /[<>\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;

/**
 * Strictly detects unsafe free-text values.
 *
 * Rejects values containing angle brackets or control/format/separator
 * characters, and values beginning with a spreadsheet formula prefix
 * (CSV injection). The formula check looks past leading whitespace.
 */
export const isUnsafeText = (value: string): boolean => {
  if (UNSAFE_CHAR.test(value)) return true;
  const first = value.trimStart()[0];
  return first !== undefined && FORMULA_PREFIXES.has(first);
};
