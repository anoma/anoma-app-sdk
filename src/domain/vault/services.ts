import { sha256 } from "@noble/hashes/sha2";
import type { IndexerVaultResponse } from "api";
import { VAULT_VERSION } from "app-constants";
import {
  createStorageAuthorizationKeypair,
  createVaultAccount,
  unlockVault,
} from "domain/crypto";
import { createUserKeyring, extractUserPublicKeys } from "domain/keys";
import { insertVaultEntry, retrieveVaultById } from "domain/vault/storage";
import { toBase64Url } from "lib/base64url";
import { encodePayAddress } from "lib/payAddress";
import { fromHex, toHex } from "lib/utils";
import type {
  DecryptedVaultEntry,
  VaultDataTransferObject,
  VaultEncryptionType,
  VaultEntry,
  VaultRequestDataTransferObject,
} from "types";
import { type Hex } from "viem";

export const hashVaultId = (id: string) =>
  toHex(sha256(id) as Uint8Array<ArrayBuffer>);

/**
 * Fetches a VaultEntry from storage.
 *
 * @param vaultId - Vault identifier (Ex: wallet address, uuid, etc). The hash of this value,
 * calculated by {@link hashVaultId} will be queried from the IndexedDB
 */
export const retrieveVaultFromStorage = async (
  vaultId: string
): Promise<VaultEntry | undefined> => {
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
): Promise<VaultEntry | undefined> => {
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
  decryptedVault: DecryptedVaultEntry,
  storageIkm: Hex
): Promise<VaultDataTransferObject> => {
  const userPublicKeys = extractUserPublicKeys(decryptedVault.keyring);
  const ikmBytes = fromHex(storageIkm);
  const storageAuthorizationKeyPair =
    await createStorageAuthorizationKeypair(ikmBytes);

  const userAddress = encodePayAddress(userPublicKeys);
  const ciphertextInBase64 = toBase64Url(
    new Uint8Array(decryptedVault.ciphertext)
  );
  const initializationVectorInBase64 = toBase64Url(decryptedVault.iv);
  const ciphertextSignature = toBase64Url(
    await storageAuthorizationKeyPair.sign(ciphertextInBase64)
  );
  const storageAuthorizationPublicKey = toBase64Url(
    storageAuthorizationKeyPair.publicKey
  );

  return {
    storageAuthorizationPublicKey,
    userAddress,
    ciphertext: ciphertextInBase64,
    initializationVector: initializationVectorInBase64,
    ciphertextSignature,
    version: VAULT_VERSION,
  };
};

/**
 * Creates the request payload needed to prove storage authorization for a challenge.
 *
 * @param ikm - Input key material used to derive the storage authorization keypair.
 * @param challenge - Challenge payload to hash and sign before sending to the vault service.
 */
export const createVaultRequestDto = async (
  ikm: Uint8Array<ArrayBuffer>,
  challenge: string
): Promise<VaultRequestDataTransferObject> => {
  const storageAuthorizationKeyPair =
    await createStorageAuthorizationKeypair(ikm);
  const hashedMessage = toBase64Url(
    sha256(challenge) as Uint8Array<ArrayBuffer>
  );
  const challengeSignature = toBase64Url(
    await storageAuthorizationKeyPair.sign(hashedMessage)
  );

  return {
    storageAuthorizationPublicKey: toBase64Url(
      storageAuthorizationKeyPair.publicKey
    ),
    ciphertext: hashedMessage,
    ciphertextSignature: challengeSignature,
  };
};

export const createVaultDtoFromIndexerResponse = (
  response: IndexerVaultResponse
): VaultDataTransferObject => {
  return {
    ciphertext: response.ciphertext,
    version: response.version,
    initializationVector: response.initialization_vector,
    ciphertextSignature: response.ciphertext_signature,
    storageAuthorizationPublicKey: response.storage_authorization_public_key,
    userAddress: response.user_address,
  };
};
