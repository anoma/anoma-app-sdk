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

// Separate the encryption of the vault into separate domains
export const KEYRING_SALT = "anoma-pay:keyring-seed";
export const PASSKEY_DOMAIN = "anoma-pay:passkeys";
export const RETURNING_USER_STORAGE_KEY = "anoma-pay:returning_user";
