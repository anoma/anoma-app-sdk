import { fromHex, toHex } from "lib/utils";
import type { Hex } from "viem";

/**
 * Derives a CryptoKey from a private key using HKDF -> AES-GCM.
 */
const deriveAesCryptoKey = async (
  privateKey: Uint8Array<ArrayBuffer>
): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    privateKey,
    "HKDF",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("anomapay-salt"),
      info: new TextEncoder().encode("anomapay-storage"),
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts a plaintext string using AES-GCM derived from the private key.
 * Returns a hex string of `iv || ciphertext`.
 */
export const aesEncrypt = async (
  privateKey: Uint8Array<ArrayBuffer>,
  plaintext: string
): Promise<string> => {
  const key = await deriveAesCryptoKey(privateKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv);
  result.set(new Uint8Array(ciphertext), iv.length);
  return toHex(result);
};

/**
 * Decrypts a hex string produced by {@link aesEncrypt}.
 */
export const aesDecrypt = async (
  privateKey: Uint8Array<ArrayBuffer>,
  encryptedHex: string
): Promise<string> => {
  const key = await deriveAesCryptoKey(privateKey);
  const data = fromHex(encryptedHex as Hex);
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
};
