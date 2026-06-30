import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrderRequest, getUserOrders } from "@/lib/orders";
import { services } from "@/data/services";
import { sendNewOrderToAdmin } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Harus login" }, { status: 401 });
  }

  try {
    const { serviceId, brief, phone } = await req.json();

    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: "Jasa tidak valid" }, { status: 400 });
    }
    if (!brief?.trim() || brief.trim().length < 10) {
      return NextResponse.json(
        { error: "Jelaskan kebutuhan proyek (min 10 karakter)" },
        { status: 400 }
      );
    }

    const order = await createOrderRequest({
      userId: session.user.id,
      serviceId: service.id,
      serviceTitle: service.title,
      brief: brief.trim(),
      phone: phone?.trim() || undefined,
    });

    // Notifikasi admin (best-effort)
    void sendNewOrderToAdmin({
      orderId: order.id,
      serviceTitle: service.title,
      customerName: session.user.name ?? session.user.email ?? "Customer",
      customerEmail: session.user.email ?? "",
      brief: brief.trim(),
    });

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ error: "Gagal membuat order" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Harus login" }, { status: 401 });
  }
  const orders = await getUserOrders(session.user.id);
  return NextResponse.json({ orders });
}
