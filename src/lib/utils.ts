import { MAX_DECIMALS } from "lib-constants";
import type { NetworkAddress, TokenRegistry } from "types";
import {
  bytesToHex,
  formatUnits,
  hexToBytes,
  isAddress,
  stringToBytes as viemStringToBytes,
  type Address,
  type Hex,
} from "viem";
import z from "zod";

export const shortenAddress = (address: string, head = 6, tail = 4) => {
  return `${address.slice(0, 2 + head)}…${address.slice(-tail)}`;
};

export const normalizeEvmAddress = (address: string): Address => {
  const normalized = address.toLowerCase();
  return isAddress(normalized) ? normalized : `0x${normalized}`;
};

export const normalizeEvmNetworkAddress = (
  address: NetworkAddress
): NetworkAddress => {
  const [chain, addr] = address.split(":");
  return `${chain}:${normalizeEvmAddress(addr)}`;
};

export const formatBalance = (
  amount: bigint,
  tokenDenom = 6,
  decimals = 2
): string => {
  const balance = Number(formatUnits(amount, tokenDenom));
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: tokenDenom,
  }).format(balance);
};

/**
 * Round a decimal string to a given number of decimal places using string
 * arithmetic. Avoids floating-point precision loss from parseFloat/toFixed.
 * @param amount - The decimal string to round
 * @param maxDecimals - Maximum decimal places to keep
 * @returns The rounded decimal string
 */
export const roundDecimalString = (
  amount: string,
  maxDecimals: number = MAX_DECIMALS
): string => {
  const [intPart, decPart] = amount.split(".");
  if (!decPart || decPart.length <= maxDecimals) return amount;

  // Use BigInt to handle rounding without floating-point issues
  const kept = `${intPart}${decPart.slice(0, maxDecimals)}`;
  const roundUp = Number(decPart[maxDecimals]) >= 5;
  const value = (
    BigInt(kept.replaceAll(",", "")) + (roundUp ? 1n : 0n)
  ).toString();

  // Pad in case BigInt result is shorter than expected (e.g. "0.01" with 1 decimal)
  const padded = value.padStart(maxDecimals + 1, "0");
  const splitAt = padded.length - maxDecimals;
  return `${padded.slice(0, splitAt)}.${padded.slice(splitAt)}`;
};

/**
 * Format a token amount for display, limiting to MAX_DECIMALS decimal places.
 * Very small numbers (where the first non-zero digit is beyond MAX_DECIMALS)
 * are preserved in full to avoid displaying "0.000000".
 * Uses string-based rounding to avoid floating-point precision loss.
 * @param amount - The amount as a string
 * @param token - The token registry entry
 * @returns Formatted string (e.g., "0.123457 USDC", "0.000000000001 USDC")
 */
export const formatTokenAmount = (
  amount: string,
  token: TokenRegistry,
  hideSymbol = false
): string => {
  const decimals = amount.split(".")[1];
  const symbol = hideSymbol ? "" : ` ${token.symbol.toUpperCase()}`;

  // Preserve very small numbers where the first significant digit
  // is beyond MAX_DECIMALS (e.g., 0.000000000001)
  const firstNonZero = decimals?.search(/[1-9]/) ?? -1;
  if (firstNonZero >= MAX_DECIMALS) {
    return `${amount}${symbol}`;
  }

  const rounded = roundDecimalString(amount, MAX_DECIMALS);
  return `${rounded}${symbol}`;
};

/**
 * Format a fiat amount for display
 * @param balance - The balance to format
 * @returns Formatted string (e.g., "1,234.56", "<0.01", "0.00")
 */
export const formatFiatAmount = (balance: number) => {
  if (balance === 0) return "0.00";

  // Round to 2 decimal places to match display precision and avoid
  // floating point issues (e.g., 0.01 becoming 0.00999999999...)
  const roundedBalance = Math.round(balance * 100) / 100;

  if (roundedBalance < 0.01) {
    return "<0.01";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(roundedBalance);
};

/** Format a decimal as a percentage string with 2 decimal places (e.g., 0.1234 -> "12.34%") */
export const formatPercentage = (percentage: number) => {
  return `${(percentage * 100).toFixed(2)}%`;
};

/**
 * Format a bigint fiat amount (in cents) for display
 * @param balance - The number to format
 * @returns Formatted string (e.g., "1,234.56", "<0.01", "0.00")
 */
export const formatBigIntFiatAmount = (balance: bigint) => {
  return formatFiatAmount(Number(balance) / 100);
};

/**
 * Return base64-encoded bytes
 * @param bytes - Uint8Array of bytes
 * @returns string
 */
export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Return bytes from base64-encoded string
 * @param base64 - base64-encoded string
 * @returns Uint8Array
 */
export function fromBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Uint8Array(bytes.buffer);
}

/**
 * Convert hex string to a byte array
 * @param hex - string
 * @returns Uint8Array
 */
export function fromHex(hexString: Hex): Uint8Array<ArrayBuffer> {
  return hexToBytes(hexString) as Uint8Array<ArrayBuffer>;
}

