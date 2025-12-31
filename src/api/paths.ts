export const TransferBackendPaths = {
  SendTransaction: "/send_transaction",
  EstimateFee: "/estimate_fee",
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
