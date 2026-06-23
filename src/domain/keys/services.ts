import { hkdf } from "@noble/hashes/hkdf";
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import {
  KeyPair,
  KeyPairSerializer,
  NullifierKeyPair,
} from "domain/keys/models";
import { BUSINESS_KEYRING_SALT, PERSONAL_KEYRING_SALT } from "lib-constants";
import { fromHex, generateRandomBytes, invariant, toHex } from "lib/utils";
import {
  PRFDomainMap,
  type UserKeyring,
  type UserKeyringJson,
  type UserPublicKeys,
} from "types";
import { stringToBytes } from "viem";

/**
 * Account type used to derive a keyring into a separate cryptographic domain.
 * Personal and business accounts derive distinct keyrings from the same IKM.
 */
export type AccountType = "personal" | "business";

const KEYRING_SALTS: Record<AccountType, string> = {
  personal: PERSONAL_KEYRING_SALT,
  business: BUSINESS_KEYRING_SALT,
};

/**
 * Derives a 256-bit AES key-encryption-key (KEK) for local storage encryption.
 * Uses HMAC-SHA256 with the PRF domain separator, matching the same derivation
 * scheme used for asymmetric keys but producing only a symmetric key.
 */
const deriveStorageKey = (
  seed?: Uint8Array<ArrayBuffer>
): Uint8Array<ArrayBuffer> => {
  const actualSeed = seed ?? generateRandomBytes();
  const domain = seed ? stringToBytes(PRFDomainMap.Storage) : stringToBytes("");
  return hmac(sha256, actualSeed, domain) as Uint8Array<ArrayBuffer>;
};

/**
 * Derives all key pairs that make up a user keyring.
 * @param seed Optional 32-byte seed to deterministically derive the keys
 * @returns Object containing authority, nullifier, discovery, and encryption pairs
 */
export const createUserKeyring = (
  seed?: Uint8Array<ArrayBuffer>
): UserKeyring => {
  return {
    /**
     * Used to authorise actions and express ownership over resources for
     * applications that have a notion of ownership and require explicit authorisation of the owner
     * @param seed Optional seed to deterministically derive the key pair
     */
    authorityKeyPair: KeyPair.create(seed, "Authority"),

    /**
     * These keys are used to reflect the right to nullify
     * @param seed Optional seed to deterministically derive the key pair
     */
    nullifierKeyPair: NullifierKeyPair.create(seed),

    /**
     * This static key pair is used to produce resource encryption keys
     * @param seed Optional seed to deterministically derive the key pair
     */
    encryptionKeyPair: KeyPair.create(seed, "Encryption"),

    /**
     * This static key pair is used to produce discovery encryption keys
     * @param seed Optional seed to deterministically derive the key pair
     */
    discoveryKeyPair: KeyPair.create(seed, "Discovery"),

    storageKey: deriveStorageKey(seed),
  };
};

export const extractUserPublicKeys = (keyring: UserKeyring): UserPublicKeys => {
  return {
    authorityPublicKey: keyring.authorityKeyPair.publicKey,
    discoveryPublicKey: keyring.discoveryKeyPair.publicKey,
    encryptionPublicKey: keyring.encryptionKeyPair.publicKey,
    nullifierKeyCommitment: keyring.nullifierKeyPair.cnk,
  };
};

export const createUserKeyringFromIkm = (
  ikm: Uint8Array<ArrayBuffer>,
  salt: string
) => {
  const seed = hkdf(sha256, ikm, salt, "", 32);
  return createUserKeyring(seed as Uint8Array<ArrayBuffer>);
};

/**
 * Converts a {@link UserKeyring} to a {@link UserKeyringJson} object for persistence.
 * @param keyring The keyring to convert
 * @returns JSON object with hex-encoded key pairs
 */
export const toUserKeyringJson = (keyring: UserKeyring): UserKeyringJson => ({
  authorityKeyPair: KeyPairSerializer.toJson(keyring.authorityKeyPair),
  discoveryKeyPair: KeyPairSerializer.toJson(keyring.discoveryKeyPair),
  encryptionKeyPair: KeyPairSerializer.toJson(keyring.encryptionKeyPair),
  nullifierKeyPair: KeyPairSerializer.toJson(keyring.nullifierKeyPair),
  storageKey: toHex(keyring.storageKey),
});

/**
 * Restores a {@link UserKeyring} from a {@link UserKeyringJson} object produced by {@link toUserKeyringJson}.
 * @param obj JSON object with hex-encoded key pairs
 * @returns Restored {@link UserKeyring}
 */
export const fromUserKeyringJson = (obj: UserKeyringJson): UserKeyring => ({
  authorityKeyPair: KeyPairSerializer.fromJson(KeyPair, obj.authorityKeyPair),
  discoveryKeyPair: KeyPairSerializer.fromJson(KeyPair, obj.discoveryKeyPair),
  encryptionKeyPair: KeyPairSerializer.fromJson(KeyPair, obj.encryptionKeyPair),
  nullifierKeyPair: KeyPairSerializer.fromJson(
    NullifierKeyPair,
    obj.nullifierKeyPair
  ),
  storageKey: fromHex(obj.storageKey),
});

export const createUserKeyringFromPasskey = (
  credential: PublicKeyCredential,
  accountType: AccountType
) => {
  const prfResults = credential.getClientExtensionResults().prf?.results;
  const prfOutput = prfResults?.first;
  invariant(
    prfOutput,
    `The selected Passkey provider doesn't support WebAuthn PRF extension, required for authentication.
        If you're selecting the Passkey to be stored in the browser, please try a different way.`
  );

  const ikm =
    ArrayBuffer.isView(prfOutput) ?
      new Uint8Array(prfOutput.buffer)
    : new Uint8Array(prfOutput);

  const salt = KEYRING_SALTS[accountType];
  invariant(salt, `Unknown account type: ${accountType}`);
  return createUserKeyringFromIkm(ikm, salt);
};
