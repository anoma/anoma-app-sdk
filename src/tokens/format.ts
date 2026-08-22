import { normalizeEvmAddress } from "primitives";
import type { NetworkAddress, TokenRegistry } from "types";
import { formatUnits } from "viem";

/**
 * Token amount formatting. This sits in the SDK rather than the app's utils
 * because aggregateTokenBalances stores pre-formatted strings on
 * AggregatedTokenBalance, so the domain layer depends on it.
 */

/** Decimal places kept when displaying a token amount. */
export const MAX_DECIMALS = 6;

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
