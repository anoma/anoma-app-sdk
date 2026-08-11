import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "src/index.ts" },
  // ESM only: src/index.ts locates the wasm through import.meta.url, which has
  // no CJS equivalent.
  format: ["esm"],
  platform: "browser",
  dts: true,
  sourcemap: true,
});
