import {
  KeyPair,
  KeyPairSerializer,
  NullifierKeyPair,
} from "domain/keys/models";
import type { UserKeyring } from "types";

export const KeyDerivation = {
  /**
   * Used to authorise actions and express ownership over resources for
   * applications that have a notion of ownership and require explicit authorisation of the owner
   * @param seed Optional seed to deterministically derive the key pair
   */
  deriveAuthorityKeyPair: (seed?: Uint8Array): KeyPair => {
    return KeyPair.create(seed, "Authority");
  },
  /**
   * These keys are used to reflect the right to nullify
   * @param seed Optional seed to deterministically derive the key pair
   */
  deriveNullifierKeyPair: (seed?: Uint8Array): NullifierKeyPair => {
    return NullifierKeyPair.create(seed);
  },
  /**
   * This static key pair is used to produce resource encryption keys
   * @param seed Optional seed to deterministically derive the key pair
   */
  deriveStaticEncryptionKeyPair: (seed?: Uint8Array): KeyPair => {
    return KeyPair.create(seed, "Encryption");
  },
  /**
   * This static key pair is used to produce discovery encryption keys
   * @param seed Optional seed to deterministically derive the key pair
   */
  deriveStaticDiscoveryKeyPair: (seed?: Uint8Array): KeyPair => {
    return KeyPair.create(seed, "Discovery");
  },
};

/**
 * Derives all key pairs that make up a user keyring.
 * @param seed Optional 32-byte seed to deterministically derive the keys
 * @returns Object containing authority, nullifier, discovery, and encryption pairs
 */
export const createUserKeyring = (seed?: Uint8Array): UserKeyring => {
  return {
    authorityKeyPair: KeyDerivation.deriveAuthorityKeyPair(seed),
    nullifierKeyPair: KeyDerivation.deriveNullifierKeyPair(seed),
    discoveryKeyPair: KeyDerivation.deriveStaticDiscoveryKeyPair(seed),
    encryptionKeyPair: KeyDerivation.deriveStaticEncryptionKeyPair(seed),
  };
};

/**
 * Serializes a {@link UserKeyring} into a JSON string.
 * @param userKeyring Keyring to serialize
 * @returns JSON representation with all key pairs encoded
 */
export const convertUserKeyringToJson = (userKeyring: UserKeyring): string => {
  return JSON.stringify({
    authorityKeyPair: KeyPairSerializer.toJson(userKeyring.authorityKeyPair),
    nullifierKeyPair: KeyPairSerializer.toJson(userKeyring.nullifierKeyPair),
    discoveryKeyPair: KeyPairSerializer.toJson(userKeyring.discoveryKeyPair),
    encryptionKeyPair: KeyPairSerializer.toJson(userKeyring.encryptionKeyPair),
  });
};

/**
 * Deserializes the JSON payload produced by {@link convertUserKeyringToJson}.
 * @param json JSON string containing serialized key pairs
 * @returns The reconstructed {@link UserKeyring}
 */
export const converUserKeyringFromJson = (json: string): UserKeyring => {
  const keyringObj = JSON.parse(json);
  return {
    authorityKeyPair: KeyPairSerializer.fromJson(
      KeyPair,
      keyringObj.authorityKeyPair
    ),
    nullifierKeyPair: KeyPairSerializer.fromJson(
      NullifierKeyPair,
      keyringObj.nullifierKeyPair
    ),
    discoveryKeyPair: KeyPairSerializer.fromJson(
      KeyPair,
      keyringObj.discoveryKeyPair
    ),
    encryptionKeyPair: KeyPairSerializer.fromJson(
      KeyPair,
      keyringObj.encryptionKeyPair
    ),
  };
};
