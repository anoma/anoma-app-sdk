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
import { TRANSFER_LOGIC_VERIFYING_KEY, TransferLogicVerifyingKeys } from "lib-constants";
import { calculateValueRefFromAuth } from "domain/transfer/services";
import type { AppResource, SupportedFeeToken, TokenRegistry, UserKeyring, UserPublicKeys } from "types";
import type { Address } from "viem";
import { AuthorityVerifyingKey, NullifierKey, PublicKey } from "wasm";
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
// Heliax fee payment keys
// All three keys are the secp256k1 generator point (AffinePoint::GENERATOR).
// NKC is the SHA-256 of the default (all-zero) nullifier key.
// ---------------------------------------------------------------------------

const _HELIAX_PK = Buffer.from(
  "Anm+Zn753LusVaBilc6HCwcCm/zbLc4o2VnygVsW+BeY",
  "base64"
);
const _HELIAX_NKC = Buffer.from(
  "Zmh6rfhivXdsj8GLjp+OIAiXFIVu4jOzkCpZHQ1fKSU=",
  "base64"
);

const HELIAX_PUBLIC_KEYS: UserPublicKeys = {
  authorityPublicKey: new Uint8Array(_HELIAX_PK) as Uint8Array<ArrayBuffer>,
  encryptionPublicKey: new Uint8Array(_HELIAX_PK) as Uint8Array<ArrayBuffer>,
  discoveryPublicKey: new Uint8Array(_HELIAX_PK) as Uint8Array<ArrayBuffer>,
  nullifierKeyCommitment: new Uint8Array(_HELIAX_NKC) as Uint8Array<ArrayBuffer>,
};

