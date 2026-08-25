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

/**
 * GENERIC CALL WITNESS DATA
 */
// `generic_call::CallInput` — a single EVM call forwarded through the
// `GenericCallForwarder`. `data` is base64-encoded calldata (the backend
// decodes it as `Vec<u8>`); `value` is wei sent with the call (0 for ERC-20 swaps).
export type GenericCallInput = {
  to: Address;
  value: number;
  data: string;
};

// `generic_call::ConsumedEphemeral` and `generic_call::CreatedEphemeral` share
// this shape: the forwarder address (forms `label_ref`) plus the calls to run.
type GenericCallEphemeral = {
  forwarderAddress: Address;
  calls: GenericCallInput[];
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

type GenericCall = {
  CreatedEphemeral: GenericCallEphemeral;
  ConsumedEphemeral: GenericCallEphemeral;
};

type CreatedWitnessDataEnum = {
  TokenTransferPersistent: TokenTransfer["CreatedPersistent"];
  TokenTransferEphemeralUnwrap: TokenTransfer["CreatedEphemeralUnwrap"];
  TrivialEphemeral: Trivial["CreatedEphemeral"];
  GenericCallEphemeral: GenericCall["CreatedEphemeral"];
};

type ConsumedWitnessDataEnum = {
  TokenTransferPersistent: TokenTransfer["ConsumedPersistent"];
  TokenTransferEphemeralWrap: TokenTransfer["ConsumedEphemeralWrap"];
  TrivialEphemeral: Trivial["ConsumedEphemeral"];
  GenericCallEphemeral: GenericCall["ConsumedEphemeral"];
};

//************************************************************************
// TOP-LEVEL SCHEMAS
//************************************************************************

// Created Witness Data Schema
export type CreatedWitnessDataSchema = {
  TokenTransferEphemeralUnwrap: CreatedWitnessDataEnum["TokenTransferEphemeralUnwrap"];
  TokenTransferPersistent: CreatedWitnessDataEnum["TokenTransferPersistent"];
  TrivialEphemeral: CreatedWitnessDataEnum["TrivialEphemeral"];
  GenericCallEphemeral: CreatedWitnessDataEnum["GenericCallEphemeral"];
};

// Consumed Witness Data Schema
export type ConsumedWitnessDataSchema = {
  TokenTransferPersistent: ConsumedWitnessDataEnum["TokenTransferPersistent"];
  TokenTransferEphemeralWrap: ConsumedWitnessDataEnum["TokenTransferEphemeralWrap"];
  TrivialEphemeral: ConsumedWitnessDataEnum["TrivialEphemeral"];
  GenericCallEphemeral: ConsumedWitnessDataEnum["GenericCallEphemeral"];
};

export type CreatedWitnessData = Partial<CreatedWitnessDataSchema>;
export type ConsumedWitnessData = Partial<ConsumedWitnessDataSchema>;
