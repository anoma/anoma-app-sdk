import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/api",
    "./src/domain",
    "./src/domain",
    "./src/wasm",
  ],
  format: ["esm", "cjs"],
  exports: true,
  dts: {
    build: true,
  },
  outDir: "./dist",
  copy: [
    {
      from: "./src/wasm/arm_bindings_bg.wasm",
      to: "./dist/",
    },
  ],
});
