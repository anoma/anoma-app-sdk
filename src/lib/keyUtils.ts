import type { UserKeyring, UserPublicKeys } from "types";
import { type PayAddress, encodePayAddress } from "./payAddress";

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

export const getPayAddressFromKeyring = (
  keyring?: UserKeyring
): PayAddress | undefined => {
  return keyring && encodePayAddress(getUserPublicKeysFromKeyring(keyring));
};
