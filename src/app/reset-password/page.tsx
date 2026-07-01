import { Suspense } from "react";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata = { title: "Reset Password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
