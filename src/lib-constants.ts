import type { TokenId } from "types";
import type { Address, Chain } from "viem";
import { base, bsc, mainnet, sepolia } from "viem/chains";

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

export const defaultTokenId: TokenId = "bsc:usdc";

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

// Blocks deposit if total amount is bigger than maxBalanceInUsd
export const maxBalanceInUsd = Number(
  import.meta.env?.VITE_APP_MAX_DEPOSIT_AMOUNT_IN_USD ?? 1.0
);

// --- Chain configuration ---

export type Network =
  | "base"
  | "ethereum"
  | "ethereum-sepolia"
  | "bsc"
  | "unknown";

export type SupportedChain = Chain & {
  network: Exclude<Network, "unknown">;
  forwarderAddress: Address;
  iconName: string;
  explorerUrl: string;
  explorerName: string;
};

const defineSupportedChain = <const T extends Chain>(
  chain: T,
  config: Pick<SupportedChain, "network" | "forwarderAddress" | "iconName">
) =>
  ({
    ...chain,
    ...config,
    explorerUrl: chain.blockExplorers?.default.url,
    explorerName: chain.blockExplorers?.default.name,
  }) as SupportedChain & T;

export const allSupportedChains = [
  defineSupportedChain(mainnet, {
    network: "ethereum",
    forwarderAddress: "0x775C81A47F2618a8594a7a7f4A3Df2a300337559",
    iconName: "ethereum",
  }),
  defineSupportedChain(base, {
    network: "base",
    forwarderAddress: "0xfAa9DE773Be11fc759A16F294d32BB2261bF818B",
    iconName: "base",
  }),
  defineSupportedChain(sepolia, {
    network: "ethereum-sepolia",
    forwarderAddress: "0x0A62bE41E66841f693f922991C4e40C89cb0CFDF",
    iconName: "ethereum",
  }),
  defineSupportedChain(bsc, {
    network: "bsc",
    forwarderAddress: "0xDe6A308ed57AF26BFf059e6C550BD4908aC1840e",
    iconName: "bsc",
  }),
];

export const supportedChains = allSupportedChains.filter(
  // TODO update this condition when the backend supports multi chain
  chain => chain.id === Number(import.meta.env.VITE_APP_CHAIN_ID)
);

export type SupportedChainId = (typeof supportedChains)[number]["id"];

export const chainById = supportedChains.reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<SupportedChainId, SupportedChain>
);

export const chainByNetwork = supportedChains.reduce(
  (acc, chain) => {
    acc[chain.network] = chain;
    return acc;
  },
  {} as Record<Exclude<Network, "unknown">, SupportedChain>
);

// Token price can fluctuate between fee estimates, so accept convergence within 5%.
export const FeeFluctuationPercentage = 5n;
