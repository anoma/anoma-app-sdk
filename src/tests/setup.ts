// initSdk() locates its wasm with a file: URL, which Node's fetch refuses
// ("not implemented... yet..."). Serve those reads from disk instead.
import { readFile } from "node:fs/promises";

// Node's fetch refuses file: URLs, so hand wasm-bindgen the bytes directly.
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = input instanceof URL ? input : new URL(String(input));
  if (url.protocol !== "file:") return realFetch(input, init);
  return new Response(await readFile(url), {
    headers: { "content-type": "application/wasm" },
  });
}) as typeof fetch;
