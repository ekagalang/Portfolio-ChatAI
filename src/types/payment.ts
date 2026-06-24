// Request dari frontend ke /api/payment/create
export interface CreatePaymentRequest {
  serviceId: string;
  customerName: string;
  email: string;
  phoneNumber?: string;
  notes?: string;
}

// Request body ke Duitku API — merchantCode & signature ada di header, bukan body
export interface DuitkuCreateRequest {
  paymentAmount: number;
  merchantOrderId: string;
  productDetails: string;
  email: string;
  customerVaName?: string;
  phoneNumber?: string;
  additionalParam?: string;
  merchantUserInfo?: string;
  itemDetails?: { name: string; price: number; quantity: number }[];
  callbackUrl: string;
  returnUrl: string;
  expiryPeriod?: number;
  paymentMethod?: string;
}

// Response dari Duitku API
export interface DuitkuCreateResponse {
  merchantCode: string;
  reference: string;   // dipakai checkout.process(reference, ...)
  paymentUrl: string;  // fallback jika JS SDK tidak tersedia
  statusCode: string;  // "00" = sukses
  statusMessage: string;
}

// Callback dari Duitku — dikirim via HTTP POST x-www-form-urlencoded
export interface DuitkuCallbackPayload {
  merchantCode: string;
  amount: string;
  merchantOrderId: string;
  productDetail: string;
  additionalParam?: string;
  paymentCode: string;
  resultCode: string;  // "00" sukses, "01" gagal
  merchantUserId?: string;
  reference: string;
  signature: string;   // HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)
}

// Respon JS callback dari checkout.process()
export interface DuitkuJsCallbackResult {
  resultCode: string;
  merchantOrderId: string;
  reference: string;
}

export type PaymentStatus = "pending" | "success" | "failed";
