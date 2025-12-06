import type { UserKeyring } from "types";
import type { Address } from "viem";

export type Vault = Record<Address, VaultEntry>;

export type VaultEncryptionType = "wallet" | "passkey" | "seedphrase";

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
