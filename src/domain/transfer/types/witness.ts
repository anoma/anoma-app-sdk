import type { Address } from "viem";

// Permit2 Data
export type Permit2Data = {
  deadline: number;
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
  receiverDiscoveryPublicKey: string;
  receiverEncryptionPublicKey: string;
  receiverAuthorizationVerifyingKey?: string;
  tokenContractAddress?: Address;
};

/**
 * TOKEN TRANSFER WITNESS DATA
 */
// `token_transfer::CreatedEphemeral`
type TokenTransferCreatedEphemeral = {
  tokenContractAddress: string;
  receiverWalletAddress: string;
};

// token_transfer::ConsumedEphemeral
type TokenTransferConsumedEphemeral = {
  permit2Data: Permit2Data;
  senderWalletAddress: string;
  tokenContractAddress: string;
};

// token_transfer::ConsumedPersistent
type TokenTransferConsumedPersistent = {
  senderAuthorizationVerifyingKey: string;
  senderAuthorizationSignature: string;
  senderEncryptionPublicKey: string;
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
