import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { NewOrderForm } from "@/components/order/NewOrderForm";

export const metadata = { title: "Pesan Jasa", robots: { index: false } };

export default async function NewOrderPage() {
  await requireUser();
  return (
    <Suspense fallback={null}>
      <NewOrderForm />
    </Suspense>
  );
}
