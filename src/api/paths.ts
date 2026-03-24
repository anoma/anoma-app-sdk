export const TransferBackendPaths = {
  EstimateFee: "/estimate_fee",
  SendTransaction: "/send_transaction",
  TransactionStatus: "/transaction-status",
  StatsQueue: "/stats/queue",
  TokenPrice: "/token_price",
  TokenBalances: "/token_balances",
} as const;

export const IndexerPaths = {
  Health: "/health",
  AddKeys: "/add_key",
  Tags: "/tags",
} as const;
