/**
 * Shared utilities for fee collector scripts.
 *
 * resolveKeyring() accepts either:
 *   ANOMAPAY_KEYRING  — serialized JSON string (from serializeUserKeyring)
 *   ANOMAPAY_SEED     — 32-byte hex seed (from the generate-fee-account script)
 *
 * initWasmNode() loads the WASM binary from disk synchronously, bypassing the
 * browser fetch() loader which doesn't support file:// URLs in Node.js.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createUserKeyring, deserializeUserKeyring } from "domain/keys/services";
import type { UserKeyring } from "types";
import { initSync } from "wasm/arm_bindings";

export function initWasmNode() {
  const wasmPath = resolve(
    new URL(".", import.meta.url).pathname,
    "../../src/wasm/arm_bindings_bg.wasm"
  );
  const wasmBytes = readFileSync(wasmPath);
  initSync({ module: wasmBytes });
}

export function resolveKeyring(): UserKeyring {
  const seedHex = process.env.ANOMAPAY_SEED;
  if (seedHex) {
    const seed = new Uint8Array(Buffer.from(seedHex, "hex")) as Uint8Array<ArrayBuffer>;
    return createUserKeyring(seed);
  }

  const serialized = process.env.ANOMAPAY_KEYRING;
  if (serialized) {
    return deserializeUserKeyring(serialized);
  }

  throw new Error(
    "Either ANOMAPAY_SEED (hex) or ANOMAPAY_KEYRING (serialized JSON) must be set"
  );
}
