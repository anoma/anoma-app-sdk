import type { UUID } from "crypto";
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

export type IndexerTag = {
  id: IndexerId;
  tagHash: Address;
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

export type ConsumedTagsResponse = IndexerTag[];

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
export type TransactionReceipt<T = ResponseJson> = {
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
  receipt: TransactionReceipt<T>;
};

export type TransactionHashResponse = {
  // TODO request for the backend team to rename this variable to transaction_uuid or something else
  transaction_hash: UUID;
};

export type TransactionStatusResponse = {
  status:
    | "New"
    | "Proving"
    | "Failed"
    | "Submitted"
    | "Submitting"
    | "Unprocessable"
    | "Proven";
  transaction_uuid: UUID;
  hash: string;
};

export type StatusQueueResponse = {
  created: number;
  completed: number;
  processing: number;
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
