import type { Metadata } from "next";
import {
  LegalPageLayout,
  LegalSection,
  LegalP,
  LegalLi,
} from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Kebijakan Refund",
  description: "Kebijakan pengembalian dana untuk jasa freelance Galang — kondisi, proses, dan timeline refund.",
};

export default function RefundPage() {
  return (
    <LegalPageLayout
      title="Kebijakan Refund"
      subtitle="Kebijakan ini berlaku untuk semua jasa yang dibayar melalui platform ini maupun transfer langsung."
      updatedAt="Juni 2026"
    >
      <LegalSection title="Sebelum Proyek Dimulai">
        <LegalP>
          Jika pembatalan dilakukan sebelum pekerjaan apapun dimulai dan dalam 24 jam setelah
          pembayaran DP, refund 100% dapat diproses. Di luar 24 jam namun sebelum pekerjaan
          dimulai, refund 80% dari DP (20% sebagai biaya administrasi dan alokasi jadwal).
        </LegalP>
      </LegalSection>

      <LegalSection title="Setelah Proyek Dimulai">
        <LegalLi>
          DP tidak dapat dikembalikan setelah pekerjaan dimulai karena sudah digunakan untuk
          alokasi waktu, riset, dan sumber daya.
        </LegalLi>
        <LegalLi>
          Untuk pembatalan di tengah proyek, biaya dihitung proporsional terhadap persentase
          pekerjaan yang sudah selesai. Selisihnya (jika ada) dikembalikan kepada klien.
        </LegalLi>
        <LegalLi>
          Semua hasil pekerjaan yang sudah selesai — kode, desain, dokumentasi — tetap diserahkan
          kepada klien meskipun proyek dibatalkan.
        </LegalLi>
      </LegalSection>

      <LegalSection title="Jika Saya Tidak Dapat Menyelesaikan Proyek">
        <LegalP>
          Jika saya tidak dapat menyelesaikan proyek karena alasan force majeure atau kondisi
          yang tidak terduga, refund proporsional diberikan berdasarkan persentase pekerjaan
          yang belum dikerjakan. Saya akan menyerahkan semua aset dan pekerjaan yang sudah
          selesai kepada klien tanpa syarat.
        </LegalP>
      </LegalSection>

      <LegalSection title="Kondisi yang Tidak Memenuhi Syarat Refund">
        <LegalLi>
          Ketidakpuasan subjektif terhadap hasil yang sudah sesuai dengan brief yang disepakati
          di awal proyek.
        </LegalLi>
        <LegalLi>
          Perubahan kebutuhan bisnis klien setelah proyek berjalan yang menyebabkan proyek
          tidak lagi relevan.
        </LegalLi>
        <LegalLi>
          Keterlambatan dari sisi klien yang menyebabkan proyek melampaui deadline.
        </LegalLi>
        <LegalLi>
          Proyek yang sudah memasuki tahap final delivery dan telah disetujui klien.
        </LegalLi>
      </LegalSection>

      <LegalSection title="Cara Mengajukan Refund">
        <LegalP>
          Hubungi saya via WhatsApp atau email dengan mencantumkan nomor order, tanggal pembayaran,
          dan alasan pembatalan. Setiap pengajuan refund akan ditinjau dan direspons dalam 2 hari
          kerja. Proses refund yang disetujui diselesaikan dalam 7 hari kerja melalui metode
          pembayaran yang sama dengan transaksi awal.
        </LegalP>
      </LegalSection>

      <LegalSection title="Penyelesaian Sengketa">
        <LegalP>
          Jika terjadi perselisihan terkait refund, kedua pihak sepakat untuk menyelesaikannya
          terlebih dahulu melalui musyawarah. Saya berkomitmen untuk menemukan solusi yang adil
          bagi semua pihak.
        </LegalP>
      </LegalSection>
    </LegalPageLayout>
  );
}
