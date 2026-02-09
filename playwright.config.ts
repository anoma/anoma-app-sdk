import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
const baseURL = env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const isRemoteBaseURL = Boolean(baseURL && !baseURL.includes("localhost"));

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer:
    isRemoteBaseURL ? undefined : (
      {
        command: "npm run dev",
        url: baseURL ?? "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
      }
    ),
});
