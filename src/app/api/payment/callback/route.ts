import { NextRequest, NextResponse } from "next/server";
import { verifyCallbackSignature } from "@/lib/duitku";

// Duitku mengirim callback via HTTP POST dengan Content-Type: application/x-www-form-urlencoded
// resultCode "00" = sukses, "01" = gagal
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);

    const merchantCode  = params.get("merchantCode")  ?? "";
    const amount        = params.get("amount")        ?? "";
    const merchantOrderId = params.get("merchantOrderId") ?? "";
    const resultCode    = params.get("resultCode")    ?? "";
    const reference     = params.get("reference")     ?? "";
    const signature     = params.get("signature")     ?? "";

    const isValid = verifyCallbackSignature(merchantCode, amount, merchantOrderId, signature);
    if (!isValid) {
      console.warn("[payment/callback] Invalid signature:", { merchantOrderId, merchantCode });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    if (resultCode === "00") {
      console.log(`[payment/callback] SUKSES — order: ${merchantOrderId}, ref: ${reference}, amount: ${amount}`);
      // TODO: simpan ke database, kirim email konfirmasi, dsb.
    } else {
      console.log(`[payment/callback] GAGAL/PENDING — order: ${merchantOrderId}, code: ${resultCode}`);
    }

    // Duitku mengharapkan HTTP 200 sebagai tanda callback diterima
    return NextResponse.json({ status: "OK" });
  } catch (err) {
    console.error("[payment/callback]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
