import type { UUID } from "crypto";
import type { TokenRegistry } from "types";
import type { Address, Hex } from "viem";

// HTTP status codes we may want to check for
export const HttpStatus = {
  Ok: 200,
  Created: 201,
  Unauthorized: 401,
  NotFound: 404,
  TeaPot: 418,
  TooManyRequests: 429,
  ServerError: 500,
} as const;

// Generic response
export type ResponseJson =
  | string
  | number
  | boolean
  | null
  | { [property: string]: ResponseJson }
  | ResponseJson[];

export class ResponseError extends Error {
  json: ResponseJson;
  status: number;
  /**
   * @param message - string
   * @param json - ResponseJson
   * @returns ResponseError
   */
  constructor(message: string, json: ResponseJson = {}, status: number) {
    super(message);
    this.name = "ResponseError";
    this.json = json;
    this.status = status;
  }
}

/**
 *  RESPONSES
 */
export type IndexerId = `${number}_${Address}`; // {chainId}_{address}

export type NullifierRecord = {
  id: IndexerId;
  nullifier: Hex;
  transaction: IndexerTransaction;
};

export type IndexerTransaction = {
  id: IndexerId;
  evmTransaction: IndexerEVMTransaction;
};

export type IndexerEVMTransaction = {
  id: IndexerId;
  chainId: number;
  txHash: Address;
  timestamp: number;
};

/** Single consumed nullifier returned by `POST /nullifying-transactions`. */
export type NullifyingTransactionTag = {
  timestamp: number;
  tag: Hex;
  transaction_hash: Address;
};

/** Consumed nullifiers grouped by chain/contract by the nullifying-transactions endpoint. */
export type NullifyingTransactionsContract = {
  chain_id: number;
  contract_address: Address;
  nullifiers: NullifyingTransactionTag[];
};

export type NullifyingTransactionsResponse = NullifyingTransactionsContract[];

export type IndexerBlob = {
  blob: Hex;
  id: string;
};

export type IndexerResource = {
  resource_payload: IndexerBlob;
  transaction_hash: Address;
};

export type IndexerResourceResponse = {
  resources: IndexerResource[];
};

export type MerkleProofResponse = {
  root: string;
  frontiers: {
    neighbour: string;
    is_left: boolean;
  }[];
};

// Protocol adaptor transaction receipt response
export type TransactionReceiptPAResponse<T = ResponseJson> = {
  inner: T;
  transactionHash: string;
  transactionIndex?: string;
  blockHash: string;
  blockNumber: string;
  gasUsed: string;
  logsBloom: string;
  status: string;
  effectiveGasPrice: string;
  from: string;
  to?: string;
  contractAddress?: string;
  //TODO: we need to add logs here
};

export type TransactionResponse<T = ResponseJson> = {
  receipt: TransactionReceiptPAResponse<T>;
};

export type ClientTransactionStatus =
  | "pending"
  | "validating"
  | "proofGeneration"
  | "broadcast"
  | "completed"
  | "failed";

export type SendTransactionResponse = {
  requestId: UUID;
};

export type TransactionResultResponse = {
  requestId: UUID;
  status: ClientTransactionStatus;
  transactionHash?: Hex | null;
  error?: string | null;
};

export type TransactionReceiptResponse = {
  transactionHash: string;
  blockNumber: number;
  status: boolean;
  gasUsed: number;
};

export type EstimateDurationResponse = {
  estimatedProcessingSeconds: number;
  estimatedQueueWaitSeconds: number;
  estimatedTotalSeconds: number;
  totalResources: number;
};

export type ChainEntry = {
  chain: string;
  chainId: number;
};

export type ChainsResponse = {
  chains: ChainEntry[];
};

export type Permit2AllowanceResponse = {
  erc20Allowance: string;
};

export type NetworkConfigurationResponse = {
  chain: string;
  chainId: number;
  enabled: boolean;
  testnet: boolean;
  protocolAdapterAddress: Address;
  trivialLogicVerifyingKey: string;
  transferLogicVerifyingKey: string;
  forwarderAddress: Address;
  percentageFee: number;
  baseFee: number;
  resourceFee: number;
  feeDiscoveryPk: string;
  feeEncryptionPk: string;
  feeAuthorityPk: string;
  feeNullifierKeyCommitment: string;
  tokens: Omit<TokenRegistry, "network">[];
};

export type NetworkConfigurationWrappedResponse = {
  configurations: NetworkConfigurationResponse[];
};

export type IndexerContract = {
  chain_id: number;
  contract_address: Address;
  last_block: number;
};

export type IndexerHealthResponse = {
  status: "ok";
  version: string; // "1.0.0",
  indexed_contracts: IndexerContract[];
};

export type IndexerAddKeysResponse = {
  status: "ok";
};

export type IndexerCheckKeysSyncResponse = Array<{
  synced: boolean;
  delay: number;
  chain_id: number;
  contract: string;
}>;
