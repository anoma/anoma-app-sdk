// Loads the built package the way a consumer would and exercises one
// round-trip. Guards the wasm lookup in dist/index.js: src/index.ts resolves
// index_bg.wasm relative to import.meta.url, so any change to the bundle layout
// or the published `files` list breaks here rather than in someone's app.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Node's fetch refuses file: URLs, so hand wasm-bindgen the bytes directly.
const realFetch = globalThis.fetch;
globalThis.fetch = async input => {
  const url = input instanceof URL ? input : new URL(String(input));
  if (url.protocol !== "file:") return realFetch(input);
  return new Response(await readFile(url), {
    headers: { "content-type": "application/wasm" },
  });
};

const { initSdk, Digest, randomBytes } = await import("../dist/index.js");

await initSdk();

const bytes = randomBytes();
assert.equal(bytes.length, 32, "randomBytes should return 32 bytes");

const hex = Digest.fromBytes(bytes).toHex();
assert.match(hex, /^[0-9a-f]{64}$/, `unexpected digest hex: ${hex}`);
assert.equal(
  Digest.fromHex(hex).toHex(),
  hex,
  "Digest hex round-trip must be stable"
);

assert.notEqual(
  Digest.zero().toHex(),
  hex,
  "random digest must differ from zero"
);

console.log("smoke ok:", hex);
