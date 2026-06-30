// Request dari frontend ke /api/payment/create
export interface CreatePaymentRequest {
  serviceId: string;
  customerName: string;
  email: string;
  phoneNumber?: string;
  notes?: string;
}

// Request body ke Midtrans Snap API (/snap/v1/transactions)
export interface MidtransSnapRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number; // harus = total item_details
  };
  customer_details?: {
    first_name?: string;
    email?: string;
    phone?: string;
  };
  item_details?: { id: string; name: string; price: number; quantity: number }[];
  callbacks?: {
    finish?: string; // URL redirect browser setelah popup selesai
  };
  expiry?: {
    unit: "minute" | "hour" | "day";
    duration: number;
  };
}

// Response dari Midtrans Snap API
export interface MidtransSnapResponse {
  token: string; // dipakai window.snap.pay(token)
  redirect_url: string; // fallback jika Snap JS tidak tersedia
}

// Notifikasi webhook dari Midtrans — dikirim via HTTP POST JSON
export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string; // capture | settlement | pending | deny | cancel | expire | refund
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string; // SHA512(order_id + status_code + gross_amount + serverKey)
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string; // accept | deny | challenge (khusus kartu kredit)
  currency: string;
}

// Hasil callback Snap JS di frontend (window.snap.pay options)
export interface MidtransSnapResult {
  order_id: string;
  status_code: string;
  transaction_status: string;
  [key: string]: unknown;
}

export type PaymentStatus = "pending" | "success" | "failed";