/**
 * Convert a byte array to a hex string
 * @param bytes - Uint8Array
 * @returns string
 */
export function toHex(bytes: Uint8Array<ArrayBuffer>): Hex {
  return bytesToHex(bytes);
}

export function stringToBytes(str: string): Uint8Array<ArrayBuffer> {
  return viemStringToBytes(str) as Uint8Array<ArrayBuffer>;
}

/** JSON replacer for lossless bigint encoding. Pair with bigIntReviver. */
export function bigIntReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

/** JSON replacer for storage — lossless bigint encoding. Pair with bigintReviver. */
export function buildBigIntReviver(keys: string[]) {
  return (key: string, value: unknown) =>
    typeof value === "string" && keys.includes(key) ? BigInt(value) : value;
}

export const fromHexToBase64 = (hex: Hex) => toBase64(fromHex(hex));

/** Normalize a hex string by lowercasing and stripping a leading 0x. */
export function normalizeHex(hex: string): string {
  return hex.toLowerCase().replace(/^0x/, "");
}

/**
 * Validate a hex string against the length of its decoded bytes (length / 2)
 */
export function validHexBytes(hex: string, byteLength: number) {
  return hex.length === byteLength * 2;
}

/**
 * Validate contents of a hexadecimal string
 */
export const validHexString = (hex: string) =>
  hex.replace(/^0x/, "").match(/^[0-9A-Fa-f]+$/);

export const generateRandomBytes = (size = 32): Uint8Array<ArrayBuffer> => {
  const uint8Array = new Uint8Array(size);
  crypto.getRandomValues(uint8Array);
  return uint8Array;
};

export const convertObjectToSnakeCase = (obj: object) => {
  const output: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeCaseStr = key
      .split(/(?=[A-Z])/)
      .join("_")
      .toLowerCase();
    output[snakeCaseStr] = obj[key as keyof typeof obj];
  }
  return output;
};

export const base64Schema = z
  .base64()
  .transform((val: string) => Buffer.from(val, "base64"));

export function invariant(
  // eslint-disable-next-line
  condition: any,
  message: string
): asserts condition {
  if (condition) return;
  throw new Error(message);
}

/**
 * Builds the block explorer URL for a transaction.
 * @param chainId - The chain ID to get the explorer URL for
 * @param prefixedTxHash - The transaction hash with 0x prefix
 * @returns The full URL to view the transaction on the block explorer
 */
export const getTxUrl = (
  chain: { explorerUrl?: string },
  prefixedTxHash: string
) => {
  if (!chain.explorerUrl) return undefined;
  return `${chain.explorerUrl}/tx/${prefixedTxHash}`;
};

export const maxBigInt = (a: bigint, b: bigint): bigint => (a > b ? a : b);

/**
 * Format a number with a 'k' suffix when >= 1000.
 * Examples: 999 -> "999", 1000 -> "1k", 1500 -> "1.5k", 200000 -> "200k".
 */
export const formatCompactAmount = (n: number): string => {
  if (n < 1000) return String(n);
  const inK = n / 1000;
  return `${Number.isInteger(inK) ? inK : Number(inK.toFixed(1))}k`;
};

/**
 * Format a USD amount in compact form. Examples: 0 -> "$0", 999 -> "$999",
 * 1500 -> "$1.5k", 200000 -> "$200k".
 */
export const formatCompactFiat = (n: number): string => {
  return `$${formatCompactAmount(Math.round(n))}`;
};

/**
 * Extracts a numeric decimal value from a string that may include a currency suffix.
 * Accepts plain decimals ("350.50"), values with currency codes ("350USD", "350 USD",
 * "350.1234 CURRENCY"), and comma-separated decimals ("350,50 EUR").
 * Normalizes commas to periods for consistent decimal handling.
 * @returns The extracted numeric string, or null if the input is not a valid amount.
 */
export const extractNumericValue = (
  text: string,
  allowTrailingSeparator = false
): string | null => {
  const trimmed = text.trim();

  // Handle plain decimals that end with a period or comma (e.g., "350." or "350,")
  if (/^\d+[.,]?$/.test(trimmed) && !allowTrailingSeparator) {
    return trimmed.replace(/[.,]$/, "");
  }

  // Plain decimal number (with optional comma as decimal separator)
  if (/^\d*[.,]?\d*$/.test(trimmed) && trimmed !== "") {
    return trimmed.replace(",", ".");
  }

  // Number followed by optional whitespace and currency letters
  const match = trimmed.match(/^(\d+[.,]?\d*)\s*[a-zA-Z]+$/);
  if (!match) {
    return null;
  }

  return match[1].replace(",", ".");
};

export const indexedColor = (index: number): string => {
  const goldenAngle = 137.508; // degrees

  // Spread hues in a way that avoids clustering
  const hue = (index * goldenAngle) % 360;

  // Small deterministic variation (optional but useful)
  const variation = Math.sin(index * Math.random()) * 0.5 + 0.5;

  const saturation = 60 + variation * 20; // 60–80%
  const lightness = 50 + variation * 15; // 50–75%

  return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
};
