export const TransferBackendPaths = {
  // TODO: DELETE
  Split: "/split",

  // TODO: KEEP
  SendTransaction: "/send_transaction",
} as const;

export const IndexerPaths = {
  AddKeys: "/add_key",
  Tags: "/tags",
  LatestRoot: "/latest_root",
  GenerateProof: "/generate_proof",
} as const;
