import CRC32 from "crc-32";
import type { UserPublicKeys } from "types";
import { fromBase64Url, toBase64Url } from "./base64url";

// TODO: this shouldn't be here
/**
 * A Base64URL-encoded string that represents all four public keys of a user plus
 * a CRC32 integrity checksum.
 *
 * The raw byte layout (135 bytes total before encoding) is:
 * - bytes   0–32  : compressed secp256k1 authority public key (33 bytes)
 * - bytes  33–65  : compressed secp256k1 discovery public key (33 bytes)
 * - bytes  66–98  : compressed secp256k1 encryption public key (33 bytes)
 * - bytes  99–130 : nullifier key commitment / SHA-256(nk) (32 bytes)
 * - bytes 131–134 : CRC32 checksum of the preceding 131 bytes (4 bytes, big-endian)
 *
 * Obtain a Pay Address by calling {@link encodePayAddress}.
 */
export type PayAddress = string;

const getCrc32 = (keyBytes: Uint8Array): Uint8Array => {
  const crc = CRC32.buf(keyBytes) >>> 0;
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, crc); // big-endian
  return bytes;
};

const areEqualsBytes = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

/**
 * Encodes a user's four public keys into a compact Pay Address string.
 *
 * The keys are concatenated in the order authority → discovery → encryption →
 * nullifierKeyCommitment, a CRC32 checksum is appended, and the whole buffer
 * is Base64URL-encoded without padding.
 *
 * Share the resulting Pay Address with senders so they can address resources
 * to you without revealing any private key material.
 *
 * @param key - The {@link UserPublicKeys} to encode (obtainable via {@link extractUserPublicKeys}).
 * @returns A Base64URL-encoded Pay Address string (180 characters, no padding).
 *
 * @example
 * ```typescript
 * const keyring = createUserKeyring();
 * const publicKeys = extractUserPublicKeys(keyring);
 * const payAddress = encodePayAddress(publicKeys);
 * // "Ax5k..." (Base64URL string)
 * ```
 */
export const encodePayAddress = (key: UserPublicKeys): PayAddress => {
  const keyBytes = new Uint8Array([
    ...key.authorityPublicKey,
    ...key.discoveryPublicKey,
    ...key.encryptionPublicKey,
    ...key.nullifierKeyCommitment,
  ]);
  const crcBytes = getCrc32(keyBytes);
  const payAddressBytes = new Uint8Array([...keyBytes, ...crcBytes]);
  return toBase64Url(payAddressBytes);
};

/**
 * Decodes and validates a Pay Address string, returning the contained public keys.
 *
 * Validation steps:
 * 1. The string must be non-empty.
 * 2. The Base64URL-decoded payload must be exactly 135 bytes.
 * 3. The trailing 4-byte CRC32 must match the checksum of the preceding 131 bytes.
 *
 * @param payAddress - A {@link PayAddress} string produced by {@link encodePayAddress}.
 * @returns The decoded {@link UserPublicKeys} (authority, discovery, encryption, nullifierKeyCommitment).
 * @throws {Error} If the string is empty, has an unexpected byte length, or fails the integrity check.
 *
 * @example
 * ```typescript
 * const publicKeys = decodePayAddress("Ax5k...");
 * // publicKeys.authorityPublicKey, publicKeys.encryptionPublicKey, ...
 * ```
 */
export const decodePayAddress = (payAddress: PayAddress): UserPublicKeys => {
  if (!payAddress || payAddress.trim() === "") {
    throw new Error("Pay address cannot be empty");
  }

  const payAddressBytes = fromBase64Url(payAddress);

  // Validate expected length: 33 + 33 + 33 + 32 + 4 = 135 bytes
  const expectedLength = 135;
  if (payAddressBytes.length !== expectedLength) {
    throw new Error(
      `Invalid Pay Address: expected ${expectedLength} bytes, got ${payAddressBytes.length}`
    );
  }

  let i = 0;
  const getSlice = (length: number) => payAddressBytes.slice(i, (i += length));

  const authorityPublicKey = getSlice(33);
  const discoveryPublicKey = getSlice(33);
  const encryptionPublicKey = getSlice(33);
  const nullifierKeyCommitment = getSlice(32);
  const addressCrc = getSlice(4);

  const key: UserPublicKeys = {
    authorityPublicKey,
    discoveryPublicKey,
    encryptionPublicKey,
    nullifierKeyCommitment,
  };
  const keyBytes = new Uint8Array([
    ...key.authorityPublicKey,
    ...key.discoveryPublicKey,
    ...key.encryptionPublicKey,
    ...key.nullifierKeyCommitment,
  ]);
  const keyCrc = getCrc32(keyBytes);

  // Validate CRC
  if (!areEqualsBytes(addressCrc, keyCrc)) {
    throw new Error("Invalid Pay Address: integrity check failed");
  }

  return key;
};

/**
 * Returns `true` if `payAddress` is a structurally valid Pay Address; `false` otherwise.
 *
 * This is a non-throwing wrapper around {@link decodePayAddress}. Use it for
 * input validation where you want a boolean result rather than an exception.
 *
 * @param payAddress - Any string to test.
 * @returns `true` if the string decodes successfully, `false` if it is malformed
 *   or fails the CRC32 integrity check.
 *
 * @example
 * ```typescript
 * if (!isValidPayAddress(input)) {
 *   throw new Error("Please enter a valid Pay Address");
 * }
 * ```
 */
export function isValidPayAddress(payAddress: string): boolean {
  try {
    decodePayAddress(payAddress);
    return true;
  } catch {
    return false;
  }
}