// Map from lowercase ERC-20 address to fee token symbol.
const FEE_TOKEN_BY_ADDRESS: Record<string, SupportedFeeToken> = {
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC", // USDC Base
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC", // USDC Ethereum
  "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2": "USDT", // USDT Base
  "0x4200000000000000000000000000000000000006": "WETH", // WETH Base
};

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
  // Query with all known logicRef formats: v1/v2, with and without 0x prefix,
  // to be robust against different Envio storage conventions.
  const allLogicRefs = [
    TRANSFER_LOGIC_VERIFYING_KEY,
    `0x${TRANSFER_LOGIC_VERIFYING_KEY}`,
    TransferLogicVerifyingKeys.v2,
    `0x${TransferLogicVerifyingKeys.v2}`,
  ];
  const consumedTags = await envio.consumedTags(allLogicRefs);
  console.log(`  ${consumedTags.length} consumed tag(s) found`);
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

  const backend = new TransferBackendClient(BACKEND_URL);
  const transferBuilder = await TransferBuilder.init();

  // ---------------------------------------------------------------------------
  // Step 1: Estimate fee by building a no-fee version of the parameters.
  // The backend requires a fee payment resource in every burn transaction.
  // ---------------------------------------------------------------------------
  const feeToken = FEE_TOKEN_BY_ADDRESS[token.address.toLowerCase()];
  let fee = 0n;

  if (feeToken) {
    const resolver0 = new ParametersDraftResolver(transferBuilder, keyring);
    resolver0.addReceiver({
      type: "EvmAddress",
      address: EVM_DESTINATION,
      quantity: totalQuantity,
      token,
    });
    const resolved0 = resolver0.build(resources, forwarder);
    const params0 = new PayloadBuilder(keyring, resolved0)
      .withAuthorization()
      .build();

    try {
      const { base_fee, percentage_fee } = await backend.estimateFee({
        fee_token: feeToken,
        transaction: params0,
      });
      fee = BigInt(Math.max(base_fee, percentage_fee));
      console.log(
        `  Estimated fee: ${Number(fee) / 10 ** decimals} ${token.symbol}`
      );
    } catch (e) {
      console.warn("  Fee estimation failed — proceeding without fee payment:", e);
    }
  } else {
    console.warn(
      `  No fee token mapping for ${token.address} — proceeding without fee payment`
    );
  }

  // ---------------------------------------------------------------------------
  // Step 2: Build the actual sweep with fee payment included.
  // ---------------------------------------------------------------------------
  const resolver = new ParametersDraftResolver(transferBuilder, keyring);

  if (fee > 0n && fee < totalQuantity) {
    resolver.addReceiver({
      type: "EvmAddress",
      address: EVM_DESTINATION,
      quantity: totalQuantity - fee,
      token,
    });
    resolver.addReceiver({
      type: "AnomaAddress",
      userPublicKeys: HELIAX_PUBLIC_KEYS,
      quantity: fee,
      token,
    });
  } else {
    if (fee >= totalQuantity) {
      console.warn(
        `  Fee (${fee}) ≥ total quantity (${totalQuantity}) — skipping this group`
      );
      return null;
    }
    // fee === 0n or no fee token: attempt without fee (will likely fail in prod)
    resolver.addReceiver({
      type: "EvmAddress",
      address: EVM_DESTINATION,
      quantity: totalQuantity,
      token,
    });
  }

  const resolved = resolver.build(resources, forwarder);
  const parameters = new PayloadBuilder(keyring, resolved)
    .withAuthorization()
    .build();

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
    try {
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
    } catch (e) {
      // Re-throw terminal errors from the block above
      if (e instanceof Error && e.message.startsWith("Transaction ended with status:")) throw e;
      // Transient network error — log and retry
      process.stdout.write(`\n  Poll error (retrying): ${e instanceof Error ? e.message : e}`);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

function diagnose(keyring: UserKeyring, unspent: AppResource[]) {
  const wasmNkcHex = new NullifierKey(keyring.nullifierKeyPair.nk).commit().inner().toHex();
  const sdkCnkHex = Buffer.from(keyring.nullifierKeyPair.cnk).toString("hex");

  const authVk = new AuthorityVerifyingKey(keyring.authorityKeyPair.publicKey);
  const encPkHex = `0x${Buffer.from(keyring.encryptionKeyPair.publicKey).toString("hex")}`;
  const expectedValueRef = calculateValueRefFromAuth(authVk, encPkHex).toHex();

  const authPkB64 = new PublicKey(keyring.authorityKeyPair.publicKey).toBase64();
  const encPkB64 = new PublicKey(keyring.encryptionKeyPair.publicKey).toBase64();

  console.log("\n--- Diagnostics ---");
  console.log(`Keyring NKC (WASM/SDK hex): ${wasmNkcHex}`);
  console.log(`WASM/SDK NKC agree:         ${wasmNkcHex === sdkCnkHex}`);
  console.log(`Expected value_ref (hex):   ${expectedValueRef}`);
  console.log(`Auth PK (base64):           ${authPkB64}`);
  console.log(`Enc  PK (base64):           ${encPkB64}`);

  for (const r of unspent) {
    // Convert base64 resource fields to hex for comparison
    const nkcHex = Buffer.from(r.nk_commitment, "base64").toString("hex");
    const logicHex = Buffer.from(r.logic_ref, "base64").toString("hex");
    const valueHex = Buffer.from(r.value_ref, "base64").toString("hex");

    console.log(`\nResource ${r.rand_seed.slice(0, 8)}...`);
    console.log(`  logic_ref (hex):     ${logicHex}`);
    console.log(`  nk_commitment (hex): ${nkcHex}`);
    console.log(`  value_ref (hex):     ${valueHex}`);
    console.log(`  forwarder:           ${r.forwarder}`);
    console.log(`  token:               ${r.erc20TokenAddress}`);
    console.log(`  NKC matches keyring: ${nkcHex === wasmNkcHex}`);
    console.log(`  value_ref matches:   ${valueHex === expectedValueRef}`);
    console.log(`  Is v1 transfer:      ${logicHex === TRANSFER_LOGIC_VERIFYING_KEY}`);
    console.log(`  Is v2 transfer:      ${logicHex === TransferLogicVerifyingKeys.v2}`);
  }
  console.log("-------------------\n");
}

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

  diagnose(keyring, unspent);

  const groups = groupByToken(unspent);
  console.log(`Found ${groups.length} token group(s) to sweep.`);

  for (const group of groups) {
    const txId = await sweep(group, keyring);
    if (!txId) continue;
    const evmHash = await waitForProof(txId);
    console.log(`  EVM transaction: ${evmHash}`);
  }

  console.log("\nSweep complete.");
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
