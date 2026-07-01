import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Env dibaca modul saat import (mis. MIDTRANS_SERVER_KEY, ADMIN_EMAILS).
    env: {
      MIDTRANS_SERVER_KEY: "test-server-key",
      ADMIN_EMAILS: "admin@test.com, owner@test.com",
      DATABASE_URL: "file:./test.db",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
