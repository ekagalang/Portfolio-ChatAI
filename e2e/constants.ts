// Konstanta bersama untuk E2E: kredensial seed + koneksi DB terisolasi.
// DB e2e terpisah dari dev (portfolio_e2e) agar test tidak mengotori data dev.

export const E2E = {
  port: 3100,
  baseURL: "http://localhost:3100",
  // Lokal: Postgres docker di 5433. CI: override via E2E_DATABASE_URL.
  dbUrl:
    process.env.E2E_DATABASE_URL ??
    "postgresql://portfolio:portfolio@localhost:5433/portfolio_e2e?schema=public",

  // Admin di-seed langsung ke DB (signup email admin diblokir by design).
  // Email ini harus == ADMIN_EMAILS yang di-inject ke server (lihat playwright.config).
  adminEmail: "admin@e2e.local",
  adminPass: "AdminPass123!",

  userEmail: "user@e2e.local",
  userPass: "UserPass123!",
} as const;
