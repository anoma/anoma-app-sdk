import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "anomapay-sdk": resolve(import.meta.dirname, "src/index.js"),
        api: resolve(import.meta.dirname, "src/api/index.js"),
        domain: resolve(import.meta.dirname, "src/domain/index.js"),
        lib: resolve(import.meta.dirname, "src/lib/index.js"),
        wasm: resolve(import.meta.dirname, "src/wasm/index.js"),
      },
      name: "AnomaPay",
    },
    rollupOptions: {
      external: [
        "@noble/hashes",
        "@noble/secp256k1",
        "@uniswap/permit2-sdk",
        "crc-32",
        "viem",
        "wagmi",
        "zod",
      ],
    },
  },
  plugins: [dts(), tsconfigPaths()],
});
