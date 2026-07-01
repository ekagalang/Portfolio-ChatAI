import { Page, expect } from "@playwright/test";

// Input di app TIDAK punya name/id & label tak ter-asosiasi → match via
// autocomplete/type/placeholder, tombol via teks (bahasa Indonesia = default).

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[autocomplete="email"]').fill(email);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  // Sukses → keluar dari /login (ke /dashboard atau /admin).
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
}

export async function logout(page: Page) {
  await page.locator('button[aria-haspopup="menu"]').first().click();
  await page.getByRole("button", { name: "Keluar" }).click();
  await page.waitForURL("**/");
}

/** Buat order via UI dan kembalikan orderId (dari respons POST /api/orders). */
export async function createOrder(page: Page, brief: string): Promise<string> {
  await page.goto("/order/new?service=web-fullstack");
  await page.locator("textarea").first().fill(brief);
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/orders") && r.request().method() === "POST"),
    page.getByRole("button", { name: "Kirim Permintaan" }).click(),
  ]);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  await page.waitForURL("**/dashboard");
  return body.orderId as string;
}
