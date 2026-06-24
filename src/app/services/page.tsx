import type { Metadata } from "next";
import { ServicesPageContent } from "@/components/ServicesPageContent";

export const metadata: Metadata = {
  title: "Jasa",
  description: "Jasa freelance Galang — Web App Fullstack, Mobile App, Landing Page, dan Backend API. Harga transparan, revisi 3x, 1 bulan garansi.",
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
