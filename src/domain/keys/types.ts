import type { KeyPair, NullifierKeyPair } from "domain/keys/models";

/**
 * KeyTuple is ordered [privateKey, publicKey] except for the case of
 * Nullifier, where we assume [nk, cnk] (Nullifier Key, Nullifier Commitment Key)
 */
export type KeyTuple = [Uint8Array, Uint8Array];

/**
 * Domain separators for PRF key derivation
 */
export const PRFDomainMap = {
  Authority: "ANOMA_AUTHORITY_KEY",
  Nullifier: "ANOMA_NULLIFIER_KEY",
  Encryption: "ANOMA_STATIC_ENCRYPTION_KEY",
  Discovery: "ANOMA_STATIC_DISCOVERY_KEY",
  NullifierKeyCommitment: "ANOMA_NULLIFIER_KEY_COMMITMENT",
} as const;

export type PRFDomain = typeof PRFDomainMap;

export type UserKeyring = {
  authorityKeyPair: KeyPair;
  discoveryKeyPair: KeyPair;
  encryptionKeyPair: KeyPair;
  nullifierKeyPair: NullifierKeyPair;
};

export type UserPublicKeys = {
  authorityPublicKey: Uint8Array;
  nullifierKeyCommitment: Uint8Array;
  discoveryPublicKey: Uint8Array;
  encryptionPublicKey: Uint8Array;
};
