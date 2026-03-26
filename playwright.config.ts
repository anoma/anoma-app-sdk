import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
const baseURL =
  env.PLAYWRIGHT_BASE_URL ||
  (process.env.CI ? "http://localhost:4173" : "http://localhost:5173");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer:
    env.PLAYWRIGHT_BASE_URL ? undefined : (
      {
        command: process.env.CI ? "npm run preview" : "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      }
    ),
});
