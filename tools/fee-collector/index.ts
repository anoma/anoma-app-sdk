/**
 * Fee Collector — sweeps all unspent resources from an AnomaPay fee collector
 * account to a destination EVM wallet.
 *
 * Required env vars:
 *   ANOMAPAY_KEYRING       Serialized keyring produced by serializeUserKeyring()
 *   EVM_DESTINATION        EVM wallet address to receive the swept funds
 *
 * Optional env vars:
 *   BACKEND_URL            Default: https://backend.anoma.money
 *   INDEXER_URL            Default: https://indexer.anoma.money
 *   ENVIO_URL              Default: https://envio.anoma.money/v1/graphql
 *   POLL_INTERVAL_MS       Milliseconds between status polls. Default: 5000
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.tools.json tools/fee-collector/index.ts
 */

import { EnvioClient, IndexerClient, TransferBackendClient } from "api";
import {
  buildTransactionLookup,
  openResourceMetadata,
  parseIndexerResourceResponse,
} from "domain/resources/services";
import { ParametersDraftResolver } from "domain/transfer/models/ParametersDraftResolver";
import { PayloadBuilder } from "domain/transfer/models/PayloadBuilder";
import { TransferBuilder } from "domain/transfer/models/TransferBuilder";
import { TRANSFER_LOGIC_VERIFYING_KEY } from "lib-constants";
import type { AppResource, TokenRegistry, UserKeyring } from "types";
import type { Address } from "viem";
import { initWasmNode, resolveKeyring } from "./keyring";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const EVM_DESTINATION = requireEnv("EVM_DESTINATION") as Address;
const BACKEND_URL = process.env.BACKEND_URL ?? "https://backend.anoma.money";
const INDEXER_URL = process.env.INDEXER_URL ?? "https://indexer.anoma.money";
const ENVIO_URL =
  process.env.ENVIO_URL ?? "https://envio.anoma.money/v1/graphql";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 5_000);

// ---------------------------------------------------------------------------
// Known tokens
// Add token metadata here for any token you expect to receive as fees.
// For unknown tokens the script will still sweep them using a minimal registry
// entry — but symbol and decimals will be placeholder values.
// ---------------------------------------------------------------------------

const KNOWN_TOKENS: Record<string, Omit<TokenRegistry, "address">> = {
  // USDC on Base mainnet
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
    symbol: "USDC",
    decimals: 6,
    network: "base",
  },
  // USDC on Ethereum mainnet
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    symbol: "USDC",
    decimals: 6,
    network: "ethereum",
  },
  // WETH on Base mainnet
  "0x4200000000000000000000000000000000000006": {
    symbol: "WETH",
    decimals: 18,
    network: "base",
  },
};

function tokenRegistryFor(address: Address): TokenRegistry {
  const known = KNOWN_TOKENS[address.toLowerCase()];
  if (known) return { ...known, address };
  console.warn(
    `  Unknown token ${address} — sweeping with placeholder metadata`
  );
  return { symbol: "UNKNOWN", decimals: 18, network: "unknown", address };
}

// ---------------------------------------------------------------------------
// Balance fetching
// ---------------------------------------------------------------------------

async function fetchUnspentResources(
  keyring: UserKeyring
): Promise<AppResource[]> {
  const indexer = new IndexerClient(INDEXER_URL);
  const envio = new EnvioClient(ENVIO_URL);

  const discoveryKeyHex = Buffer.from(
    keyring.discoveryKeyPair.privateKey
  ).toString("hex");

  console.log("Fetching resources from indexer...");
  const { resources: indexerResources } =
    await indexer.resources(discoveryKeyHex);
  console.log(`  ${indexerResources.length} encrypted resource(s) found`);

  const decrypted = await parseIndexerResourceResponse(
    keyring,
    indexerResources
  );
  console.log(`  ${decrypted.length} resource(s) belong to this keyring`);

  console.log("Fetching consumed tags from Envio...");
  const consumedTags = await envio.consumedTags(TRANSFER_LOGIC_VERIFYING_KEY);
  const lookup = buildTransactionLookup(consumedTags);

  const unspent = await openResourceMetadata(keyring, decrypted, lookup, true);
  console.log(`  ${unspent.length} unspent resource(s)`);
  return unspent;
}

// ---------------------------------------------------------------------------
// Sweep
// ---------------------------------------------------------------------------

type ResourceGroup = {
  token: TokenRegistry;
  forwarder: Address;
  resources: AppResource[];
  totalQuantity: bigint;
};

function groupByToken(resources: AppResource[]): ResourceGroup[] {
  const map = new Map<string, ResourceGroup>();

  for (const r of resources) {
    const key = `${r.erc20TokenAddress.toLowerCase()}:${r.forwarder.toLowerCase()}`;
    const existing = map.get(key);
    if (existing) {
      existing.resources.push(r);
      existing.totalQuantity += r.quantity;
    } else {
      map.set(key, {
        token: tokenRegistryFor(r.erc20TokenAddress),
        forwarder: r.forwarder,
        resources: [r],
        totalQuantity: r.quantity,
      });
    }
  }

  return [...map.values()];
}

async function sweep(group: ResourceGroup, keyring: UserKeyring) {
  const { token, forwarder, resources, totalQuantity } = group;
  const decimals = token.decimals;
  const humanAmount = Number(totalQuantity) / 10 ** decimals;

  console.log(
    `\nSweeping ${humanAmount} ${token.symbol} (${resources.length} resource(s)) → ${EVM_DESTINATION}`
  );

  const transferBuilder = await TransferBuilder.init();
  const resolver = new ParametersDraftResolver(transferBuilder, keyring);

  resolver.addReceiver({
    type: "EvmAddress",
    address: EVM_DESTINATION,
    quantity: totalQuantity,
    token,
  });

  const resolved = resolver.build(resources, forwarder);
  const parameters = new PayloadBuilder(keyring, resolved)
    .withAuthorization()
    .build();

  const backend = new TransferBackendClient(BACKEND_URL);
  const { transaction_hash: txId } = await backend.transfer(parameters);
  console.log(`  Submitted. Transaction ID: ${txId}`);

  return txId;
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

async function waitForProof(txId: string): Promise<string> {
  const backend = new TransferBackendClient(BACKEND_URL);
  const terminal = new Set(["Submitted", "Failed", "Unprocessable"]);

  process.stdout.write("  Waiting for on-chain submission");
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { status, hash } = await backend.transactionStatus(txId as any);

    if (status === "Submitted") {
      process.stdout.write(` ✓\n`);
      return hash;
    }
    if (terminal.has(status)) {
      process.stdout.write(`\n`);
      throw new Error(`Transaction ended with status: ${status}`);
    }

    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== AnomaPay Fee Collector ===\n");

  console.log("Initializing WASM...");
  initWasmNode();

  console.log("Restoring keyring...");
  const keyring = resolveKeyring();

  const unspent = await fetchUnspentResources(keyring);

  if (unspent.length === 0) {
    console.log("\nNo unspent resources found. Nothing to sweep.");
    return;
  }

  const groups = groupByToken(unspent);
  console.log(`\nFound ${groups.length} token group(s) to sweep.`);

  for (const group of groups) {
    const txId = await sweep(group, keyring);
    const evmHash = await waitForProof(txId);
    console.log(`  EVM transaction: ${evmHash}`);
  }

  console.log("\nSweep complete.");
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
