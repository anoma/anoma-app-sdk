import type { UserKeyring } from "types";
import type { Address } from "viem";

export type Vault = Record<Address, VaultEntry>;

export type VaultEntry = {
  id: string;
  iv: Uint8Array;
  ciphertext: ArrayBuffer;
  keyring?: UserKeyring;
  createdAt: number;
  modifiedAt: number;
  version: number;
};
