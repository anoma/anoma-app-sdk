export const TransferBackendPaths = {
  SendTransaction: "/send_transaction",
  EstimateFee: "/estimate_fee",
} as const;

export const IndexerPaths = {
  AddKeys: "/add_key",
  Tags: "/tags",
  LatestRoot: "/latest_root",
  GenerateProof: "/generate_proof",
} as const;
