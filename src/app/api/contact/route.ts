import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Simple rate limiter per IP — max 3 pesan per 10 menit
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkContactLimit(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000; // 10 menit
  const record = contactRateLimit.get(ip);

  if (!record || now > record.resetAt) {
    contactRateLimit.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (record.count >= 3) return false;
  record.count++;
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limit ──
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    if (!checkContactLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak pesan. Coba lagi dalam 10 menit." },
        { status: 429 }
      );
    }

    // ── Validasi input ──
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama terlalu pendek." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: "Pesan terlalu pendek (minimal 10 karakter)." },
        { status: 400 }
      );
    }

    if (message.trim().length > 2000) {
      return NextResponse.json(
        { error: "Pesan terlalu panjang (maksimal 2000 karakter)." },
        { status: 400 }
      );
    }

    const toEmail = process.env.CONTACT_EMAIL;
    const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!toEmail) {
      console.error("CONTACT_EMAIL tidak ada di .env");
      return NextResponse.json(
        { error: "Konfigurasi email belum diatur." },
        { status: 500 }
      );
    }

    if (!resendApiKey) {
      console.error("RESEND_API_KEY tidak ada di .env");
      return NextResponse.json(
        { error: "Konfigurasi email belum diatur." },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    // ── Kirim notifikasi ke inbox kamu ──
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email.trim(),
      subject: `[Portfolio] Pesan baru dari ${name.trim()}`,
      html: buildEmailHTML({ name, email, message }),
    });

    // ── Kirim auto-reply ke pengirim ──
    await resend.emails.send({
      from: fromEmail,
      to: email.trim(),
      subject: "Pesan kamu sudah diterima!",
      html: buildAutoReplyHTML({ name }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pesan. Coba lagi." },
      { status: 500 }
    );
  }
}

// ── Email templates ──
function buildEmailHTML({
  name, email, message,
}: {
  name: string;
  email: string;
  message: string;
}): string {
  const time = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
    </head>
    <body style="margin:0;padding:0;background:#0f1117;font-family:'Courier New',monospace;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#13151f;border:1px solid #1e2130;border-radius:12px;overflow:hidden;">

              <!-- Header -->
              <tr>
                <td style="padding:24px 28px;border-bottom:1px solid #1e2130;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#3bba6e;">
                    portfolio.ai
                  </p>
                  <h1 style="margin:6px 0 0;font-size:18px;color:#e2e8f0;font-weight:600;">
                    📬 Pesan Baru Masuk
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding:24px 28px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-bottom:16px;">
                        <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;">Dari</p>
                        <p style="margin:0;font-size:14px;color:#e2e8f0;">${name}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:16px;">
                        <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;">Email</p>
                        <a href="mailto:${email}" style="margin:0;font-size:14px;color:#3bba6e;text-decoration:none;">${email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:16px;">
                        <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;">Pesan</p>
                        <div style="background:#0f1117;border:1px solid #1e2130;border-radius:8px;padding:16px;">
                          <p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${message}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p style="margin:0;font-size:11px;color:#475569;">${time}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td style="padding:0 28px 28px;">
                  <a href="mailto:${email}"
                    style="display:inline-block;padding:10px 20px;background:#3bba6e;color:#0f1117;
                    border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
                    Balas Sekarang →
                  </a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function buildAutoReplyHTML({ name }: { name: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0f1117;font-family:'Courier New',monospace;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#13151f;border:1px solid #1e2130;border-radius:12px;overflow:hidden;">

              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#3bba6e;">
                    portfolio.ai
                  </p>
                  <h1 style="margin:6px 0 20px;font-size:18px;color:#e2e8f0;font-weight:600;">
                    ✅ Pesan diterima, ${name}!
                  </h1>
                  <p style="margin:0 0 12px;font-size:13px;color:#94a3b8;line-height:1.7;">
                    Terima kasih sudah menghubungi saya. Pesan kamu sudah masuk
                    dan saya akan membalasnya dalam <strong style="color:#e2e8f0;">1×24 jam</strong>.
                  </p>
                  <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">
                    Kalau butuh respons lebih cepat, bisa langsung WhatsApp ya!
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
