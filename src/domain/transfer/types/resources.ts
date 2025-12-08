import type {
  AuthorizationSignature,
  Digest,
  EncodedResource,
  MerkleTree,
  NullifierKeyCommitment,
  Resource,
} from "wasm";

import type {
  KeyPair,
  NullifierKeyPair as NullifierKeyProps,
} from "domain/keys/models";

import type {
  ConsumedWitnessData,
  CreatedWitnessData,
  Permit2Data,
} from "./witness";

export type EphemeralMintProps = {
  userAddress: string;
  forwarderAddress: string;
  token: string;
  quantity: bigint;
  nkCommitment: NullifierKeyCommitment;
};

export type PersistentMintProps = {
  authVerifyingKey: string;
  encryptionPublicKey: string;
  forwarderAddress: string;
  token: string;
  quantity: bigint;
  consumedResourceNullifier: Digest;
  nkCommitment: NullifierKeyCommitment;
};

/**
 * Prop types for creating Transfer resources
 */
export type CreateMintProps = {
  authVerifyingKey: string;
  encryptionPublicKey: string;
  userAddress: string;
  nullifierKeypair: NullifierKeyProps;
  forwarderAddress: string;
  token: string;
  quantity: bigint;
};

// Create Resource Transfer or Split Transfer
export type CreateTransferProps = {
  resource: Resource;
  authKeypair: KeyPair;
  encryptionPublicKey: string;
  transferredResourceNullifier: Digest;
  receiverNullifierCommitment: NullifierKeyCommitment;
  receiverVerifyingKey: string;
  forwarderAddress: string;
  token: string;
  quantity: bigint;
};

export type CreateBurnProps = {
  burnResource: Resource;
  burnAddress: string;
  authKeypair: KeyPair;
  encryptionPublicKey: string;
  burnNullifierKeypair: NullifierKeyProps;
  forwarderAddress: string;
  token: string;
  quantity: bigint;
};

/**
 * Created resource responses
 */
export type CreatedResources = {
  actionTree: MerkleTree;
  consumedResource: Resource;
  createdResource: Resource;
};

export type AuthorizedResources = CreatedResources & {
  authSig: AuthorizationSignature;
};

export type SplitResources = AuthorizedResources & {
  paddingResource: Resource;
  remainderResource: Resource;
};

type Address = `0x${string}`; // TODO: Is this correct? Or is it base64-encoded?

// Props to construct consumed ephemeral resource
export type ConsumedEphemeralProps = {
  permit2Data: Permit2Data;
  senderWalletAddress: Address;
  tokenContractAddress: Address;
};

export type ConsumedPersistentProps = {
  senderAuthorizationSignature: string;
  senderAuthorizationVerifyingKey: string;
};

export type CreatedPersistentProps = {
  receiverDiscoveryPublicKey: string;
  receiverEncryptionPublicKey: string;
  authorityPublicKey: string;
  tokenContractAddress: Address;
};

/**
 * Resources
 */
type ResourceWithWitness = {
  resource: EncodedResource;
};

export type CreatedResource = ResourceWithWitness & {
  witness_data: CreatedWitnessData;
};

export type ConsumedResource = ResourceWithWitness & {
  nullifier_key: string;
  witness_data: ConsumedWitnessData;
};

export type Resources = {
  Created: CreatedResource;
  Consumed: ConsumedResource;
};

/**
 * Parameters request
 */
export type Parameters = {
  created_resources: Resources["Created"][];
  consumed_resources: Resources["Consumed"][];
};

export type ResourcePair = {
  consumed: ConsumedResource;
  created: CreatedResource;
};
