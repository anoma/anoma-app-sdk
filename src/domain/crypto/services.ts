import {
  convertUserKeyringToJson,
  converUserKeyringFromJson,
} from "domain/keys/services";
import { generateRandomBytes } from "lib/utils";
import type { UserKeyring, VaultEntry } from "types";

export const CURRENT_VAULT_VERSION = 1;

/**
 * Imports the user signature so it can be used as input material for HKDF.
 * @param signature Signature bytes returned by the signer
 * @returns A CryptoKey that can be used as HKDF input material
 */
const wrapSignatureAsCryptoKey = (
  signature: Uint8Array
): Promise<CryptoKey> => {
  return window.crypto.subtle.importKey(
    "raw",
    signature,
    { name: "HKDF" },
    false,
    ["deriveKey"]
  );
};

/**
 * Derives the AES-GCM key-encryption-key from the HKDF input material.
 * @param key Imported key material produced by {@link wrapSignatureAsCryptoKey}
 * @returns CryptoKey configured for AES-GCM encrypt/decrypt
 */
const deriveKeyEncryptionKey = (key: CryptoKey): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  return window.crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode("anoma-pay"),
      info: encoder.encode("anoma-pay:vault-aes-key"),
    },
    key,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts the serialized keyring using AES-GCM with a derived KEK.
 * @param inputKeyMaterial HKDF input material derived from the user signature
 * @param serializedKeyring JSON produced by {@link convertUserKeyringToJson}
 * @returns The resulting IV and ciphertext
 */
export const encrypt = async (
  inputKeyMaterial: CryptoKey,
  serializedKeyring: string
): Promise<{ iv: Uint8Array; ciphertext: ArrayBuffer }> => {
  const iv = generateRandomBytes(12);
  const kek = await deriveKeyEncryptionKey(inputKeyMaterial);
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    kek,
    new TextEncoder().encode(serializedKeyring)
  );
  return {
    iv,
    ciphertext,
  };
};

/**
 * Decrypts a given ciphertext
 * @param inputKeyMaterial HKDF input material derived from the user signature
 * @param ciphertext Encrypted keyring produced by {@link encrypt}
 * @param iv Initialization vector used to encrypt the keyring
 * @returns Serialized string containing the decoded data
 */
export const decrypt = async (
  inputKeyMaterial: CryptoKey,
  ciphertext: ArrayBuffer,
  iv: Uint8Array
): Promise<string> => {
  const kek = await deriveKeyEncryptionKey(inputKeyMaterial);
  let encodedOutput: ArrayBuffer;
  try {
    encodedOutput = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      kek,
      ciphertext
    );
  } catch {
    throw new Error(
      "Failed to decrypt vault entry (invalid key or corrupted data)"
    );
  }
  return new TextDecoder().decode(encodedOutput);
};

/**
 * Creates a vault entry storing an encrypted keyring using a user signature.
 * @param id Identifier for the vault entry (ex: wallet address, uuid)
 * @param keyring User keyring to persist
 * @param signature Uint8Array user signature used to derive the encryption key
 * @param version Vault schema version, defaults to {@link CURRENT_VAULT_VERSION}
 * @returns Vault entry ready to be persisted
 */
export const createVaultAccount = async (
  id: string,
  keyring: UserKeyring,
  signature: Uint8Array,
  version: number = CURRENT_VAULT_VERSION
): Promise<VaultEntry> => {
  const inputKeyMaterial = await wrapSignatureAsCryptoKey(signature);
  const serializedKeyring = convertUserKeyringToJson(keyring);
  const { iv, ciphertext } = await encrypt(inputKeyMaterial, serializedKeyring);
  return {
    id,
    version,
    ciphertext,
    iv,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
};

/**
 * Unlocks and decrypts a vault entry using the provided signature.
 * @param vault Vault entry returned by {@link createVaultAccount}
 * @param signature User signature used to derive the encryption key
 * @returns Decrypted {@link UserKeyring}
 */
export const unlockVault = async (
  vault: VaultEntry,
  signature: Uint8Array
): Promise<UserKeyring> => {
  const inputKeyMaterial = await wrapSignatureAsCryptoKey(signature);
  const serializedKeyring = await decrypt(
    inputKeyMaterial,
    vault.ciphertext,
    vault.iv
  );
  return converUserKeyringFromJson(serializedKeyring);
};
