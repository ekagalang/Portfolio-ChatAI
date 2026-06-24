import type { Metadata } from "next";
import { ContactPageContent } from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi Galang untuk diskusi project, kolaborasi, atau pertanyaan seputar jasa freelance web & mobile development.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
