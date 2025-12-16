// The constants below should never change.

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
