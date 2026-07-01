import { Suspense } from "react";
import { VerifyEmail } from "@/components/auth/VerifyEmail";

export const metadata = { title: "Verifikasi Email", robots: { index: false } };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
