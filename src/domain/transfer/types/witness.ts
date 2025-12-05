// Permit2 Data
export type Permit2Data = {
  deadline: bigint;
  nonce: string;
  signature: string;
};

/**
 * TRIVIAL WITNESS DATA
 */
// `trivial::ConsumedEphemeral`
type ConsumedEphemeral = Record<string, never>;
// `trivial::CreatedEphemeral`
type CreatedEphemeral = Record<string, never>;

// `token_transfer::CreatedPersistent`
type TokenTransferCreatedPersistent = {
  receiver_discovery_public_key: string;
  receiver_encryption_public_key: string;
  receiver_authorization_verifying_key: string;
  token_contract_address: string;
};

/**
 * TOKEN TRANSFER WITNESS DATA
 */
// `token_transfer::CreatedEphemeral`
type TokenTransferCreatedEphemeral = {
  token_contract_address: string;
  receiver_wallet_address: string;
};

// token_transfer::ConsumedEphemeral
type TokenTransferConsumedEphemeral = {
  permit2_data: Permit2Data;
  sender_wallet_address: string;
  token_contract_address: string;
};

// token_transfer::ConsumedPersistent
type TokenTransferConsumedPersistent = {
  sender_authorization_verifying_key: string;
  sender_authorization_signature: string;
};

//************************************************************************
// RESOURCES
//************************************************************************

type Trivial = {
  CreatedEphemeral: CreatedEphemeral;
  ConsumedEphemeral: ConsumedEphemeral;
};

type TokenTransfer = {
  CreatedEphemeral: TokenTransferCreatedEphemeral;
  CreatedPersistent: TokenTransferCreatedPersistent;
  ConsumedEphemeral: TokenTransferConsumedEphemeral;
  ConsumedPersistent: TokenTransferConsumedPersistent;
};

type CreatedWitnessDataEnum = {
  Persistent: TokenTransfer["CreatedPersistent"];
  Ephemeral: TokenTransfer["CreatedEphemeral"];
  TrivialEphemeral: Trivial["CreatedEphemeral"];
};

type ConsumedWitnessDataEnum = {
  Persistent: TokenTransfer["ConsumedPersistent"];
  Ephemeral: TokenTransfer["ConsumedEphemeral"];
  TrivialEphemeral: Trivial["ConsumedEphemeral"];
};

//************************************************************************
// TOP-LEVEL SCHEMAS
//************************************************************************

// Created Witness Data Schema
export type CreatedWitnessDataSchema = {
  Ephemeral: CreatedWitnessDataEnum["Ephemeral"];
  Persistent: CreatedWitnessDataEnum["Persistent"];
  TrivialEphemeral: CreatedWitnessDataEnum["TrivialEphemeral"];
};

// Consumed Witness Data Schema
export type ConsumedWitnessDataSchema = {
  Persistent: ConsumedWitnessDataEnum["Persistent"];
  Ephemeral: ConsumedWitnessDataEnum["Ephemeral"];
  TrivialEphemeral: ConsumedWitnessDataEnum["TrivialEphemeral"];
};

export type CreatedWitnessData = Partial<CreatedWitnessDataSchema>;
export type ConsumedWitnessData = Partial<ConsumedWitnessDataSchema>;
