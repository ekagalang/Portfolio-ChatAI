"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";

const PAGE_LINKS: Record<string, string> = {
  faq:    "/faq",
  tos:    "/terms",
  refund: "/refund",
};

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

function AccordionSection({ item, isOpen, onToggle }: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      borderRadius: "10px",
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--surface))",
      overflow: "hidden",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          fontSize: "12px", fontWeight: 600,
          color: "hsl(var(--foreground))",
          fontFamily: "var(--font-geist-mono)",
        }}>
          {item.title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, color: "hsl(var(--muted-foreground))" }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "0 14px 14px",
              borderTop: "1px solid hsl(var(--border))",
              paddingTop: "12px",
            }}>
              {item.content}

              {PAGE_LINKS[item.id] && (
                <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid hsl(var(--border))" }}>
                  <Link
                    href={PAGE_LINKS[item.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      fontSize: "11px", color: "hsl(var(--accent))",
                      fontFamily: "var(--font-geist-mono)",
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={11} />
                    Buka halaman penuh
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const prose: React.CSSProperties = {
  fontSize: "11px",
  color: "hsl(var(--muted-foreground))",
  lineHeight: 1.7,
  fontFamily: "var(--font-geist-sans)",
  margin: 0,
};

const heading: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "hsl(var(--foreground))",
  fontFamily: "var(--font-geist-mono)",
  margin: "10px 0 4px",
};

const dot: React.CSSProperties = {
  display: "inline-block",
  width: "4px", height: "4px",
  borderRadius: "50%",
  background: "hsl(var(--accent))",
  marginRight: "8px",
  flexShrink: 0,
  marginTop: "6px",
};

function Dot() {
  return <span style={dot} />;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "4px" }}>
      <Dot />
      <span style={prose}>{children}</span>
    </div>
  );
}

interface Props {
  language: "id" | "en";
}

