import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSnapTransaction } from "@/lib/midtrans";
import { getOrderForUser, createPaymentRecord } from "@/lib/orders";

// Rate limit sederhana: max 5 request per menit per user
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Harus login" }, { status: 401 });
  }
  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
  }

  try {
    const { orderId, type } = await req.json();
    if (type !== "dp" && type !== "settlement") {
      return NextResponse.json({ error: "Tipe pembayaran tidak valid" }, { status: 400 });
    }

    const order = await getOrderForUser(orderId, session.user.id);
    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    // Validasi status & hitung nominal dari order (bukan dari input client)
    let amount: number;
    if (type === "dp") {
      if (order.status !== "quoted") {
        return NextResponse.json({ error: "DP hanya bisa dibayar saat status menunggu DP" }, { status: 400 });
      }
      amount = order.dpAmount ?? 0;
    } else {
      if (order.status !== "awaiting_settlement") {
        return NextResponse.json({ error: "Pelunasan belum bisa dibayar" }, { status: 400 });
      }
      amount = (order.agreedTotal ?? 0) - (order.dpAmount ?? 0);
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Nominal tidak valid" }, { status: 400 });
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const midtransOrderId = `${order.id}-${type === "dp" ? "DP" : "STL"}-${Date.now()}`;

    const result = await createSnapTransaction({
      transaction_details: { order_id: midtransOrderId, gross_amount: amount },
      customer_details: {
        first_name: session.user.name ?? session.user.email ?? "Customer",
        email: session.user.email ?? undefined,
        phone: order.phone ?? undefined,
      },
      item_details: [
        {
          id: order.id,
          name: `${type === "dp" ? "DP" : "Pelunasan"} — ${order.serviceTitle}`.slice(0, 50),
          price: amount,
          quantity: 1,
        },
      ],
      callbacks: { finish: `${appUrl}/dashboard/orders/${order.id}` },
      expiry: { unit: "hour", duration: 24 },
    });

    await createPaymentRecord({
      orderId: order.id,
      type,
      grossAmount: amount,
      midtransOrderId,
      snapToken: result.token,
    });

    return NextResponse.json({ token: result.token, redirectUrl: result.redirect_url });
  } catch (err) {
    console.error("[payment/create]", err);
    return NextResponse.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}
