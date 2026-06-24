import type { Metadata } from "next";
import {
  LegalPageLayout,
  LegalSection,
  LegalP,
  LegalLi,
} from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan jasa freelance Galang — pembayaran, hak IP, revisi, dan tanggung jawab.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Syarat & Ketentuan"
      subtitle="Dengan memesan jasa, klien dianggap telah membaca dan menyetujui syarat berikut."
      updatedAt="Juni 2025"
    >
      <LegalSection title="1. Memulai Proyek">
        <LegalLi>Proyek dimulai setelah DP 50% diterima dan brief proyek disepakati oleh kedua pihak.</LegalLi>
        <LegalLi>
          Perubahan scope setelah proyek berjalan (penambahan fitur, perubahan desain signifikan) dapat
          mengakibatkan penyesuaian harga dan timeline yang disepakati bersama.
        </LegalLi>
        <LegalLi>
          Estimasi waktu pengerjaan bersifat indikatif. Keterlambatan akibat ketidaklengkapan data dari
          klien tidak termasuk dalam perhitungan timeline.
        </LegalLi>
      </LegalSection>

      <LegalSection title="2. Pembayaran">
        <LegalLi>Struktur pembayaran: 50% DP di awal, 50% pelunasan setelah proyek selesai dan disetujui.</LegalLi>
        <LegalLi>Pelunasan wajib dilakukan sebelum source code, file desain, atau akses server diserahkan.</LegalLi>
        <LegalLi>Keterlambatan pelunasan lebih dari 7 hari setelah proyek selesai dikenakan biaya penundaan.</LegalLi>
      </LegalSection>

      <LegalSection title="3. Hak Kekayaan Intelektual">
        <LegalLi>
          Source code, desain, dan seluruh aset proyek menjadi milik klien sepenuhnya setelah pelunasan penuh.
        </LegalLi>
        <LegalLi>
          Saya berhak mencantumkan proyek ini dalam portofolio dan media sosial kecuali ada perjanjian
          kerahasiaan (NDA) yang ditandatangani sebelum proyek dimulai.
        </LegalLi>
        <LegalLi>
          Library dan framework open-source yang digunakan tetap tunduk pada lisensinya masing-masing
          dan bukan bagian dari IP yang ditransfer.
        </LegalLi>
      </LegalSection>

      <LegalSection title="4. Tanggung Jawab Konten">
        <LegalLi>
          Klien bertanggung jawab penuh atas keabsahan, akurasi, dan legalitas seluruh konten yang
          diberikan (teks, gambar, data, logo, dsb.).
        </LegalLi>
        <LegalLi>
          Saya tidak bertanggung jawab atas konten yang melanggar hukum, hak cipta, atau hak pihak
          ketiga manapun.
        </LegalLi>
      </LegalSection>

      <LegalSection title="5. Revisi">
        <LegalLi>3x revisi termasuk dalam harga untuk setiap milestone proyek.</LegalLi>
        <LegalLi>
          Revisi didefinisikan sebagai penyesuaian minor pada fitur atau desain yang sudah ada,
          bukan penambahan fitur baru atau perubahan arah proyek secara menyeluruh.
        </LegalLi>
        <LegalLi>Revisi tambahan di luar kuota dikenakan biaya yang disepakati bersama.</LegalLi>
      </LegalSection>

      <LegalSection title="6. Keterlambatan & Komunikasi">
        <LegalLi>
          Keterlambatan dari sisi klien (memberikan konten, feedback, atau akses yang diperlukan)
          dapat menggeser timeline tanpa penalti bagi saya.
        </LegalLi>
        <LegalLi>
          Jika klien tidak merespons selama lebih dari 14 hari kalender berturut-turut tanpa
          pemberitahuan, proyek dianggap ditunda dan DP tidak dapat dikembalikan.
        </LegalLi>
        <LegalLi>
          Jika proyek perlu dilanjutkan setelah penundaan, mungkin diperlukan biaya re-onboarding
          tergantung durasi penundaan.
        </LegalLi>
      </LegalSection>

      <LegalSection title="7. Batasan Tanggung Jawab">
        <LegalLi>
          Saya tidak bertanggung jawab atas kerugian bisnis, kehilangan data, atau kerusakan yang
          timbul akibat downtime hosting, bug library pihak ketiga, atau perubahan kebijakan platform.
        </LegalLi>
        <LegalLi>
          Garansi maintenance 1 bulan hanya mencakup bug yang berasal dari kode yang saya tulis,
          bukan dari perubahan environment, server, atau library pihak ketiga.
        </LegalLi>
        <LegalLi>
          Total tanggung jawab saya tidak melebihi jumlah yang telah dibayarkan klien untuk proyek tersebut.
        </LegalLi>
      </LegalSection>

      <LegalSection title="8. Penyelesaian Sengketa">
        <LegalP>
          Setiap perselisihan yang timbul diselesaikan terlebih dahulu melalui musyawarah mufakat.
          Jika tidak tercapai kesepakatan dalam 30 hari, penyelesaian mengikuti hukum yang berlaku
          di Indonesia.
        </LegalP>
      </LegalSection>
    </LegalPageLayout>
  );
}