export function LegalAccordion({ language }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const items: AccordionItem[] = language === "id"
    ? [
        {
          id: "faq",
          title: "FAQ — Pertanyaan yang Sering Ditanyakan",
          content: (
            <div>
              <p style={heading}>Berapa lama pengerjaan proyek?</p>
              <p style={prose}>Tergantung kompleksitas: Landing Page 1–7 hari, Backend &amp; API 1–4 minggu, Web App / Mobile App 1–8 minggu. Estimasi lebih akurat diberikan setelah diskusi brief dan scope proyek.</p>

              <p style={heading}>Bagaimana sistem pembayarannya?</p>
              <p style={prose}>Down payment (DP) 50% di awal sebagai tanda jadi dan alokasi waktu, pelunasan 50% setelah proyek selesai dan disetujui klien. Pembayaran via transfer bank atau lainnya yang sudah disepakati.</p>

              <p style={heading}>Berapa kali bisa revisi?</p>
              <p style={prose}>3x revisi sudah termasuk dalam harga. Revisi ke-4 dan seterusnya dikenakan biaya tambahan yang disepakati bersama sesuai scope perubahan.</p>

              <p style={heading}>Apakah ada garansi setelah proyek selesai?</p>
              <p style={prose}>Ya — 1 bulan free maintenance untuk bug fixing yang timbul dari kode yang saya tulis. Penambahan fitur baru atau perubahan desain di luar scope awal diperlakukan sebagai proyek baru.</p>

              <p style={heading}>Apa yang perlu saya siapkan sebelum memulai proyek?</p>
              <p style={prose}>Brief proyek (tujuan, target pengguna, fitur utama), referensi desain jika ada, akses domain/hosting jika sudah punya, dan aset konten seperti teks, logo, dan gambar. Semakin lengkap brief, semakin akurat estimasi waktu dan biaya.</p>

              <p style={heading}>Apakah bisa meeting atau diskusi langsung?</p>
              <p style={prose}>Bisa via WhatsApp, Google Meet, atau Zoom. Saya menjaga komunikasi aktif selama proyek berlangsung dan memberikan update progres secara berkala.</p>

              <p style={heading}>Apakah kamu menerima proyek dari luar kota/negeri?</p>
              <p style={prose}>Ya, semua komunikasi dan pengerjaan bisa dilakukan secara remote. Pembayaran bisa via transfer bank lokal atau metode pembayaran lain yang disepakati.</p>

              <p style={heading}>Apakah source code diberikan setelah proyek selesai?</p>
              <p style={prose}>Ya, full source code diserahkan kepada klien setelah pelunasan penuh. Tidak ada biaya lisensi tambahan — kamu memiliki penuh atas kode yang dibuat.</p>
            </div>
          ),
        },
        {
          id: "tos",
          title: "Syarat & Ketentuan",
          content: (
            <div>
              <p style={{ ...prose, marginBottom: "8px" }}>
                Dengan memesan jasa, klien dianggap telah membaca dan menyetujui syarat berikut.
              </p>

              <p style={heading}>1. Memulai Proyek</p>
              <div>
                <Li>Proyek dimulai setelah DP 50% diterima dan brief proyek disepakati oleh kedua pihak.</Li>
                <Li>Perubahan scope setelah proyek berjalan (penambahan fitur, perubahan desain signifikan) dapat mengakibatkan penyesuaian harga dan timeline yang disepakati bersama.</Li>
                <Li>Estimasi waktu pengerjaan bersifat indikatif. Keterlambatan akibat ketidaklengkapan data dari klien tidak termasuk dalam perhitungan timeline.</Li>
              </div>

              <p style={heading}>2. Pembayaran</p>
              <div>
                <Li>Struktur pembayaran: 50% DP di awal, 50% pelunasan setelah proyek selesai dan disetujui.</Li>
                <Li>Pelunasan wajib dilakukan sebelum source code, file desain, atau akses server diserahkan.</Li>
                <Li>Pembayaran dapat dilakukan melalui transfer bank atau metode pembayaran lain yang disepakati.</Li>
              </div>

              <p style={heading}>3. Hak Kekayaan Intelektual</p>
              <div>
                <Li>Source code, desain, dan seluruh aset proyek menjadi milik klien sepenuhnya setelah pelunasan penuh.</Li>
                <Li>Saya berhak mencantumkan proyek ini dalam portofolio dan media sosial kecuali ada perjanjian kerahasiaan (NDA) yang ditandatangani sebelum proyek dimulai.</Li>
                <Li>Library dan framework open-source yang digunakan tetap tunduk pada lisensinya masing-masing dan bukan bagian dari IP yang ditransfer.</Li>
              </div>

              <p style={heading}>4. Tanggung Jawab Konten</p>
              <div>
                <Li>Klien bertanggung jawab penuh atas keabsahan, akurasi, dan legalitas seluruh konten yang diberikan (teks, gambar, data, logo, dsb.).</Li>
                <Li>Saya tidak bertanggung jawab atas konten yang melanggar hukum, hak cipta, atau hak pihak ketiga manapun.</Li>
              </div>

              <p style={heading}>5. Revisi</p>
              <div>
                <Li>3x revisi termasuk dalam harga untuk setiap milestone proyek.</Li>
                <Li>Revisi didefinisikan sebagai penyesuaian minor pada fitur atau desain yang sudah ada, bukan penambahan fitur baru atau perubahan arah proyek secara menyeluruh.</Li>
                <Li>Revisi tambahan di luar kuota dikenakan biaya yang disepakati bersama.</Li>
              </div>

              <p style={heading}>6. Keterlambatan &amp; Komunikasi</p>
              <div>
                <Li>Keterlambatan dari sisi klien (memberikan konten, feedback, atau akses yang diperlukan) dapat menggeser timeline tanpa penalti bagi saya.</Li>
                <Li>Jika klien tidak merespons selama lebih dari 30 hari kalender berturut-turut tanpa pemberitahuan, proyek dianggap ditunda dan DP tidak dapat dikembalikan.</Li>
                <Li>Jika proyek perlu dilanjutkan setelah penundaan, mungkin diperlukan biaya re-onboarding tergantung durasi penundaan.</Li>
              </div>

              <p style={heading}>7. Batasan Tanggung Jawab</p>
              <div>
                <Li>Saya tidak bertanggung jawab atas kerugian bisnis, kehilangan data, atau kerusakan yang timbul akibat downtime hosting, bug library pihak ketiga, atau perubahan kebijakan platform.</Li>
                <Li>Garansi maintenance 1 bulan hanya mencakup bug yang berasal dari kode yang saya tulis, bukan dari perubahan environment, server, atau library pihak ketiga.</Li>
                <Li>Total tanggung jawab saya tidak melebihi jumlah yang telah dibayarkan klien untuk proyek tersebut.</Li>
              </div>

              <p style={heading}>8. Penyelesaian Sengketa</p>
              <p style={prose}>Setiap perselisihan yang timbul diselesaikan terlebih dahulu melalui musyawarah mufakat. Jika tidak tercapai kesepakatan dalam 30 hari, penyelesaian mengikuti hukum yang berlaku di Indonesia.</p>
            </div>
          ),
        },
        {
          id: "refund",
          title: "Kebijakan Refund",
          content: (
            <div>
              <p style={{ ...prose, marginBottom: "8px" }}>
                Kebijakan ini berlaku untuk semua jasa yang dibayar melalui platform ini maupun transfer langsung.
              </p>

              <p style={heading}>Sebelum Proyek Dimulai</p>
              <p style={prose}>Jika pembatalan dilakukan sebelum pekerjaan apapun dimulai dan dalam 24 jam setelah pembayaran DP, refund 100% dapat diproses. Di luar 24 jam namun sebelum pekerjaan dimulai, refund 80% dari DP (20% sebagai biaya administrasi dan alokasi jadwal).</p>

              <p style={heading}>Setelah Proyek Dimulai</p>
              <div>
                <Li>DP tidak dapat dikembalikan setelah pekerjaan dimulai karena sudah digunakan untuk alokasi waktu, riset, dan sumber daya.</Li>
                <Li>Untuk pembatalan di tengah proyek, biaya dihitung proporsional terhadap persentase pekerjaan yang sudah selesai. Selisihnya (jika ada) dikembalikan kepada klien.</Li>
                <Li>Semua hasil pekerjaan yang sudah selesai — kode, desain, dokumentasi — tetap diserahkan kepada klien meskipun proyek dibatalkan.</Li>
              </div>

              <p style={heading}>Jika Saya Tidak Dapat Menyelesaikan Proyek</p>
              <p style={prose}>Jika saya tidak dapat menyelesaikan proyek karena alasan force majeure atau kondisi yang tidak terduga, refund proporsional diberikan berdasarkan persentase pekerjaan yang belum dikerjakan. Saya akan menyerahkan semua aset dan pekerjaan yang sudah selesai kepada klien tanpa syarat.</p>

              <p style={heading}>Kondisi yang Tidak Memenuhi Syarat Refund</p>
              <div>
                <Li>Ketidakpuasan subjektif terhadap hasil yang sudah sesuai dengan brief yang disepakati di awal proyek.</Li>
                <Li>Perubahan kebutuhan bisnis klien setelah proyek berjalan yang menyebabkan proyek tidak lagi relevan.</Li>
                <Li>Keterlambatan dari sisi klien yang menyebabkan proyek melampaui deadline.</Li>
                <Li>Proyek yang sudah memasuki tahap final delivery dan telah disetujui klien.</Li>
              </div>

              <p style={heading}>Cara Mengajukan Refund</p>
              <p style={prose}>Hubungi saya via WhatsApp atau email dengan mencantumkan nomor order, tanggal pembayaran, dan alasan pembatalan. Setiap pengajuan refund akan ditinjau dan direspons dalam 2 hari kerja. Proses refund yang disetujui diselesaikan dalam 7 hari kerja melalui metode pembayaran yang sama dengan transaksi awal.</p>

              <p style={heading}>Penyelesaian Sengketa</p>
              <p style={prose}>Jika terjadi perselisihan terkait refund, kedua pihak sepakat untuk menyelesaikannya terlebih dahulu melalui musyawarah. Saya berkomitmen untuk menemukan solusi yang adil bagi semua pihak.</p>
            </div>
          ),
        },
      ]
    : [
        {
          id: "faq",
          title: "FAQ — Frequently Asked Questions",
          content: (
            <div>
              <p style={heading}>How long does a project take?</p>
              <p style={prose}>It depends on complexity: Landing Page 1–7 days, Backend &amp; API 1–4 weeks, Web App / Mobile App 1–8 weeks. A more accurate estimate is provided after discussing the brief and project scope.</p>

              <p style={heading}>How does payment work?</p>
              <p style={prose}>50% down payment upfront to secure your slot and allocate time, 50% upon project completion and client approval. Payment via bank transfer or any other agreed method.</p>

              <p style={heading}>How many revisions are included?</p>
              <p style={prose}>3 revisions are included in the price. Additional revisions beyond that are charged at a mutually agreed rate based on the scope of changes.</p>

              <p style={heading}>Is there a warranty after the project is done?</p>
              <p style={prose}>Yes — 1 month of free maintenance for bugs arising from my code. New features or design changes outside the original scope are treated as new projects.</p>

              <p style={heading}>What do I need to prepare before starting?</p>
              <p style={prose}>Project brief (goals, target users, key features), design references if any, domain/hosting access if you already have one, and content assets such as text, logo, and images. The more complete the brief, the more accurate the time and cost estimate.</p>

              <p style={heading}>Can we have a meeting or discussion?</p>
              <p style={prose}>Yes — via WhatsApp, Google Meet, or Zoom. I maintain active communication throughout the project and provide regular progress updates.</p>

              <p style={heading}>Do you accept projects from outside the city/country?</p>
              <p style={prose}>Yes, all communication and work can be done remotely. Payment can be via local bank transfer or any other agreed payment method.</p>

              <p style={heading}>Will the source code be provided after the project is done?</p>
              <p style={prose}>Yes, the full source code is handed over to the client upon full payment. No additional license fees — you have full ownership of the code.</p>
            </div>
          ),
        },
        {
          id: "tos",
          title: "Terms & Conditions",
          content: (
            <div>
              <p style={{ ...prose, marginBottom: "8px" }}>
                By placing an order, the client is deemed to have read and agreed to the following terms.
              </p>

              <p style={heading}>1. Starting a Project</p>
              <div>
                <Li>The project begins after the 50% down payment is received and the project brief is agreed upon by both parties.</Li>
                <Li>Scope changes after the project has started (new features, significant design changes) may result in price and timeline adjustments agreed upon together.</Li>
                <Li>Delivery timelines are indicative. Delays due to incomplete data from the client are not counted in the timeline.</Li>
              </div>

              <p style={heading}>2. Payment</p>
              <div>
                <Li>Payment structure: 50% DP upfront, 50% upon project completion and approval.</Li>
                <Li>Final payment must be made before source code, design files, or server access are handed over.</Li>
                <Li>Payment can be made via bank transfer or any other agreed payment method.</Li>
              </div>

              <p style={heading}>3. Intellectual Property</p>
              <div>
                <Li>Source code, designs, and all project assets become fully owned by the client upon full payment.</Li>
                <Li>I reserve the right to include this project in my portfolio and social media unless an NDA is signed before the project begins.</Li>
                <Li>Open-source libraries and frameworks used remain subject to their respective licenses and are not part of the transferred IP.</Li>
              </div>

              <p style={heading}>4. Content Responsibility</p>
              <div>
                <Li>The client is solely responsible for the validity, accuracy, and legality of all provided content (text, images, data, logos, etc.).</Li>
                <Li>I am not responsible for content that violates laws, copyrights, or third-party rights.</Li>
              </div>

              <p style={heading}>5. Revisions</p>
              <div>
                <Li>3 revisions are included in the price for each project milestone.</Li>
                <Li>A revision is defined as a minor adjustment to an existing feature or design, not the addition of new features or a complete change in project direction.</Li>
                <Li>Additional revisions beyond the quota are charged at a mutually agreed rate.</Li>
              </div>

              <p style={heading}>6. Delays &amp; Communication</p>
              <div>
                <Li>Delays caused by the client (providing content, feedback, or required access) may shift the timeline without penalty to me.</Li>
                <Li>If the client is unresponsive for more than 30 consecutive calendar days without notice, the project is considered on hold and the down payment is non-refundable.</Li>
                <Li>If the project needs to resume after a pause, a re-onboarding fee may apply depending on the duration of the pause.</Li>
              </div>

              <p style={heading}>7. Limitation of Liability</p>
              <div>
                <Li>I am not liable for business losses, data loss, or damage arising from hosting downtime, third-party library bugs, or platform policy changes.</Li>
                <Li>The 1-month maintenance warranty only covers bugs originating from code I wrote, not from environment changes, server issues, or third-party libraries.</Li>
                <Li>My total liability shall not exceed the amount paid by the client for the project.</Li>
              </div>

              <p style={heading}>8. Dispute Resolution</p>
              <p style={prose}>Any disputes shall first be resolved through good-faith negotiation. If no agreement is reached within 30 days, the matter shall be resolved under the laws applicable in Indonesia.</p>
            </div>
          ),
        },
        {
          id: "refund",
          title: "Refund Policy",
          content: (
            <div>
              <p style={{ ...prose, marginBottom: "8px" }}>
                This policy applies to all services paid through this platform or direct transfer.
              </p>

              <p style={heading}>Before the Project Starts</p>
              <p style={prose}>If cancellation occurs before any work has started and within 24 hours of the down payment, a 100% refund can be processed. Beyond 24 hours but before work begins, an 80% refund of the DP is issued (20% covers administration and schedule allocation costs).</p>

              <p style={heading}>After the Project Has Started</p>
              <div>
                <Li>The down payment is non-refundable once work has started, as it covers allocated time, research, and resources.</Li>
                <Li>For mid-project cancellations, charges are calculated proportionally based on completed work. Any remaining balance is returned to the client.</Li>
                <Li>All completed work — code, designs, documentation — will be handed over to the client even if the project is cancelled.</Li>
              </div>

              <p style={heading}>If I Am Unable to Complete the Project</p>
              <p style={prose}>If I am unable to complete the project due to force majeure or unforeseen circumstances, a proportional refund will be issued based on the percentage of work not yet completed. All completed assets and work will be handed over to the client unconditionally.</p>

              <p style={heading}>Conditions Not Eligible for Refund</p>
              <div>
                <Li>Subjective dissatisfaction with results that align with the brief agreed upon at the start of the project.</Li>
                <Li>Changes in the client&apos;s business needs after the project has started that make the project no longer relevant.</Li>
                <Li>Delays on the client&apos;s side that cause the project to miss its deadline.</Li>
                <Li>Projects that have reached final delivery stage and have been approved by the client.</Li>
              </div>

              <p style={heading}>How to Request a Refund</p>
              <p style={prose}>Contact me via WhatsApp or email with your order number, payment date, and reason for cancellation. Each refund request will be reviewed and responded to within 2 business days. Approved refunds are processed within 7 business days via the same payment method as the original transaction.</p>

              <p style={heading}>Dispute Resolution</p>
              <p style={prose}>If a dispute arises regarding a refund, both parties agree to first resolve it through mutual discussion. I am committed to finding a fair solution for all parties involved.</p>
            </div>
          ),
        },
      ];

  return (
    <div style={{ marginTop: "28px" }}>
      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ flex: 1, height: "1px", background: "hsl(var(--border))" }} />
        <span style={{
          fontSize: "10px", color: "hsl(var(--muted-foreground))",
          fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap",
        }}>
          {language === "id" ? "info & kebijakan" : "info & policies"}
        </span>
        <div style={{ flex: 1, height: "1px", background: "hsl(var(--border))" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item) => (
          <AccordionSection
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>

      <p style={{
        fontSize: "10px", color: "hsl(var(--muted-foreground))",
        textAlign: "center", marginTop: "16px", marginBottom: "8px",
        fontFamily: "var(--font-geist-mono)", lineHeight: 1.6,
      }}>
        {language === "id"
          ? "Dengan menggunakan layanan ini kamu menyetujui syarat & ketentuan di atas."
          : "By using this service you agree to the terms & conditions above."}
      </p>
    </div>
  );
}
