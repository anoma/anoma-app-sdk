import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    primitives: "src/primitives.ts",
  },
  format: ["esm", "cjs"],
  // "neutral" not "browser": the SDK must also load under React Native.
  platform: "neutral",
  dts: true,
  sourcemap: true,
});
