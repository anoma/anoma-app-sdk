import type { Address } from "viem";

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
  receiver_authorization_verifying_key?: string;
  token_contract_address?: Address;
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
  sender_encryption_public_key: string;
};

//************************************************************************
// RESOURCES
//************************************************************************

type Trivial = {
  CreatedEphemeral: CreatedEphemeral;
  ConsumedEphemeral: ConsumedEphemeral;
};

type TokenTransfer = {
  CreatedEphemeralUnwrap: TokenTransferCreatedEphemeral;
  CreatedPersistent: TokenTransferCreatedPersistent;
  ConsumedEphemeralWrap: TokenTransferConsumedEphemeral;
  ConsumedPersistent: TokenTransferConsumedPersistent;
};

type CreatedWitnessDataEnum = {
  TokenTransferPersistent: TokenTransfer["CreatedPersistent"];
  TokenTransferEphemeralUnwrap: TokenTransfer["CreatedEphemeralUnwrap"];
  TrivialEphemeral: Trivial["CreatedEphemeral"];
};

type ConsumedWitnessDataEnum = {
  TokenTransferPersistent: TokenTransfer["ConsumedPersistent"];
  TokenTransferEphemeralWrap: TokenTransfer["ConsumedEphemeralWrap"];
  TrivialEphemeral: Trivial["ConsumedEphemeral"];
};

//************************************************************************
// TOP-LEVEL SCHEMAS
//************************************************************************

// Created Witness Data Schema
export type CreatedWitnessDataSchema = {
  TokenTransferEphemeralUnwrap: CreatedWitnessDataEnum["TokenTransferEphemeralUnwrap"];
  TokenTransferPersistent: CreatedWitnessDataEnum["TokenTransferPersistent"];
  TrivialEphemeral: CreatedWitnessDataEnum["TrivialEphemeral"];
};

// Consumed Witness Data Schema
export type ConsumedWitnessDataSchema = {
  TokenTransferPersistent: ConsumedWitnessDataEnum["TokenTransferPersistent"];
  TokenTransferEphemeralWrap: ConsumedWitnessDataEnum["TokenTransferEphemeralWrap"];
  TrivialEphemeral: ConsumedWitnessDataEnum["TrivialEphemeral"];
};

export type CreatedWitnessData = Partial<CreatedWitnessDataSchema>;
export type ConsumedWitnessData = Partial<ConsumedWitnessDataSchema>;
