import { gcm } from "@noble/ciphers/aes";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToUtf8, randomBytes, utf8ToBytes } from "@noble/hashes/utils";
import type { Hex } from "viem";
import { fromHex, toHex } from "lib/utils";

// Pure-JS crypto rather than WebCrypto: this package runs under React Native's
// Hermes, which has no `crypto.subtle`. The derivation and the `iv || ciphertext
// || tag` layout are unchanged from the WebCrypto implementation, so payloads
// encrypted by earlier versions still decrypt — see tests/crypto-fixtures.json.
const SALT = utf8ToBytes("anomapay-salt");
const INFO = utf8ToBytes("anomapay-storage");
const IV_BYTES = 12;

/** Derives the AES-GCM key from a private key using HKDF-SHA256. */
const deriveAesKey = (privateKey: Uint8Array<ArrayBuffer>): Uint8Array =>
  hkdf(sha256, privateKey, SALT, INFO, 32);

/**
 * Encrypts a plaintext string using AES-GCM derived from a private key.
 * Returns a hex string of `iv || ciphertext`.
 */
export const aesEncrypt = async (
  privateKey: Uint8Array<ArrayBuffer>,
  plaintext: string
): Promise<string> => {
  const iv = randomBytes(IV_BYTES);
  const ciphertext = gcm(deriveAesKey(privateKey), iv).encrypt(
    utf8ToBytes(plaintext)
  );
  const result = new Uint8Array(iv.length + ciphertext.length);
  result.set(iv);
  result.set(ciphertext, iv.length);
  return toHex(result);
};

/**
 * Decrypts a hex string produced by {@link aesEncrypt}.
 */
export const aesDecrypt = async (
  privateKey: Uint8Array<ArrayBuffer>,
  encryptedHex: string
): Promise<string> => {
  const data = fromHex(encryptedHex as Hex);
  const iv = data.slice(0, IV_BYTES);
  const ciphertext = data.slice(IV_BYTES);
  return bytesToUtf8(gcm(deriveAesKey(privateKey), iv).decrypt(ciphertext));
};
