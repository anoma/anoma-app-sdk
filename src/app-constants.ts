// The constants below should never change.

// Verifying Key for TrivialLogicWitness
export const PADDING_LOGIC_VK =
  "d67cdd850ca9eb834fb0a7ca49489d88a3301ffdd31462f502280c906bffaf75";

// ID for Simple Transfer Logic
export const SIMPLE_TRANSFER_ID =
  "81f8104fe367f5018a4bb0b259531be9ab35d3f1d51dea46c204bee154d5ee9e";

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
