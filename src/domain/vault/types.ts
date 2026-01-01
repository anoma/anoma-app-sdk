import type { PayAddress } from "lib/payAddress";
import type { UserKeyring } from "types";
import type { Address } from "viem";

export type Vault = Record<Address, VaultEntry>;

export type VaultEncryptionType = "wallet" | "passkey";

export type VaultEntry = {
  id: string;
  iv: Uint8Array<ArrayBuffer>;
  ciphertext: ArrayBuffer;
  keyring?: UserKeyring;
  encryptionType: VaultEncryptionType;
  createdAt: number;
  modifiedAt: number;
  version: number;
};

export type SerializedVaultEntry = Omit<VaultEntry, "keyring"> & {
  keyring: string;
};

export type DecryptedVaultEntry = VaultEntry & {
  keyring: UserKeyring;
};

export type VaultDataTransferObject = {
  storageAuthorizationPublicKey: string;
  userAddress: PayAddress;
  ciphertext: string;
  initializationVector: string;
  ciphertextSignature: string;
  version: number;
};
