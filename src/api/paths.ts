export const TransferBackendPaths = {
  EstimateFee: "/estimate_fee",
  SendTransaction: "/send_transaction",
  StatsQueue: "/stats/queue",
  TokenPrice: "/token_price",
  TokenBalances: "/token_balances",
} as const;

export const IndexerPaths = {
  AddKeys: "/add_key",
  Tags: "/tags",
  LatestRoot: "/latest_root",
  GenerateProof: "/generate_proof",
  StoreKeyring: "/keyblob",
  AllowList: "/rating",
} as const;
