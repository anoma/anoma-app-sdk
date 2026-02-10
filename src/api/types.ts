import type { Hex } from "viem";

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
export type NullifierResponse = {
  nullifier: string;
  index: string;
};

export type IndexerBlob = {
  blob: Hex;
  id: string;
};

export type IndexerResource = {
  id: string;
  tag: string;
  public_key: string;
  resource_payload: IndexerBlob;
  discovery_payload: IndexerBlob;
  is_consumed: boolean;
};

export type IndexerResourceResponse = {
  status: "ok";
  resources: IndexerResource[];
};

export type IndexerVaultResponse = {
  ciphertext: string;
  ciphertext_signature: string;
  initialization_vector: string;
  storage_authorization_public_key: string;
  user_address: string;
  version: number;
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
  transaction_hash: string;
};

export type StatusQueueResponse = {
  created: number;
  completed: number;
  processing: number;
};
