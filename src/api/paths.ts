import type { UUID } from "types";

export const ApiPaths = {
  Configuration: () => `/api/v1/configuration/all`,
  SendTransaction: (network: string) => `/api/v1/transactions/${network}`,
  TransactionResult: (id: UUID) => `/api/v1/transactions/${id}`,
  TransactionStatus: (id: UUID) => `/api/v1/transactions/${id}/status`,
  TransactionReceipt: (network: string, hash: string) =>
    `/api/v1/transactions/receipt/${network}/${hash}`,
  EstimateFee: (network: string) =>
    `/api/v1/transactions/${network}/estimate-fee`,

  TokenPrices: (tokens: string[]) =>
    `/api/v1/tokens/prices?tokens=${tokens.join(",")}`,
  TokenBalances: (network: string, address: string) =>
    `/api/v1/tokens/${network}/${address}/balances`,
  Permit2Allowance: (network: string, owner: string, token: string) =>
    `/api/v1/tokens/${network}/${owner}/permit2/${token}/allowance`,

  EstimateDuration: (network: string) =>
    `/api/v1/transactions/${network}/estimate-duration`,
  Health: "/health",
} as const;

export const IndexerPaths = {
  Health: "/health",
  AddKeys: "/add_key",
  Tags: "/tags",
  NullifyingTransactions: "/nullifying-transactions",
  CheckKeysSync: "/sync-status",
  Rpc: "/alchemy",
} as const;
