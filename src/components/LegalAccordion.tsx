"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

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
              <p style={prose}>Tergantung kompleksitas: Landing Page 3–14 hari, Backend API 1–4 minggu, Web App / Mobile App 1–8 minggu. Estimasi lebih akurat diberikan setelah diskusi brief.</p>

              <p style={heading}>Bagaimana sistem pembayarannya?</p>
              <p style={prose}>Down payment (DP) 50% di awal sebagai tanda jadi, pelunasan 50% setelah proyek selesai dan disetujui klien. Pembayaran via transfer bank atau Duitku.</p>

              <p style={heading}>Berapa kali bisa revisi?</p>
              <p style={prose}>3x revisi sudah termasuk dalam harga. Revisi ke-4 dan seterusnya dikenakan biaya tambahan sesuai scope perubahan.</p>

              <p style={heading}>Apakah ada garansi setelah selesai?</p>
              <p style={prose}>Ya — 1 bulan free maintenance untuk bug fixing yang timbul dari kode yang saya tulis. Penambahan fitur baru di luar scope awal adalah pekerjaan baru.</p>

              <p style={heading}>Apa yang perlu saya siapkan?</p>
              <div style={{ marginTop: "4px" }}>
                <Li>Brief proyek: tujuan, target pengguna, dan fitur utama</Li>
                <Li>Referensi desain (jika ada)</Li>
                <Li>Akses domain/hosting (jika sudah punya)</Li>
                <Li>Aset konten: teks, logo, gambar (jika ada)</Li>
              </div>

              <p style={heading}>Apakah bisa meeting/diskusi langsung?</p>
              <p style={prose}>Bisa via WhatsApp, Google Meet, atau Zoom. Komunikasi aktif selama proyek berlangsung.</p>
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
                <Li>Proyek dimulai setelah DP 50% diterima dan brief proyek disepakati.</Li>
                <Li>Perubahan scope setelah proyek berjalan dapat mengakibatkan penyesuaian harga dan timeline.</Li>
              </div>

              <p style={heading}>2. Hak Kekayaan Intelektual</p>
              <div>
                <Li>Source code dan aset proyek diserahkan kepada klien setelah pelunasan penuh.</Li>
                <Li>Saya berhak mencantumkan proyek ini dalam portofolio kecuali ada perjanjian kerahasiaan (NDA).</Li>
              </div>

              <p style={heading}>3. Tanggung Jawab Konten</p>
              <div>
                <Li>Klien bertanggung jawab penuh atas keabsahan dan legalitas konten yang diberikan.</Li>
                <Li>Saya tidak bertanggung jawab atas konten yang melanggar hukum atau hak pihak ketiga.</Li>
              </div>

              <p style={heading}>4. Keterlambatan</p>
              <div>
                <Li>Keterlambatan dari sisi klien (konten, feedback, akses) dapat menggeser timeline tanpa penalti.</Li>
                <Li>Jika klien tidak memberi respons lebih dari 14 hari, proyek dianggap ditunda dan DP tidak dapat dikembalikan.</Li>
              </div>

              <p style={heading}>5. Batasan Tanggung Jawab</p>
              <div>
                <Li>Saya tidak bertanggung jawab atas kerugian bisnis akibat downtime, bug pihak ketiga, atau perubahan platform.</Li>
                <Li>Garansi maintenance hanya mencakup bug dari kode yang saya tulis, bukan library atau layanan pihak ketiga.</Li>
              </div>
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
              <p style={prose}>Jika pembatalan dilakukan sebelum pekerjaan apapun dimulai (dalam 24 jam setelah DP), refund 100% dapat diproses dalam 3–7 hari kerja.</p>

              <p style={heading}>Setelah Proyek Dimulai</p>
              <div>
                <Li>DP tidak dapat dikembalikan karena sudah digunakan untuk alokasi waktu dan sumber daya.</Li>
                <Li>Jika pembatalan di tengah proyek, biaya dihitung proporsional terhadap pekerjaan yang sudah selesai.</Li>
              </div>

              <p style={heading}>Jika Saya Tidak Dapat Menyelesaikan</p>
              <div>
                <Li>Refund proporsional diberikan berdasarkan persentase pekerjaan yang belum dikerjakan.</Li>
                <Li>Semua aset dan pekerjaan yang sudah selesai tetap diserahkan kepada klien.</Li>
              </div>

              <p style={heading}>Cara Mengajukan Refund</p>
              <p style={prose}>Hubungi via WhatsApp atau email dengan mencantumkan nomor order dan alasan pembatalan. Proses refund diselesaikan secara musyawarah dalam 7 hari kerja.</p>

              <p style={{ ...prose, marginTop: "10px", fontStyle: "italic", opacity: 0.7 }}>
                Terakhir diperbarui: Juni 2025
              </p>
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
              <p style={prose}>It depends on complexity: Landing Page 3–14 days, Backend API 1–4 weeks, Web App / Mobile App 1–8 weeks. A more accurate estimate is provided after discussing the brief.</p>

              <p style={heading}>How does payment work?</p>
              <p style={prose}>50% down payment upfront to secure your slot, 50% upon project completion and client approval. Payment via bank transfer or Duitku.</p>

              <p style={heading}>How many revisions are included?</p>
              <p style={prose}>3 revisions are included in the price. Additional revisions beyond that are charged based on the scope of changes.</p>

              <p style={heading}>Is there a warranty after completion?</p>
              <p style={prose}>Yes — 1 month of free maintenance for bugs arising from my code. New features outside the original scope are treated as new projects.</p>

              <p style={heading}>What do I need to prepare?</p>
              <div style={{ marginTop: "4px" }}>
                <Li>Project brief: goals, target users, and key features</Li>
                <Li>Design references (if any)</Li>
                <Li>Domain/hosting access (if you already have one)</Li>
                <Li>Content assets: text, logo, images (if available)</Li>
              </div>

              <p style={heading}>Can we have a meeting or discussion?</p>
              <p style={prose}>Yes — via WhatsApp, Google Meet, or Zoom. I maintain active communication throughout the project.</p>
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
                <Li>The project begins after the 50% down payment is received and the project brief is agreed upon.</Li>
                <Li>Scope changes after the project has started may result in price and timeline adjustments.</Li>
              </div>

              <p style={heading}>2. Intellectual Property</p>
              <div>
                <Li>Source code and project assets are handed over to the client upon full payment.</Li>
                <Li>I reserve the right to include this project in my portfolio unless an NDA is signed.</Li>
              </div>

              <p style={heading}>3. Content Responsibility</p>
              <div>
                <Li>The client is solely responsible for the legality and accuracy of all provided content.</Li>
                <Li>I am not responsible for content that violates laws or third-party rights.</Li>
              </div>

              <p style={heading}>4. Delays</p>
              <div>
                <Li>Delays caused by the client (missing content, feedback, or access) may shift the timeline without penalty.</Li>
                <Li>If the client is unresponsive for more than 14 days, the project is considered on hold and the down payment is non-refundable.</Li>
              </div>

              <p style={heading}>5. Limitation of Liability</p>
              <div>
                <Li>I am not liable for business losses due to downtime, third-party bugs, or platform changes.</Li>
                <Li>The maintenance warranty only covers bugs in code I wrote, not third-party libraries or services.</Li>
              </div>
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
              <p style={prose}>If cancellation occurs before any work has started (within 24 hours of the down payment), a 100% refund can be processed within 3–7 business days.</p>

              <p style={heading}>After the Project Has Started</p>
              <div>
                <Li>The down payment is non-refundable as it covers allocated time and resources.</Li>
                <Li>For mid-project cancellations, charges are calculated proportionally based on completed work.</Li>
              </div>

              <p style={heading}>If I Am Unable to Complete the Project</p>
              <div>
                <Li>A proportional refund is issued based on the percentage of work not yet completed.</Li>
                <Li>All completed assets and work are handed over to the client.</Li>
              </div>

              <p style={heading}>How to Request a Refund</p>
              <p style={prose}>Contact me via WhatsApp or email with your order number and reason for cancellation. Refunds are resolved through mutual agreement within 7 business days.</p>

              <p style={{ ...prose, marginTop: "10px", fontStyle: "italic", opacity: 0.7 }}>
                Last updated: June 2025
              </p>
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
