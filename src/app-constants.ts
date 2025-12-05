// The constants below should never change.

// Verifying Key for TrivialLogicWitness
export const PADDING_LOGIC_VK =
  "83d603b23e090c1400b018adb61f516386e9f2d523f983c3c417ab49b2037585";

// ID for Simple Transfer Logic
export const SIMPLE_TRANSFER_ID =
  "e751cb8fb403db5bf7838ef434e952652c5e197fe61bd9d7a907e67c4f9d9725";

// Authorization signature domain
export const AUTH_SIGNATURE_DOMAIN = "SimpleTransferAuthorization";

// Constants related to vault creation
// Defines the current version of the Vault. Should be incremented on every
// update of the vault structure, so users can migrate from old versions to the
// current one without the need of recreating the vault
export const VAULT_VERSION = 1;

// Separate the encryption of the vault into separate domains
export const VAULT_DOMAIN_SALT = "anoma-pay";
export const VAULT_DOMAIN_INFO = "anoma-pay:vault-aes-key";
