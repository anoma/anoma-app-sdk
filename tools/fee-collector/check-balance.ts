/**
 * Check Balance — prints the unspent resource balance for an AnomaPay account.
 *
 * Required env vars:
 *   ANOMAPAY_KEYRING       Serialized keyring produced by serializeUserKeyring()
 *
 * Optional env vars:
 *   INDEXER_URL            Default: https://indexer.anoma.money
 *   ENVIO_URL              Default: https://envio.anoma.money/v1/graphql
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.tools.json tools/fee-collector/check-balance.ts
 */

import { EnvioClient, IndexerClient } from "api";
import {
  buildTransactionLookup,
  openResourceMetadata,
  parseIndexerResourceResponse,
} from "domain/resources/services";
import { TRANSFER_LOGIC_VERIFYING_KEY } from "lib-constants";
import type { Address } from "viem";
import { initWasmNode, resolveKeyring } from "./keyring";

const INDEXER_URL = process.env.INDEXER_URL ?? "https://indexer.anoma.money";
const ENVIO_URL =
  process.env.ENVIO_URL ?? "https://envio.anoma.money/v1/graphql";

const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": { symbol: "USDC", decimals: 6 },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { symbol: "USDC", decimals: 6 },
  "0x4200000000000000000000000000000000000006": { symbol: "WETH", decimals: 18 },
};

function formatAmount(quantity: bigint, address: Address): string {
  const token = KNOWN_TOKENS[address.toLowerCase()];
  if (!token) return `${quantity} (raw, unknown token)`;
  const human = Number(quantity) / 10 ** token.decimals;
  return `${human} ${token.symbol}`;
}

async function main() {
  console.log("=== AnomaPay Balance Check ===\n");

  initWasmNode();

  const keyring = resolveKeyring();
  const indexer = new IndexerClient(INDEXER_URL);
  const envio = new EnvioClient(ENVIO_URL);

  const discoveryKeyHex = Buffer.from(
    keyring.discoveryKeyPair.privateKey
  ).toString("hex");

  const { resources: indexerResources } =
    await indexer.resources(discoveryKeyHex);
  const decrypted = await parseIndexerResourceResponse(
    keyring,
    indexerResources
  );
  const consumedTags = await envio.consumedTags(TRANSFER_LOGIC_VERIFYING_KEY);
  const lookup = buildTransactionLookup(consumedTags);
  const unspent = await openResourceMetadata(keyring, decrypted, lookup, true);

  if (unspent.length === 0) {
    console.log("No unspent resources found.");
    return;
  }

  // Group by token address
  const totals = new Map<string, bigint>();
  for (const r of unspent) {
    const key = r.erc20TokenAddress.toLowerCase();
    totals.set(key, (totals.get(key) ?? 0n) + r.quantity);
  }

  console.log(`${unspent.length} unspent resource(s):\n`);
  for (const [address, total] of totals) {
    console.log(`  ${formatAmount(total, address as Address)}  (${address})`);
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
