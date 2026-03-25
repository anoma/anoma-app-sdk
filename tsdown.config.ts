import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/api",
    { constants: "./src/lib-constants.ts" },
    "./src/domain",
    "./src/lib",
    "./src/wasm",
    "./src/types",
  ],
  format: ["esm", "cjs"],
  exports: true,
  dts: {
    build: true,
  },
  deps: {
    onlyBundle: ["abitype"],
  },
  outDir: "./dist",
  copy: [
    {
      from: "./src/wasm/arm_bindings_bg.wasm",
      to: "./dist/",
    },
  ],
});
