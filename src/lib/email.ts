import { Resend } from "resend";
import { formatIDR } from "@/lib/utils";

// Escape nilai dinamis sebelum disisipkan ke HTML email (cegah HTML injection)
function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

async function send(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY kosong — lewati:", subject);
    return false;
  }
  try {
    await new Resend(apiKey).emails.send({ from, to, subject, html });
    return true;
  } catch (err) {
    console.error("[email] gagal kirim:", subject, err);
    return false;
  }
}

// Layout kartu gelap konsisten
function wrap(heading: string, bodyHtml: string, cta?: { label: string; url: string }): string {
  const ctaHtml = cta
    ? `<a href="${esc(cta.url)}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:8px;padding:12px 20px;background:#3bba6e;color:#0f1117;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">${esc(cta.label)} →</a>`
    : "";
  return `
  <!DOCTYPE html><html><head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;background:#0f1117;font-family:'Courier New',monospace;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#13151f;border:1px solid #1e2130;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#3bba6e;">ekagalang.my.id</p>
          <h1 style="margin:6px 0 16px;font-size:18px;color:#e2e8f0;font-weight:600;">${esc(heading)}</h1>
          ${bodyHtml}
          ${ctaHtml}
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:13px;color:#94a3b8;line-height:1.7;">${text}</p>`;
}

function adminEmail(): string | undefined {
  return process.env.CONTACT_EMAIL;
}

// ───────────────── Verifikasi email ─────────────────
export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${appUrl()}/verify-email?token=${token}`;
  const body =
    p(`Halo ${esc(name)}, satu langkah lagi — konfirmasi alamat emailmu untuk mengaktifkan akun sepenuhnya.`) +
    p("Link ini berlaku 48 jam. Abaikan email ini bila kamu tidak mendaftar.");
  await send(to, "Verifikasi email kamu", wrap("Verifikasi Email", body, { label: "Verifikasi Email", url }));
}

// ───────────────── Reset password ─────────────────
export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${appUrl()}/reset-password?token=${token}`;
  const body =
    p(`Halo ${esc(name)}, ada permintaan untuk mereset password akunmu.`) +
    p("Klik tombol di bawah untuk membuat password baru. Link berlaku 1 jam. Jika ini bukan kamu, abaikan saja.");
  await send(to, "Reset password", wrap("Reset Password", body, { label: "Reset Password", url }));
}

// ───────────────── Fase 1: order baru → admin ─────────────────
export async function sendNewOrderToAdmin(o: {
  orderId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  brief: string;
}): Promise<void> {
  const to = adminEmail();
  if (!to) return;
  const body =
    p(`Jasa: <strong style="color:#e2e8f0;">${esc(o.serviceTitle)}</strong>`) +
    p(`Customer: ${esc(o.customerName)} &lt;${esc(o.customerEmail)}&gt;`) +
    p(`Brief: ${esc(o.brief)}`);
  await send(to, `🆕 Order baru: ${o.serviceTitle}`, wrap("Order Baru Masuk", body, {
    label: "Buka di Admin",
    url: `${appUrl()}/admin/orders/${o.orderId}`,
  }));
}

// ───────────────── Fase 2: harga ditetapkan → customer ─────────────────
export async function sendQuoteToCustomer(o: {
  to: string;
  customerName: string;
  orderId: string;
  serviceTitle: string;
  agreedTotal: number;
  dpAmount: number;
}): Promise<void> {
  const body =
    p(`Halo ${esc(o.customerName)}, penawaran untuk <strong style="color:#e2e8f0;">${esc(o.serviceTitle)}</strong> sudah siap.`) +
    p(`Harga kesepakatan: <strong style="color:#e2e8f0;">${formatIDR(o.agreedTotal)}</strong>`) +
    p(`DP untuk memulai: <strong style="color:#3bba6e;">${formatIDR(o.dpAmount)}</strong> (dipotong dari total)`);
  await send(o.to, `Penawaran siap — ${o.serviceTitle}`, wrap("Penawaran Siap", body, {
    label: "Lihat & Bayar DP",
    url: `${appUrl()}/dashboard/orders/${o.orderId}`,
  }));
}

// ───────────────── Fase 3: pembayaran diterima ─────────────────
export async function sendPaymentReceived(o: {
  to: string;
  customerName: string;
  orderId: string;
  serviceTitle: string;
  type: "dp" | "settlement";
  amount: number;
}): Promise<void> {
  const isDp = o.type === "dp";
  const body =
    p(`Pembayaran ${isDp ? "DP" : "pelunasan"} sebesar <strong style="color:#e2e8f0;">${formatIDR(o.amount)}</strong> untuk <strong style="color:#e2e8f0;">${esc(o.serviceTitle)}</strong> sudah diterima. Terima kasih, ${esc(o.customerName)}!`) +
    (isDp ? p("Saya akan segera memulai pengerjaan. Pantau progresnya di dashboard.") : p("Proyek selesai 🎉 Senang bekerja sama!"));
  await send(o.to, `${isDp ? "DP" : "Pelunasan"} diterima — ${o.serviceTitle}`, wrap(`${isDp ? "DP" : "Pelunasan"} Diterima`, body, {
    label: "Lihat Order",
    url: `${appUrl()}/dashboard/orders/${o.orderId}`,
  }));

  const admin = adminEmail();
  if (admin) {
    await send(admin, `💰 ${isDp ? "DP" : "Pelunasan"} masuk: ${o.serviceTitle}`, wrap(`${isDp ? "DP" : "Pelunasan"} Diterima`,
      p(`Order ${esc(o.orderId)} — ${formatIDR(o.amount)} dari ${esc(o.customerName)}`), {
        label: "Buka di Admin",
        url: `${appUrl()}/admin/orders/${o.orderId}`,
      }));
  }
}

// ───────────────── Fase 3: tagihan pelunasan terbit → customer ─────────────────
export async function sendSettlementInvoice(o: {
  to: string;
  customerName: string;
  orderId: string;
  serviceTitle: string;
  remaining: number;
}): Promise<void> {
  const body =
    p(`Halo ${esc(o.customerName)}, pekerjaan <strong style="color:#e2e8f0;">${esc(o.serviceTitle)}</strong> siap dilunasi.`) +
    p(`Sisa pelunasan: <strong style="color:#3bba6e;">${formatIDR(o.remaining)}</strong>`);
  await send(o.to, `Tagihan pelunasan — ${o.serviceTitle}`, wrap("Tagihan Pelunasan", body, {
    label: "Bayar Pelunasan",
    url: `${appUrl()}/dashboard/orders/${o.orderId}`,
  }));
}
