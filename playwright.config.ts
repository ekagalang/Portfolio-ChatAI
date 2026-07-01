import { defineConfig, devices } from "@playwright/test";
import { E2E } from "./e2e/constants";

// E2E dijalankan terhadap production server (`next start`) di port terpisah (3100)
// dan DB terisolasi (portfolio_e2e). AUTH_URL http → cookie non-secure (jalan di http).
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false, // DB seed dibagi → serial agar deterministik
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: E2E.baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start",
    url: E2E.baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PORT: String(E2E.port),
      DATABASE_URL: E2E.dbUrl,
      ADMIN_EMAILS: E2E.adminEmail,
      AUTH_SECRET: "e2e-secret-at-least-32-characters-long-ok",
      AUTH_URL: E2E.baseURL,
      NEXTAUTH_URL: E2E.baseURL,
      NEXT_PUBLIC_APP_URL: E2E.baseURL,
      // Nilai dummy — tak dipakai karena payment/create diintersepsi di browser.
      MIDTRANS_SERVER_KEY: "e2e-test-server-key",
      MIDTRANS_CLIENT_KEY: "e2e-test-client-key",
    },
  },
});
