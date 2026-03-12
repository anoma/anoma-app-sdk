import type {
  AuthoritySignature,
  EncodedResource,
  MerkleTree,
  NullifierKey,
  Resource,
} from "wasm";

import type { TokenRegistry, UserKeyring, UserPublicKeys } from "types";
import type { Address } from "viem";
import type {
  ConsumedWitnessData,
  CreatedWitnessData,
  Permit2Data,
} from "./witness";

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
  nullifierKey: NullifierKey;
  receiverKeyring: UserPublicKeys;
};

export type CreateBurnProps = {
  resource: Resource;
  forwarderAddress: Address;
  token: Address;
  receiverAddress: Address;
  quantity: bigint;
  nullifierKey: NullifierKey;
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
 * Created resource return types
 */
export type CreatedResources = {
  actions: string[];
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

export type ConsumedResourceDraft = {
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
);

export type CreatedResourceDraft = {
  resource: Resource;
  receiver?: Receiver;
};

export type ResolvedParameters = {
  createdResourceDrafts: CreatedResourceDraft[];
  consumedResourceDrafts: ConsumedResourceDraft[];
};

/**
 * Fees
 */
export const FeeCompatibleERC20Tokens = [
  "USDC",
  "USDT",
  "WETH",
  "XAN",
] as const;
export type SupportedFeeToken = (typeof FeeCompatibleERC20Tokens)[number];

/**
 * Fees request & response
 */
export type FeeRequest = {
  fee_token: SupportedFeeToken;
  transaction: Parameters;
};

export type FeeResponse = {
  base_fee: number;
  base_fee_per_resource: number;
  percentage: number;
  percentage_fee: number;
  token_type: string;
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
