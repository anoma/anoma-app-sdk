import type { KeyPair, NullifierKeyPair } from "domain/keys/models";
import type { Hex } from "viem";

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
  Storage: "ANOMA_STATIC_STORAGE_KEY",
} as const;

export type PRFDomain = typeof PRFDomainMap;

export type UserKeyring = {
  authorityKeyPair: KeyPair;
  discoveryKeyPair: KeyPair;
  encryptionKeyPair: KeyPair;
  nullifierKeyPair: NullifierKeyPair;
  storageKey: Uint8Array<ArrayBuffer>;
};

export type KeyPairJson = Record<string, Hex>;

export type UserKeyringJson = {
  authorityKeyPair: KeyPairJson;
  discoveryKeyPair: KeyPairJson;
  encryptionKeyPair: KeyPairJson;
  nullifierKeyPair: KeyPairJson;
  storageKey: Hex;
};

export type UserPublicKeys = {
  authorityPublicKey: Uint8Array<ArrayBuffer>;
  nullifierKeyCommitment: Uint8Array<ArrayBuffer>;
  discoveryPublicKey: Uint8Array<ArrayBuffer>;
  encryptionPublicKey: Uint8Array<ArrayBuffer>;
};
