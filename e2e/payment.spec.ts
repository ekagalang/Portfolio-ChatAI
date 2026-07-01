import { test, expect } from "@playwright/test";
import { E2E } from "./constants";
import { login, logout, createOrder } from "./helpers";

// Alur uang utuh di sisi app: user order → admin quote (DP) → user inisiasi bayar.
// Panggilan Midtrans (server-side) tidak diuji di sini; jalur webhook/aplikasi
// pembayaran sudah dicakup unit/integration test (signature, idempotency, nominal).
test("order → admin quote → user Bayar DP memanggil payment/create", async ({ page }) => {
  // 1) User buat order
  await login(page, E2E.userEmail, E2E.userPass);
  const orderId = await createOrder(page, "Landing page untuk peluncuran produk, butuh cepat.");
  await logout(page);

  // 2) Admin beri penawaran (Total + DP) → status quoted
  await login(page, E2E.adminEmail, E2E.adminPass);
  await page.goto(`/admin/orders/${orderId}`);
  await expect(page.getByText("Tetapkan Harga")).toBeVisible();
  await page.locator('input[placeholder="5000000"]').fill("5000000");
  await page.locator('input[placeholder="1500000"]').fill("1500000");
  const [quoteRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes(`/api/admin/orders/${orderId}`) && r.request().method() === "PATCH"),
    page.getByRole("button", { name: "Kirim Penawaran" }).click(),
  ]);
  expect(quoteRes.ok()).toBeTruthy();
  await logout(page);

  // 3) User melihat tombol Bayar DP & mengkliknya (payment/create diintersepsi)
  await login(page, E2E.userEmail, E2E.userPass);

  // Stub Snap agar tak butuh script Midtrans asli.
  await page.addInitScript(() => {
    (window as unknown as { snap: unknown }).snap = {
      pay: (_token: string, opts: { onSuccess?: (r: unknown) => void }) => opts.onSuccess?.({ ok: true }),
    };
  });
  await page.route("**/api/payment/create", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-fake-token", redirectUrl: "http://localhost/pay" }),
    })
  );

  await page.goto(`/dashboard/orders/${orderId}`);
  const payBtn = page.getByRole("button", { name: /Bayar DP/ });
  await expect(payBtn).toBeVisible();

  const [payReq] = await Promise.all([
    page.waitForRequest((r) => r.url().includes("/api/payment/create") && r.method() === "POST"),
    payBtn.click(),
  ]);
  const body = JSON.parse(payReq.postData() ?? "{}");
  expect(body).toMatchObject({ orderId, type: "dp" });

  // Tidak ada error pembayaran yang muncul.
  await expect(page.getByText(/Pembayaran gagal|Koneksi gagal/)).toHaveCount(0);
});
