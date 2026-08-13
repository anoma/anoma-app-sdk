import { defineConfig } from "vite";

export default defineConfig({
  // Pre-bundling breaks the wasm path the bindings resolve from import.meta.url.
  optimizeDeps: {
    exclude: ["@anomaorg/arm-bindings"],
  },
});
