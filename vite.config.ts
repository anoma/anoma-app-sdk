import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "anomapay-sdk",
      name: "anomapay-sdk",
      formats: ["es", "umd"],
    },
  },
  plugins: [dts(), tsconfigPaths()],
});
