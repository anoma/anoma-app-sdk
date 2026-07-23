import type { EncodedResource, MerkleTree, NullifierKey, Resource } from "wasm";

import type { TokenRegistry, UserKeyring, UserPublicKeys } from "types";
import type { Address, Hex } from "viem";
import type {
  ConsumedWitnessData,
  CreatedWitnessData,
  Permit2Data,
} from "./witness";

/**
 * A raw EVM call forwarded through the GenericCallForwarder. Calldata is hex
 * here (used to compute the resource `label_ref`); it is base64-encoded only
 * when serialized into the backend witness (`GenericCallInput`).
 */
export type EvmCall = {
  to: Address;
  value: bigint;
  data: Hex;
};

/**
 * Prop types for creating resources
 */
export type CreateMintProps = {
  userAddress: string;
  forwarderAddress: Address;
  token: Address;
  quantity: bigint;
  keyring: UserKeyring;
};

export type CreateFeeTransferProps = {
  resource: Resource;
  tokenContractAddress: Address;
  forwarderAddress: Address;
  quantity: bigint;
  keyring: UserKeyring;
};

export type MintResources = {
  actionTree: MerkleTree;
  consumedResource: Resource;
  createdResource: Resource;
};
/**
 * Resources
 */
type ResourceWithWitness = {
  resource: EncodedResource;
};

export type CreatedResource = ResourceWithWitness & {
  witnessData: CreatedWitnessData;
};

export type ConsumedResource = ResourceWithWitness & {
  resource: EncodedResource;
  nullifierKey: string;
  witnessData: ConsumedWitnessData;
};

export type Resources = {
  Created: CreatedResource;
  Consumed: ConsumedResource;
};

/**
 * Parameters request
 */
export type Parameters = {
  createdResources: Resources["Created"][];
  consumedResources: Resources["Consumed"][];
};

export type Receiver = { token: TokenRegistry; quantity: bigint } & (
  | {
    type: "AnomaAddress";
    userPublicKeys: UserPublicKeys;
  }
  | {
    type: "EvmAddress";
    address: Address;
  }
);

export type ConsumeIntent = {
  resource: Resource;
  nullifierKey: NullifierKey;
  token?: TokenRegistry;
} & (
    | {
      type: "AnomaAddress";
      userPublicKeys: UserPublicKeys;
    }
    | {
      type: "EvmAddress";
      address: Address;
      permit2Data: Permit2Data;
    }
    | {
      type: "Padding";
    }
    | {
      type: "GenericCall";
      forwarderAddress: Address;
      calls: EvmCall[];
    }
  );

export type CreateIntent = {
  resource: Resource;
  receiver?: Receiver;
};

export type ResolvedParameters = {
  createIntents: CreateIntent[];
  consumeIntents: ConsumeIntent[];
};

/**
 * Fees request & response
 */
export type FeeRequest = {
  feeToken: string;
  transaction: Parameters;
};

export type TokenMetadataResponse = {
  name: string;
  symbol: string;
  decimals: number;
};

export type FeeResponse = {
  baseFee: string;
  percentageFee: string;
  token: TokenMetadataResponse;
};

/**
 * Token price response
 */
export type TokenPriceEntry = {
  network: string;
  address: Address;
  usdPrice: number;
  lastUpdatedAt: string;
};

export type TokenPriceResponse = {
  prices: TokenPriceEntry[];
};

/**
 * Token balances response
 */
export type TokenBalancesResponse = {
  address: Address;
  decimals: number;
  symbol: string;
  value: `${bigint}`;
}[];
