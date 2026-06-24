import type { Metadata } from "next";
import {
  LegalPageLayout,
  LegalQ,
} from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Pertanyaan yang sering ditanyakan seputar jasa freelance Galang — timeline, pembayaran, revisi, dan garansi.",
};

export default function FAQPage() {
  return (
    <LegalPageLayout
      title="FAQ"
      subtitle="Pertanyaan yang sering ditanyakan seputar jasa yang saya tawarkan."
      updatedAt="Juni 2025"
    >
      <LegalQ question="Berapa lama pengerjaan proyek?">
        Tergantung kompleksitas: Landing Page 3–14 hari, Backend & API 1–4 minggu, Web App / Mobile App 1–8 minggu.
        Estimasi lebih akurat diberikan setelah diskusi brief dan scope proyek.
      </LegalQ>

      <LegalQ question="Bagaimana sistem pembayarannya?">
        Down payment (DP) 50% di awal sebagai tanda jadi dan alokasi waktu, pelunasan 50% setelah proyek selesai
        dan disetujui klien. Pembayaran via transfer bank atau Duitku (QRIS, VA, dll).
      </LegalQ>

      <LegalQ question="Berapa kali bisa revisi?">
        3x revisi sudah termasuk dalam harga. Revisi ke-4 dan seterusnya dikenakan biaya tambahan
        yang disepakati bersama sesuai scope perubahan.
      </LegalQ>

      <LegalQ question="Apakah ada garansi setelah proyek selesai?">
        Ya — 1 bulan free maintenance untuk bug fixing yang timbul dari kode yang saya tulis.
        Penambahan fitur baru atau perubahan desain di luar scope awal diperlakukan sebagai proyek baru.
      </LegalQ>

      <LegalQ question="Apa yang perlu saya siapkan sebelum memulai proyek?">
        Brief proyek (tujuan, target pengguna, fitur utama), referensi desain jika ada, akses domain/hosting
        jika sudah punya, dan aset konten seperti teks, logo, dan gambar. Semakin lengkap brief, semakin
        akurat estimasi waktu dan biaya.
      </LegalQ>

      <LegalQ question="Apakah bisa meeting atau diskusi langsung?">
        Bisa via WhatsApp, Google Meet, atau Zoom. Saya menjaga komunikasi aktif selama proyek berlangsung
        dan memberikan update progres secara berkala.
      </LegalQ>

      <LegalQ question="Apakah kamu menerima proyek dari luar kota/negeri?">
        Ya, semua komunikasi dan pengerjaan bisa dilakukan secara remote. Pembayaran bisa via transfer bank
        lokal atau Duitku.
      </LegalQ>

      <LegalQ question="Apakah source code diberikan setelah proyek selesai?">
        Ya, full source code diserahkan kepada klien setelah pelunasan penuh. Tidak ada biaya lisensi
        tambahan — kamu memiliki penuh atas kode yang dibuat.
      </LegalQ>
    </LegalPageLayout>
  );
}
