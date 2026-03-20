/**
 * Register — registers the fee collector's discovery key with the indexer.
 * Run this once before using check-balance or the sweep script.
 *
 * Required env vars:
 *   ANOMAPAY_SEED or ANOMAPAY_KEYRING
 *   INDEXER_URL
 */

import { IndexerClient } from "api";
import { initWasmNode, resolveKeyring } from "./keyring";

const INDEXER_URL = process.env.INDEXER_URL ?? "https://indexer.anoma.money";

async function main() {
  console.log("=== AnomaPay Fee Collector — Register ===\n");

  initWasmNode();

  const keyring = resolveKeyring();
  const indexer = new IndexerClient(INDEXER_URL);

  const encodedKeypair = {
    secret_key: Buffer.from(keyring.discoveryKeyPair.privateKey).toString("hex"),
    public_key: Buffer.from(keyring.discoveryKeyPair.publicKey).toString("hex"),
  };

  console.log(`Registering discovery key with indexer...`);
  console.log(`  public_key: ${encodedKeypair.public_key}`);

  await indexer.addKeys(encodedKeypair);

  console.log("Done. You can now run fee-collector:balance.");
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
