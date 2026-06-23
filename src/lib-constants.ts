import type { TokenId } from "types";

// Authorization signature domain
export const AUTH_SIGNATURE_DOMAIN = "TokenTransferAuthorization";

// Constants related to vault creation
// Defines the current version of the Vault. Should be incremented on every
// update of the vault structure, so users can migrate from old versions to the
// current one without the need of recreating the vault
export const VAULT_VERSION = 1;

// Separate the encryption of the vault into separate domains
export const PERSONAL_KEYRING_SALT = "anoma-pay:keyring-seed";
export const BUSINESS_KEYRING_SALT = "anoma-pay:business-keyring-seed";
export const PASSKEY_DOMAIN = "anoma-pay:passkeys";
export const RETURNING_USER_STORAGE_KEY = "anoma-pay:returning_user";

export const WEBSITE_URL = "https://anoma.money";
export const WEBSITE_DOMAIN = "anoma.money";
export const TERMS_URL = "https://anomapay.app/terms-and-conditions";

// General

// Polling interval to check for user balances:
export const balanceRefetchIntervalInMs = 10_000;

export const defaultTokenId: TokenId = "bsc:usdc";

// Beyond this threshold, the queue is considered under heavy load
export const heavyLoadThresholdInSeconds = 120;

// Polling interval to check for Bento queue stats:
export const statsQueueRefetchIntervalInMs = 20_000;

// How many times some mutations query should retry before throwing an error:
export const retryMutationsCount = 3;

// Token price can fluctuate between fee estimates, so accept convergence within 5%.
export const FeeFluctuationPercentage = 5n;

// Maximum number of decimal places to display for token amounts
export const MAX_DECIMALS = 6;

// How long (ms) to wait for a Permit2 allowance transaction to be mined before timing out.
export const permit2AllowanceTimeout = 60_000;

// Changing this message will invalidate all existing keyrings, so be careful when modifying it.
export const getSignMessage = (address: string) =>
  `I authorize AnomaPay to derive my account from address ${address}.\nDo NOT sign this message if the request url is not https://anomapay.app`;

export const DOCS_URL = "https://docs.anoma.net/anoma-pay-introduction";
