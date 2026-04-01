import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import { KEYRING_SALT } from "lib-constants";
import {
  KeyPair,
  KeyPairSerializer,
  NullifierKeyPair,
} from "domain/keys/models";
import { invariant } from "lib/utils";
import type { UserKeyring, UserPublicKeys } from "types";

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

export const createUserKeyringFromIkm = (ikm: Uint8Array<ArrayBuffer>) => {
  const seed = hkdf(sha256, ikm, KEYRING_SALT, "", 32);
  return createUserKeyring(seed as Uint8Array<ArrayBuffer>);
};

/**
 * Serializes a {@link UserKeyring} to a JSON string for session storage persistence.
 * @param keyring The keyring to serialize
 * @returns JSON string with hex-encoded key pairs
 */
export const serializeUserKeyring = (keyring: UserKeyring): string => {
  return JSON.stringify({
    authorityKeyPair: KeyPairSerializer.toJson(keyring.authorityKeyPair),
    discoveryKeyPair: KeyPairSerializer.toJson(keyring.discoveryKeyPair),
    encryptionKeyPair: KeyPairSerializer.toJson(keyring.encryptionKeyPair),
    nullifierKeyPair: KeyPairSerializer.toJson(keyring.nullifierKeyPair),
  });
};

/**
 * Deserializes a {@link UserKeyring} from a JSON string produced by {@link serializeUserKeyring}.
 * @param json JSON string with hex-encoded key pairs
 * @returns Restored {@link UserKeyring}
 */
export const deserializeUserKeyring = (json: string): UserKeyring => {
  const obj = JSON.parse(json);
  return {
    authorityKeyPair: KeyPairSerializer.fromJson(KeyPair, obj.authorityKeyPair),
    discoveryKeyPair: KeyPairSerializer.fromJson(KeyPair, obj.discoveryKeyPair),
    encryptionKeyPair: KeyPairSerializer.fromJson(
      KeyPair,
      obj.encryptionKeyPair
    ),
    nullifierKeyPair: KeyPairSerializer.fromJson(
      NullifierKeyPair,
      obj.nullifierKeyPair
    ),
  };
};

export const createUserKeyringFromPasskey = (
  credential: PublicKeyCredential
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

  return createUserKeyringFromIkm(ikm);
};
