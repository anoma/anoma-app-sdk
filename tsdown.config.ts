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
  // Uncomment the following to generate exports in package.json
  // exports: true,
  dts: {
    build: true,
  },
  deps: {
    onlyBundle: ["abitype"],
  },
  outDir: "./dist",
});
