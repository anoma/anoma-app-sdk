import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig.json excludes tests, and this plugin honours that exclude — point
  // it at the tests project so specs keep resolving the "domain/*", "lib/*" aliases.
  plugins: [tsconfigPaths({ projects: ["tsconfig.tests.json"] })],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
  },
});
