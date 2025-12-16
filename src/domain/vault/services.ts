import { sha256 } from "@noble/hashes/sha2";
import { VAULT_VERSION } from "app-constants";
import {
  createStorageAuthorizationKeypair,
  createVaultAccount,
  unlockVault,
} from "domain/crypto";
import { createUserKeyring } from "domain/keys";
import { insertVaultEntry, retrieveVaultById } from "domain/vault/storage";
import { toBase64Url } from "lib/base64url";
import { encodePayAddress } from "lib/payAddress";
import { toHex } from "lib/utils";
import type {
  DecryptedVaultEntry,
  UserPublicKeys,
  VaultDataTransferObject,
  VaultEncryptionType,
  VaultEntry,
} from "types";
import type { Hex } from "viem";
import { PublicKey } from "wasm";

export const hashVaultId = (id: string) =>
  toHex(sha256(id) as Uint8Array<ArrayBuffer>);

/**
 * Fetches a VaultEntry from storage.
 *
 * @param vaultId - Vault identifier (Ex: wallet address, uuid, etc). The hash of this value,
 * calculated by {@link hashVaultId} will be queried from the IndexedDB
 */
export const retrieveVault = async (vaultId: string): Promise<VaultEntry> => {
  return retrieveVaultById(hashVaultId(vaultId));
};

/**
 * Creates a vault for the provided wallet address and persists it.
 *
 * @param vaultId - identificator of the vault (ex: wallet address, uuid) before hashing
 * @param signature - Signature that proves control of the wallet address.
 */
export const createVault = async (
  vaultId: string,
  signature: Uint8Array<ArrayBuffer>,
  type: VaultEncryptionType
): Promise<VaultEntry> => {
  const keyring = createUserKeyring();
  const vaultEntry = await createVaultAccount(
    hashVaultId(vaultId),
    keyring,
    signature,
    type
  );
  return await insertVaultEntry(vaultEntry);
};

/**
 * Unlocks a persisted vault using a signature and returns it with the decrypted keyring.
 *
 * @param vault - VaultEntry as stored in IndexedDB.
 * @param ikm - Signature / input key material used to decrypt the keyring as Uint8Array
 */
export const unlock = async (
  vault: VaultEntry,
  ikm: Uint8Array<ArrayBuffer>
): Promise<DecryptedVaultEntry> => {
  const keyring = await unlockVault(vault, ikm);
  return {
    ...vault,
    keyring,
  };
};

/**
 * Creates an object containing the Vault information encoded in base64.
 * In addition, it also provides a "storage authorization key",
 * which is a deterministic generated key to sign the ciphertext, and create the ciphertextSignature.
 */
export const createVaultDto = async (
  vault: DecryptedVaultEntry,
  userPublicKeys: UserPublicKeys,
  signature: Hex
): Promise<VaultDataTransferObject> => {
  const signatureBytes = new TextEncoder().encode(signature);
  const storageAuthorizationKeyPair =
    await createStorageAuthorizationKeypair(signatureBytes);

  const userAddress = encodePayAddress(userPublicKeys);
  const ciphertextInBase64 = toBase64Url(new Uint8Array(vault.ciphertext));
  const initializationVectorInBase64 = toBase64Url(vault.iv);
  const ciphertextSignature = toBase64Url(
    await storageAuthorizationKeyPair.sign(ciphertextInBase64)
  );
  const storageAuthorizationPublicKey = new PublicKey(
    storageAuthorizationKeyPair.publicKey
  ).toBase64();

  return {
    storageAuthorizationPublicKey,
    userAddress,
    ciphertext: ciphertextInBase64,
    initializationVector: initializationVectorInBase64,
    ciphertextSignature,
    version: VAULT_VERSION,
  };
};
