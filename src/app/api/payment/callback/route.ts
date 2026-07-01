import { NextRequest, NextResponse } from "next/server";
import { verifyNotificationSignature } from "@/lib/midtrans";
import { mapTransactionStatus, applyWebhook, getOrderById } from "@/lib/orders";
import { sendPaymentReceived } from "@/lib/email";
import type { MidtransNotification } from "@/types/payment";

// Midtrans mengirim notifikasi via HTTP POST body JSON.
// URL didaftarkan di dashboard: Settings → Configuration → Payment Notification URL.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MidtransNotification;
    const {
      order_id, // = Payment.midtransOrderId
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
      payment_type,
      fraud_status,
    } = body;

    const isValid = verifyNotificationSignature(order_id, status_code, gross_amount, signature_key);
    if (!isValid) {
      console.warn("[payment/callback] Invalid signature:", { order_id });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const status = mapTransactionStatus(transaction_status, fraud_status);

    const { firstSuccess, type, orderId } = await applyWebhook({
      midtransOrderId: order_id,
      transactionId: transaction_id,
      transactionStatus: transaction_status,
      paymentType: payment_type,
      status,
      grossAmount: parseFloat(gross_amount), // rupiah; dicocokkan ke nominal tercatat
    });

    console.log(`[payment/callback] ${status.toUpperCase()} — ${order_id} (${transaction_status})`);

    // Email konfirmasi hanya pada sukses pertama
    if (firstSuccess && orderId && type) {
      const order = await getOrderById(orderId);
      if (order) {
        const amount =
          type === "dp"
            ? order.dpAmount ?? 0
            : (order.agreedTotal ?? 0) - (order.dpAmount ?? 0);
        void sendPaymentReceived({
          to: order.user.email,
          customerName: order.user.name ?? order.user.email,
          orderId: order.id,
          serviceTitle: order.serviceTitle,
          type: type as "dp" | "settlement",
          amount,
        });
      }
    }

    return NextResponse.json({ status: "OK" });
  } catch (err) {
    console.error("[payment/callback]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
