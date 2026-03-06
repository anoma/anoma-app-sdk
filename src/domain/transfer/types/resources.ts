import type {
  AuthoritySignature,
  Digest,
  EncodedResource,
  MerkleTree,
  Resource,
} from "wasm";

import type { UserKeyring, UserPublicKeys } from "types";
import type { Address } from "viem";
import type { ConsumedWitnessData, CreatedWitnessData } from "./witness";

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

export type CreateTransferProps = {
  resource: Resource;
  forwarderAddress: Address;
  token: Address;
  quantity: bigint;
  keyring: UserKeyring;
  receiverKeyring: UserPublicKeys;
};

export type CreateFeeTransferProps = {
  resource: Resource;
  tokenSymbol: "USDC" | "XAN" | "WETH";
  tokenContractAddress: Address;
  quantity: bigint;
  keyring: UserKeyring;
};

export type CreateBurnProps = {
  burnResource: Resource;
  burnAddress: string;
  forwarderAddress: Address;
  token: Address;
  quantity: bigint;
  keyring: UserKeyring;
};

export type MintResources = {
  actionTree: MerkleTree;
  consumedResource: Resource;
  createdResource: Resource;
};
/**
 * Created resource return types
 */
export type CreatedResources = {
  actions: Digest[];
  consumedResource: Resource;
  createdResource: Resource;
  paddingResource?: Resource;
  remainderResource?: Resource;
};

export type AuthorizedResources = CreatedResources & {
  authSig: AuthoritySignature;
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
  resource: EncodedResource;
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

/**
 * Fees
 */
export const FeeCompatibleERC20Tokens = ["WETH", "USDC", "XAN"] as const;
export type FeeCompatibleERC20 = (typeof FeeCompatibleERC20Tokens)[number];
export type NativeToken = "ETH";
export type FeeToken = FeeCompatibleERC20 | NativeToken;

/**
 * Fees request & response
 */
export type FeeRequest = {
  fee_token: FeeToken;
  transaction: Parameters;
};
export type FeeResponse = {
  fee: bigint;
};

/**
 * Token price response
 */
export type TokenPriceResponse = {
  address: Address;
  usd_price: number;
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
