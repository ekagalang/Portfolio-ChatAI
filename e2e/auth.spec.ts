import { test, expect } from "@playwright/test";
import { E2E } from "./constants";
import { login, logout } from "./helpers";

test.describe("Auth", () => {
  test("register akun baru → masuk dashboard", async ({ page }) => {
    const email = `reg-${Date.now()}@e2e.local`;
    await page.goto("/register");
    await page.locator('input[autocomplete="name"]').fill("Register Baru");
    await page.locator('input[autocomplete="email"]').fill(email);
    await page.locator('input[autocomplete="new-password"]').fill("PasswordBaru123!");
    await page.getByRole("button", { name: "Daftar", exact: true }).click();

    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    await expect(page.getByText(/Halo,/)).toBeVisible();
  });

  test("login user → dashboard, lalu logout → home", async ({ page }) => {
    await login(page, E2E.userEmail, E2E.userPass);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Halo,/)).toBeVisible();

    await logout(page);
    await expect(page).toHaveURL(new RegExp(`${E2E.baseURL.replace(/[.:/]/g, "\\$&")}/?$`));
  });

  test("password salah → pesan error", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[autocomplete="email"]').fill(E2E.userEmail);
    await page.locator('input[autocomplete="current-password"]').fill("SalahPassword!");
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(page.getByText("Email atau password salah.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin login → diarahkan ke panel admin", async ({ page }) => {
    await login(page, E2E.adminEmail, E2E.adminPass);
    // /dashboard me-redirect admin → /admin
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole("heading", { name: "Kelola Order" })).toBeVisible();
  });
});
