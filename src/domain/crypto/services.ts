import {
  KEK_DOMAIN_SALT,
  STORAGE_KEY_DOMAIN_SALT,
  VAULT_DOMAIN_INFO,
  VAULT_VERSION,
} from "app-constants";
import { KeyPair } from "domain/keys";
import {
  convertUserKeyringToJson,
  converUserKeyringFromJson,
} from "domain/keys/services";
import { generateRandomBytes } from "lib/utils";
import type { UserKeyring, VaultEncryptionType, VaultEntry } from "types";

/**
 * Imports the user signature so it can be used as input material for HKDF.
 * @param signature Signature bytes returned by the signer
 * @returns A CryptoKey that can be used as HKDF input material
 */
export const wrapSignatureAsCryptoKey = (
  signature: Uint8Array<ArrayBuffer>
): Promise<CryptoKey> => {
  return window.crypto.subtle.importKey(
    "raw",
    signature,
    { name: "HKDF" },
    false,
    ["deriveKey", "deriveBits"]
  );
};

/**
 * Derives the AES-GCM key-encryption-key from the key input material.
 * @param key Imported key material produced by {@link wrapSignatureAsCryptoKey}
 * @returns CryptoKey configured for AES-GCM encrypt/decrypt
 */
const deriveKeyEncryptionKey = (key: CryptoKey): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  return window.crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode(KEK_DOMAIN_SALT),
      info: encoder.encode(VAULT_DOMAIN_INFO),
    },
    key,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Derives the AES-GCM storage authorization secret key from the key input material.
 * @param key Imported key material produced by {@link wrapSignatureAsCryptoKey}
 * @returns CryptoKey configured for AES-GCM encrypt/decrypt
 */
export const deriveStorageAuthorizationSecretKey = (
  key: CryptoKey
): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  return window.crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode(STORAGE_KEY_DOMAIN_SALT),
      info: encoder.encode(VAULT_DOMAIN_INFO),
    },
    key,
    256
  );
};

/**
 * Deterministically create a keypair that will be used to create the
 * ciphertext signature and identify users in the database
 */
export const createStorageAuthorizationKeypair = async (
  signature: Uint8Array<ArrayBuffer>
) => {
  const ikm = await wrapSignatureAsCryptoKey(signature);
  const storageAuthorizationSecretKey =
    await deriveStorageAuthorizationSecretKey(ikm);
  return KeyPair.create(new Uint8Array(storageAuthorizationSecretKey));
};

/**
 * Encrypts the serialized keyring using AES-GCM with a derived KEK.
 * @param inputKeyMaterial HKDF input material derived from the user signature
 * @param serializedKeyring JSON produced by {@link convertUserKeyringToJson}
 * @returns The resulting IV and ciphertext
 */
export const encrypt = async (
  keyEncryptionKey: CryptoKey,
  serializedKeyring: string
): Promise<{ iv: Uint8Array<ArrayBuffer>; ciphertext: ArrayBuffer }> => {
  const iv = generateRandomBytes(12);
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    keyEncryptionKey,
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
  keyEncryptionKey: CryptoKey,
  ciphertext: ArrayBuffer,
  iv: Uint8Array<ArrayBuffer>
): Promise<string> => {
  let encodedOutput: ArrayBuffer;
  try {
    encodedOutput = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      keyEncryptionKey,
      ciphertext
    );
  } catch {
    throw new Error(
      "Failed to decrypt vault entry (invalid key or corrupted data)."
    );
  }
  return new TextDecoder().decode(encodedOutput);
};

/**
 * Creates a vault entry storing an encrypted keyring using a user signature.
 * @param id Identifier for the vault entry (ex: wallet address, uuid)
 * @param keyring User keyring to persist
 * @param signature Uint8Array user signature used to derive the encryption key
 * @param version Vault schema version, defaults to {@link VAULT_VERSION}
 * @returns Vault entry ready to be persisted
 */
export const createVaultAccount = async (
  id: string,
  keyring: UserKeyring,
  signature: Uint8Array<ArrayBuffer>,
  encryptionType: VaultEncryptionType,
  version: number = VAULT_VERSION
): Promise<VaultEntry> => {
  const inputKeyMaterial = await wrapSignatureAsCryptoKey(signature);
  const kek = await deriveKeyEncryptionKey(inputKeyMaterial);
  const serializedKeyring = convertUserKeyringToJson(keyring);
  const { iv, ciphertext } = await encrypt(kek, serializedKeyring);
  return {
    id,
    version,
    ciphertext,
    iv,
    encryptionType,
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
  signature: Uint8Array<ArrayBuffer>
): Promise<UserKeyring> => {
  const inputKeyMaterial = await wrapSignatureAsCryptoKey(signature);
  const kek = await deriveKeyEncryptionKey(inputKeyMaterial);
  const serializedKeyring = await decrypt(kek, vault.ciphertext, vault.iv);
  return converUserKeyringFromJson(serializedKeyring);
};
