import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/duitku";
import { services } from "@/data/services";
import type { CreatePaymentRequest } from "@/types/payment";

// Rate limit sederhana: max 5 request per menit per IP
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
  }

  try {
    const body: CreatePaymentRequest = await req.json();
    const { serviceId, customerName, email, phoneNumber, notes } = body;

    if (!serviceId || !customerName || !email) {
      return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: "Service tidak ditemukan" }, { status: 400 });
    }

    const merchantOrderId = `${serviceId.toUpperCase().replace(/-/g, "")}-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const result = await createInvoice({
      paymentAmount: service.pricing.starting,
      merchantOrderId,
      productDetails: `${service.title}${notes ? ` — ${notes}` : ""}`,
      customerVaName: customerName,
      email,
      phoneNumber,
      callbackUrl: `${appUrl}/api/payment/callback`,
      returnUrl: `${appUrl}/?payment=success`,
      expiryPeriod: 1440, // 24 jam
    });

    if (result.statusCode !== "00") {
      return NextResponse.json(
        { error: `Gagal membuat transaksi: ${result.statusMessage}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      reference: result.reference,
      paymentUrl: result.paymentUrl,
      orderId: merchantOrderId,
    });
  } catch (err) {
    console.error("[payment/create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
