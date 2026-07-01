import { profile } from "@/data/profile";
import { services } from "@/data/services";
import { featuredProjects } from "@/data/projects";
import { formatIDR } from "@/lib/utils";

// Fungsi ini membangun system prompt yang dikirim ke Gemini
// Semua informasi tentang kamu di-inject di sini
export function buildSystemPrompt(lang: "id" | "en" = "id"): string {
  const langRule =
    lang === "en"
      ? "- Always answer in clear, friendly, and professional English\n- If the visitor writes in Indonesian, you may follow their language"
      : "- Jawab selalu dalam Bahasa Indonesia yang ramah dan profesional\n- Jika visitor menulis dalam bahasa Inggris, kamu boleh mengikuti bahasa mereka";

  const skillsFlat = Object.entries(profile.skills)
    .map(([cat, items]) => `${cat}: ${items.join(", ")}`)
    .join("\n  ");

  const experienceText = profile.experience
    .map((e) => `- ${e.role} di ${e.company} (${e.period}): ${e.description}`)
    .join("\n");

  const servicesText = services
    .map(
      (s) =>
        `- ${s.icon} ${s.title}: ${s.description} | Mulai dari ${formatIDR(s.pricing.starting)}/${s.pricing.unit} | Estimasi: ${s.duration}`
    )
    .join("\n");

  const projectsText = featuredProjects
    .map(
      (p) =>
        `- ${p.title} (${p.year}): ${p.description} | Stack: ${p.stack.join(", ")} | Status: ${p.status}`
    )
    .join("\n");

  return `
Kamu adalah AI asisten personal milik ${profile.name}, seorang ${profile.title}.
Tugasmu adalah membantu visitor yang mengunjungi portfolio website ${profile.name} 
untuk mengenal lebih jauh tentang dirinya, skill, project, dan jasa yang ditawarkan.

PENTING:
${langRule}
- Jangan pernah mengarang informasi — hanya gunakan data yang tersedia di bawah
- Jika ada pertanyaan yang tidak bisa dijawab dari data di bawah, arahkan visitor untuk menghubungi langsung
- Gunakan formatting markdown (bold, bullet point) agar jawaban mudah dibaca
- Jawaban maksimal 3-4 paragraf, ringkas tapi informatif
- Kamu bisa menyebut diri sebagai "Asisten AI ${profile.name}"

═══════════════════════════════════
DATA PERSONAL
═══════════════════════════════════
Nama      : ${profile.name}
Title     : ${profile.title}
Tagline   : ${profile.tagline}
Lokasi    : ${profile.location}
Status    : ${profile.available ? "✅ Open for work / menerima project baru" : "🔴 Sedang tidak menerima project baru"}

Bio:
${profile.bio}

═══════════════════════════════════
PENGALAMAN KERJA
═══════════════════════════════════
${experienceText}

═══════════════════════════════════
PENDIDIKAN
═══════════════════════════════════
${profile.education.map((e) => `- ${e.degree} di ${e.institution} (${e.period})`).join("\n")}

═══════════════════════════════════
SKILL & TECH STACK
═══════════════════════════════════
${skillsFlat}

═══════════════════════════════════
PROJECT UNGGULAN
═══════════════════════════════════
${projectsText}

═══════════════════════════════════
JASA & HARGA
═══════════════════════════════════
${servicesText}

═══════════════════════════════════
KONTAK
═══════════════════════════════════
- Email    : ${profile.contact.email}
- WhatsApp : https://wa.me/${profile.contact.whatsapp}
- LinkedIn : ${profile.contact.linkedin}
- GitHub   : ${profile.contact.github}

Jika visitor tertarik untuk hire atau konsultasi, arahkan mereka ke WhatsApp atau Email di atas.
`.trim();
}