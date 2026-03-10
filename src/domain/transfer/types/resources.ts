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
 * Parameters for {@link TransferLogic.createMintResources}.
 *
 * Represents a deposit of ERC-20 tokens into the privacy protocol.
 */
export type CreateMintProps = {
  /** The EVM address of the depositing user; encoded as the value reference of the consumed resource. */
  userAddress: string;
  /** Address of the Anoma Pay forwarder contract that handles the ERC-20 wrap. */
  forwarderAddress: Address;
  /** ERC-20 token contract address being deposited. */
  token: Address;
  /** Amount to deposit, in the token's base unit. */
  quantity: bigint;
  /** The caller's full keyring; nullifier and authority keys are used to construct resources. */
  keyring: UserKeyring;
};

/**
 * Parameters for {@link TransferLogic.createTransferResource}.
 *
 * Represents a private peer-to-peer transfer of an existing in-protocol resource.
 */
export type CreateTransferProps = {
  /** The existing (unspent) resource to consume. */
  resource: Resource;
  /** Address of the forwarder contract that issued the resource. */
  forwarderAddress: Address;
  /** ERC-20 token contract associated with the resource. */
  token: Address;
  /** Amount to send; must be ≤ the resource's quantity. */
  quantity: bigint;
  /** The sender's full keyring. */
  keyring: UserKeyring;
  /** The receiver's public keys (no private key material required). */
  receiverKeyring: UserPublicKeys;
};

/**
 * Parameters for {@link TransferLogic.createFeeTransferResource}.
 *
 * Represents a fee payment to the Heliax fee collector using an existing resource.
 */
export type CreateFeeTransferProps = {
  /** The resource to consume for the fee payment. */
  resource: Resource;
  /** Symbol of the fee token. Only `"USDC"`, `"XAN"`, and `"WETH"` are supported. */
  tokenSymbol: "USDC" | "XAN" | "WETH";
  /** ERC-20 token contract address for the fee token. */
  tokenContractAddress: Address;
  /** Fee amount in the token's base unit. */
  quantity: bigint;
  /** The payer's full keyring. */
  keyring: UserKeyring;
};

/**
 * Parameters for {@link TransferLogic.createBurnResource}.
 *
 * Represents a withdrawal of an in-protocol resource back to an EVM address.
 */
export type CreateBurnProps = {
  /** The resource to burn (consume and unwrap). */
  burnResource: Resource;
  /** EVM address that will receive the unwrapped ERC-20 tokens. */
  burnAddress: string;
  /** Address of the forwarder contract that will process the unwrap. */
  forwarderAddress: Address;
  /** ERC-20 token contract address. */
  token: Address;
  /** Amount to withdraw; must be ≤ the resource's quantity. */
  quantity: bigint;
  /** The caller's full keyring. */
  keyring: UserKeyring;
};

/**
 * Resources produced by {@link TransferLogic.createMintResources}.
 *
 * The `actionTree` is a Merkle tree of the nullifier and commitment digests
 * that must be authorized (signed) before being submitted to the backend.
 */
export type MintResources = {
  /** Merkle tree over `[consumedResourceNullifier, createdResourceCommitment]`. */
  actionTree: MerkleTree;
  /** Ephemeral resource representing the incoming ERC-20 tokens. */
  consumedResource: Resource;
  /** Persistent private resource credited to the depositor. */
  createdResource: Resource;
};

/**
 * Resources produced by the transfer, burn, and fee-transfer methods on
 * {@link TransferLogic}.
 *
 * The `actions` array contains the nullifier and commitment digests needed to
 * build a Merkle action tree; `paddingResource` and `remainderResource` are
 * present when the source resource was larger than `quantity` and a split was
 * required.
 */
export type CreatedResources = {
  /** Ordered list of nullifier and commitment digests for the action tree. */
  actions: Digest[];
  /** The resource that is being consumed (nullified). */
  consumedResource: Resource;
  /** The newly created resource addressed to the recipient. */
  createdResource: Resource;
  /** Zero-value padding resource required by the protocol's balanced-action rule, if applicable. */
  paddingResource?: Resource;
  /** Resource containing the leftover quantity after a split, if applicable. */
  remainderResource?: Resource;
};

