import { randomBytes as nobleRandomBytes } from "@noble/hashes/utils";
import { base64 } from "@scure/base";
import {
  bytesToHex,
  hexToBytes,
  isAddress,
  stringToBytes as viemStringToBytes,
  type Address,
  type Hex,
} from "viem";

/**
 * Encoding and assertion helpers with no domain knowledge, published as
 * `@anomaorg/anoma-app-sdk/primitives`. They live here rather than in a shared
 * utils package because the domain code below depends on them and this package
 * must not import from its own consumers.
 */

/** Returns base64-encoded bytes. */
export function toBase64(bytes: Uint8Array): string {
  return base64.encode(bytes);
}

/** Returns bytes from a base64-encoded string. */
export function fromBase64(encoded: string): Uint8Array<ArrayBuffer> {
  return base64.decode(encoded) as Uint8Array<ArrayBuffer>;
}

/** Converts a hex string to a byte array. */
export function fromHex(hexString: Hex): Uint8Array<ArrayBuffer> {
  return hexToBytes(hexString) as Uint8Array<ArrayBuffer>;
}

/** Converts a byte array to a hex string. */
export function toHex(bytes: Uint8Array<ArrayBuffer>): Hex {
  return bytesToHex(bytes);
}

export function stringToBytes(str: string): Uint8Array<ArrayBuffer> {
  return viemStringToBytes(str) as Uint8Array<ArrayBuffer>;
}

/** JSON replacer for lossless bigint encoding. Pair with {@link buildBigIntReviver}. */
export function bigIntReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

/** Builds a JSON reviver that restores bigints for the named keys. */
export function buildBigIntReviver(keys: string[]) {
  return (key: string, value: unknown) =>
    typeof value === "string" && keys.includes(key) ? BigInt(value) : value;
}

/** Normalizes a hex string by lowercasing and stripping a leading 0x. */
export function normalizeHex(hex: string): string {
  return hex.toLowerCase().replace(/^0x/, "");
}

/** Validates a hex string against the length of its decoded bytes (length / 2). */
export function validHexBytes(hex: string, byteLength: number) {
  return hex.length === byteLength * 2;
}

/** Validates the contents of a hexadecimal string. */
export const validHexString = (hex: string) =>
  hex.replace(/^0x/, "").match(/^[0-9A-Fa-f]+$/);

export const generateRandomBytes = (size = 32): Uint8Array<ArrayBuffer> =>
  nobleRandomBytes(size) as Uint8Array<ArrayBuffer>;

export const normalizeEvmAddress = (address: string): Address => {
  const normalized = address.toLowerCase();
  return isAddress(normalized) ? normalized : `0x${normalized}`;
};

export function invariant(
  // eslint-disable-next-line
  condition: any,
  message: string
): asserts condition {
  if (condition) return;
  throw new Error(message);
}
