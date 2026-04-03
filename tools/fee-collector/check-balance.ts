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
import { TRANSFER_LOGIC_VERIFYING_KEY, TransferLogicVerifyingKeys } from "lib-constants";
import type { Address } from "viem";
import { initWasmNode, resolveKeyring } from "./keyring";

const INDEXER_URL = process.env.INDEXER_URL ?? "https://indexer.anoma.money";
const ENVIO_URL =
  process.env.ENVIO_URL ?? "https://envio.anoma.money/v1/graphql";

const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  // USDC
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { symbol: "USDC", decimals: 6 },  // Ethereum
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": { symbol: "USDC", decimals: 6 },  // Base
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": { symbol: "USDC", decimals: 18 }, // BSC (18 dec override)
  // USDT
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6 },  // Ethereum
  "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2": { symbol: "USDT", decimals: 6 },  // Base
  "0x55d398326f99059ff775485246999027b3197955": { symbol: "USDT", decimals: 18 }, // BSC (18 dec override)
  // WETH
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": { symbol: "WETH", decimals: 18 }, // Ethereum
  "0x4200000000000000000000000000000000000006": { symbol: "WETH", decimals: 18 }, // Base
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8": { symbol: "WETH", decimals: 18 }, // BSC
  // XAN
  "0xcedbea37c8872c4171259cdfd5255cb8923cf8e7": { symbol: "XAN", decimals: 18 },  // Ethereum
  "0xf1b53d35c8516151f4c1f6a99e35e45b9c759983": { symbol: "XAN", decimals: 18 },  // Base
  "0x7427bd9542e64d1ac207a540cfce194b7390a07f": { symbol: "XAN", decimals: 18 },  // BSC
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
  // Query with all known logicRef formats (v1/v2, with/without 0x prefix)
  const allLogicRefs = [
    TRANSFER_LOGIC_VERIFYING_KEY,
    `0x${TRANSFER_LOGIC_VERIFYING_KEY}`,
    TransferLogicVerifyingKeys.v2,
    `0x${TransferLogicVerifyingKeys.v2}`,
  ];
  const consumedTags = await envio.consumedTags(allLogicRefs);
  console.log(`${consumedTags.length} consumed tag(s) found in Envio`);
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
