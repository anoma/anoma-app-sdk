import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    api: "src/api/index.ts",
    domain: "src/domain/index.ts",
    lib: "src/lib/index.ts",
    types: "src/types.ts",
    wasm: "src/wasm/index.ts",
    "lib-constants": "src/lib-constants.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  deps: {
    alwaysBundle: ["@uniswap/permit2-sdk"],
  },
});