/**
 * A {@link CreatedResources} result that has been authorized with the sender's
 * authority signature.
 *
 * Produced by the `authorizeCreatedResources` / `authorizeActions` helpers and
 * consumed by the `TransferBuilder.build*` methods.
 */
export type AuthorizedResources = CreatedResources & {
  /** ECDSA signature over the action Merkle root using the authority private key. */
  authSig: AuthoritySignature;
};

/**
 * A serialized resource together with its operation-specific witness data.
 * Base type for both {@link CreatedResource} and {@link ConsumedResource}.
 */
type ResourceWithWitness = {
  /** WASM-encoded resource payload. */
  resource: EncodedResource;
};

/**
 * A resource being created (output) in a proving backend request, paired with
 * its `CreatedWitnessData` (receiver public keys and token address).
 */
export type CreatedResource = ResourceWithWitness & {
  witness_data: CreatedWitnessData;
};

/**
 * A resource being consumed (input) in a proving backend request, paired with
 * the nullifier key and `ConsumedWitnessData` (sender keys and authorization sig).
 */
export type ConsumedResource = ResourceWithWitness & {
  resource: EncodedResource;
  /** Base64-encoded nullifier private key (`nk`) for the consumed resource. */
  nullifier_key: string;
  witness_data: ConsumedWitnessData;
};

/** Named union of the two resource role types. */
export type Resources = {
  Created: CreatedResource;
  Consumed: ConsumedResource;
};

/**
 * The top-level payload sent to the proving backend via
 * {@link TransferBackendClient.transfer}.
 *
 * Contains the full set of consumed (input) and created (output) resources for
 * one atomic operation, including all witness data required to generate ZK proofs.
 */
export type Parameters = {
  created_resources: Resources["Created"][];
  consumed_resources: Resources["Consumed"][];
};

/**
 * A matched pair of one consumed and one created resource.
 * Useful when iterating over balanced resource pairs.
 */
export type ResourcePair = {
  consumed: ConsumedResource;
  created: CreatedResource;
};

/**
 * ERC-20 token symbols that can be used to pay protocol fees.
 */
export const FeeCompatibleERC20Tokens = ["WETH", "USDC", "XAN"] as const;

/** Union of ERC-20 symbols accepted as fee tokens. */
export type FeeCompatibleERC20 = (typeof FeeCompatibleERC20Tokens)[number];

/** The native ETH token (paid directly, not via ERC-20 transfer). */
export type NativeToken = "ETH";

/** Any token that can be used to pay the Anoma Pay protocol fee. */
export type FeeToken = FeeCompatibleERC20 | NativeToken;

/**
 * Request body for {@link TransferBackendClient.estimateFee}.
 */
export type FeeRequest = {
  /** The token to use for fee payment. */
  fee_token: FeeToken;
  /** The transfer parameters to estimate fees for. */
  transaction: Parameters;
};

/**
 * Response from {@link TransferBackendClient.estimateFee}.
 */
export type FeeResponse = {
  /** Estimated fee in the `fee_token`'s base unit. */
  fee: bigint;
};

/**
 * Response from {@link TransferBackendClient.tokenPrice}.
 */
export type TokenPriceResponse = {
  /** The queried ERC-20 contract address. */
  address: Address;
  /** Current USD price of the token. */
  usd_price: number;
};

/**
 * Response from {@link TransferBackendClient.tokenBalances}.
 *
 * An array of token balance entries for the queried wallet.
 */
export type TokenBalancesResponse = {
  /** ERC-20 contract address. */
  address: Address;
  /** Number of decimal places. */
  decimals: number;
  /** Ticker symbol. */
  symbol: string;
  /** Raw balance as a decimal string (apply `decimals` to get human-readable amount). */
  value: `${bigint}`;
}[];
