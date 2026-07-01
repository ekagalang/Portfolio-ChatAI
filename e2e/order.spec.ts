import { test, expect } from "@playwright/test";
import { E2E } from "./constants";
import { login, createOrder } from "./helpers";

test("user buat order → tampil di dashboard status 'Menunggu penawaran'", async ({ page }) => {
  await login(page, E2E.userEmail, E2E.userPass);
  const orderId = await createOrder(page, "Butuh aplikasi web fullstack untuk manajemen inventori toko.");
  expect(orderId).toBeTruthy();

  // Dashboard menampilkan order baru dengan badge status awal.
  await expect(page.getByText("Menunggu penawaran").first()).toBeVisible();

  // Detail order dapat dibuka.
  await page.goto(`/dashboard/orders/${orderId}`);
  await expect(page.getByText("Menunggu penawaran").first()).toBeVisible();
});
