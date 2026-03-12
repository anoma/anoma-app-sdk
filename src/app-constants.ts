import { fromBase64 } from "lib/utils";
import type { Network, SupportedChainId, UserPublicKeys } from "types";

// Verifying Key for TrivialLogicWitness
// https://github.com/anoma/arm-risc0/blob/main/arm/src/constants.rs#L23
export const TRIVIAL_LOGIC_VERIFYING_KEY =
  "21fcc2fc2c07f9753405d3070f2488c67389f7d797b6f6e20a9f2529fe4a0bff";

// ID for Simple Transfer Logic
// https://github.com/anoma/anomapay-backend/blob/main/simple_transfer/transfer_library/src/lib.rs#L27
export const TRANSFER_LOGIC_VERIFYING_KEY =
  "bc12323668c37c3d381ca798f11116f35fb1639d12239b29da7810df3985e7ad";

// Authorization signature domain
export const AUTH_SIGNATURE_DOMAIN = "TokenTransferAuthorization";

// Constants related to vault creation
// Defines the current version of the Vault. Should be incremented on every
// update of the vault structure, so users can migrate from old versions to the
// current one without the need of recreating the vault
export const VAULT_VERSION = 1;

// Separate the encryption of the vault into separate domains
export const KEYRING_SALT = "anoma-pay:keyring-seed";
export const PASSKEY_DOMAIN = "anoma-pay:passkeys";
export const RETURNING_USER_STORAGE_KEY = "anoma-pay:returning_user";

export const WEBSITE_URL = "https://anoma.money";
export const WEBSITE_DOMAIN = "anoma.money";
export const TERMS_URL = "https://anomapay.app/terms-and-conditions";

// General

// Estimate time to calculate a proof:
export const averageTimePerProofInSeconds = 20;

// Polling interval to check for user balances:
export const balanceRefetchIntervalInMs = 10_000;

/**
 * The folloiwng constants determine the normal load threshhold,
 * beyond which the queue could be said to be under heavy load
 */
export const provingGPUs = 11; // TODO: Use value from endpoint when availalbe
export const proofPerTx = 3;
export const estimatedTxTimeInSeconds = 120;

// Polling interval to check for Bento queue stats:
export const statsQueueRefetchIntervalInMs = 20_000;

// How many times some mutations query should retry before throwing an error:
export const retryMutationsCount = 3;

export const EthereumMainnetChainId = 1;
export const EthereumSepoliaChainId = 11155111;
export const BaseMainnetChainId = 8453;

// Blocks deposit if total amount is bigger than maxBalanceInUsd
export const maxBalanceInUsd = Number(
  import.meta.env?.VITE_APP_MAX_DEPOSIT_AMOUNT_IN_USD ?? 1.0
);

export const EthereumMainnetForwarderContract =
  "0x775C81A47F2618a8594a7a7f4A3Df2a300337559";
export const EthereumSepoliaForwarderContract =
  "0x0A62bE41E66841f693f922991C4e40C89cb0CFDF";
export const BaseMainnetForwarderContract =
  "0xfAa9DE773Be11fc759A16F294d32BB2261bF818B";

export const ChainIdByNetwork: Record<Network, SupportedChainId | 0> = {
  ["ethereum"]: EthereumMainnetChainId,
  ["ethereum-sepolia"]: EthereumSepoliaChainId,
  ["base"]: BaseMainnetChainId,
  ["unknown"]: 0,
};

export const NetworkName: Record<SupportedChainId, string> = {
  [BaseMainnetChainId]: "base",
  [EthereumMainnetChainId]: "eth",
  [EthereumSepoliaChainId]: "eth",
};

export const TxExplorerUrlByChainId: Record<SupportedChainId, string> = {
  [BaseMainnetChainId]: "https://basescan.org/tx/",
  [EthereumMainnetChainId]: "https://etherscan.io/tx/",
  [EthereumSepoliaChainId]: "https://sepolia.etherscan.io/tx/",
};

export const ExplorerNameByChainId: Record<SupportedChainId, string> = {
  [BaseMainnetChainId]: "BaseScan",
  [EthereumMainnetChainId]: "EtherScan",
  [EthereumSepoliaChainId]: "EtherScan",
};

/**
 * Heliax Public Keys to pay Fees to
 */
export const HeliaxKeys = {
  HELIAX_FEE_DISCOVERY_PK: "Anm+Zn753LusVaBilc6HCwcCm/zbLc4o2VnygVsW+BeY",
  HELIAX_FEE_ENCRYPTION_PK: "Anm+Zn753LusVaBilc6HCwcCm/zbLc4o2VnygVsW+BeY",
  HELIAX_FEE_AUTHORITY_PK: "Anm+Zn753LusVaBilc6HCwcCm/zbLc4o2VnygVsW+BeY",
  HELIAX_FEE_NULLIFIER_KEY_COMMITMENT:
    "Zmh6rfhivXdsj8GLjp+OIAiXFIVu4jOzkCpZHQ1fKSU=",
};

export const HeliaxPublicKeys: UserPublicKeys = {
  discoveryPublicKey: fromBase64(HeliaxKeys.HELIAX_FEE_DISCOVERY_PK),
  encryptionPublicKey: fromBase64(HeliaxKeys.HELIAX_FEE_ENCRYPTION_PK),
  authorityPublicKey: fromBase64(HeliaxKeys.HELIAX_FEE_AUTHORITY_PK),
  nullifierKeyCommitment: fromBase64(
    HeliaxKeys.HELIAX_FEE_NULLIFIER_KEY_COMMITMENT
  ),
};

// Token price can fluctuate between fee estimates, so accept convergence within 5%.
export const FeeFluctuationPercentage = 5n;
