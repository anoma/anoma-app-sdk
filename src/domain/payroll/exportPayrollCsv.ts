/** Columns emitted, matching the import schema's expected header (and order). */
export const COLUMNS = [
  "uuid",
  "name",
  "category",
  "address",
  "network",
  "token",
  "usd",
] as const;

/** Inverse of the schema's `usdCents` parser: integer cents to a plain dollar string. */
export const usdCentsToString = (cents: bigint): string => {
  const whole = cents / 100n;
  const frac = cents % 100n;
  return frac === 0n ?
      `${whole}`
    : `${whole}.${frac.toString().padStart(2, "0")}`;
};
