import type { EncodedResource } from "@anoma/lib";

export type ApiConfig = {
  baseUrl: string;
  port?: number;
  endpoint?: string;
};

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
  /**
   * @param message - string
   * @param json - ResponseJson
   * @returns ResponseError
   */
  constructor(message: string, json: ResponseJson = {}) {
    super(message);
    this.name = "ResponseError";
    this.json = json;
  }
}

/**
 * REQUESTS
 */
export type SplitRequest = {
  to_split_resource: EncodedResource;
  created_resource: EncodedResource;
  remainder_resource: EncodedResource;
  padding_resource: EncodedResource;
  sender_nf_key: string; // base64
  sender_verifying_key: string; // hex
  auth_signature: string; // base64
  owner_discovery_pk: string; // hex
  owner_encryption_pk: string; // hex
  receiver_discovery_pk: string; // hex
  receiver_encryption_pk: string; // hex
};

/**
 *  RESPONSES
 */

export type NullifierResponse = {
  nullifier: string;
  index: string;
};

export type IndexerBlob = {
  blob: string;
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
