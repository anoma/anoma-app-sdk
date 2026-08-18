import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "bundled/index.ts" },
  outDir: "bundled/dist",
  // ESM only: the wasm is located via import.meta.url.
  format: ["esm"],
  platform: "browser",
  dts: true,
  sourcemap: true,
});
