// The constants below should never change.

import type { Network, SupportedChainId } from "types";

// Verifying Key for TrivialLogicWitness
export const PADDING_LOGIC_VK =
  "83d603b23e090c1400b018adb61f516386e9f2d523f983c3c417ab49b2037585";

// ID for Simple Transfer Logic
export const SIMPLE_TRANSFER_ID =
  "678b37ba70cfb1787c2436d7eb2ef3c588d1e1d6f30a7248e79436bd15f3fc11";

// Authorization signature domain
export const AUTH_SIGNATURE_DOMAIN = "TokenTransferAuthorization";

// Constants related to vault creation
// Defines the current version of the Vault. Should be incremented on every
// update of the vault structure, so users can migrate from old versions to the
// current one without the need of recreating the vault
export const VAULT_VERSION = 1;

// Separate the encryption of the vault into separate domains
export const KEK_DOMAIN_SALT = "anoma-pay:key_encryption_key";
export const STORAGE_KEY_DOMAIN_SALT =
  "anoma-pay:storage_authorization_secret_key";
export const VAULT_DOMAIN_INFO = "anoma-pay:vault-aes-key";

export const WEBSITE_URL = "https://anoma.money";
export const WEBSITE_DOMAIN = "anoma.money";

export const averageTimePerProofInSeconds = 22;
export const balanceRefetchIntervalInMs = 10_000;

export const EthereumMainnetChainId = 1;
export const EthereumSepoliaChainId = 11155111;
export const BaseMainnetChainId = 8453;
export const BaseSepoliaChainId = 84532;

export const EthereumMainnetForwarderContract =
  "0x0000000000000000000000000000000000000000";
export const EthereumSepoliaForwarderContract =
  "0x9bbC75f66f5344864FfABCF70625B99E42e5F108";
export const BaseMainnetForwarderContract =
  "0xfeE5b48919100c192E017992810c9539ebD00249";
export const BaseSepoliaFowarderContract =
  "0x0000000000000000000000000000000000000000";

export const ChainIdByNetwork: Record<Network, SupportedChainId | 0> = {
  ["eth-mainnet"]: EthereumMainnetChainId,
  ["eth-sepolia"]: EthereumSepoliaChainId,
  ["base-mainnet"]: BaseMainnetChainId,
  ["base-sepolia"]: BaseSepoliaChainId,
  ["unknown"]: 0,
};
