import type { IconComponent } from "@web3icons/react";
import {
  ExchangeIcon,
  NetworkIcon,
  TokenIcon,
  WalletIcon,
} from "@web3icons/react/dynamic";
import { TxExplorerUrlByChainId } from "app-constants";
import clsx, { type ClassValue } from "clsx";
import type { ReactElement } from "react";
import { twMerge } from "tailwind-merge";
import type { SupportedChainId, TokenRegistry } from "types";
import {
  bytesToHex,
  formatUnits,
  hexToBytes,
  stringToBytes as viemStringToBytes,
  type Hex,
} from "viem";
import z from "zod";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const shortenAddress = (address: string, head = 6, tail = 4) => {
  return `${address.slice(0, 2 + head)}…${address.slice(-tail)}`;
};

export const checkForWeb3Icons = (
  el: ReactElement
): el is ReactElement<IconComponent> => {
  if (!el || typeof el !== "object") return false;
  return (
    el.type === TokenIcon ||
    el.type === NetworkIcon ||
    el.type === WalletIcon ||
    el.type === ExchangeIcon
  );
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

export const formatTokenAmount = (
  amount: string,
  token: TokenRegistry
): string => {
  return `${amount} ${token.symbol.toUpperCase()}`;
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

/**
 * Serialize BigInt to string
 */
export function serializeBigInt(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return parseInt(value.toString());
  }
  return value;
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

export function promiseWithResolvers<T>(): [
  Promise<T>,
  (value: T) => void,
  (error: Error) => void,
] {
  let resolver: (value: T) => void;
  let rejecter: (error: Error) => void;
  const promise = new Promise<T>((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  return [promise, resolver!, rejecter!];
}

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

export const hasTouchScreen = () => navigator.maxTouchPoints > 0;

export const isMobileDevice = () =>
  window.matchMedia("(pointer: coarse)").matches ||
  window.matchMedia("(hover: none)").matches;

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  // deprecated but required for iPadOS detection
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const getTxUrl = (chainId: SupportedChainId, txHash: string) => {
  const base = TxExplorerUrlByChainId[chainId];
  return base + `0x${normalizeHex(txHash)}`;
};
