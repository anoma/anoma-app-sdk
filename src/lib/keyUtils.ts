import type { UserKeyring, UserPublicKeys } from "types";

export const getUserPublicKeysFromKeyring = (
  keyring: UserKeyring
): UserPublicKeys => {
  return {
    authorityPublicKey: keyring.authorityKeyPair.publicKey,
    nullifierKeyCommitment: keyring.nullifierKeyPair.cnk,
    discoveryPublicKey: keyring.discoveryKeyPair.publicKey,
    encryptionPublicKey: keyring.encryptionKeyPair.publicKey,
  };
};
