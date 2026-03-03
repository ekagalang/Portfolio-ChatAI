// TODO: Ganti semua data di bawah dengan info kamu sendiri

export const profile = {
  name: "Your Name",
  title: "Fullstack Developer",
  tagline: "Saya membangun aplikasi web & mobile yang scalable dan modern.",
  bio: `Saya adalah seorang Fullstack Developer dengan pengalaman X tahun
  yang berfokus pada Laravel, Next.js, dan Flutter. Saya suka membangun
  produk digital dari nol hingga production, dengan perhatian penuh pada
  performa, keamanan, dan user experience.`,

  location: "Jakarta, Indonesia",
  available: true, // ganti false kalau sedang tidak open for work

  contact: {
    email: "you@email.com",
    whatsapp: "628xxxxxxxxxx", // format internasional tanpa +
    linkedin: "https://linkedin.com/in/yourhandle",
    github: "https://github.com/yourusername",
  },

  // Dari Resume / LinkedIn
  experience: [
    {
      company: "PT. Contoh Perusahaan",
      role: "Fullstack Developer",
      period: "2022 — Sekarang",
      description:
        "Membangun dan maintain sistem manajemen internal berbasis Laravel + Vue.js untuk 500+ pengguna aktif.",
    },
    {
      company: "Freelance",
      role: "Web & Mobile Developer",
      period: "2020 — 2022",
      description:
        "Mengerjakan project untuk berbagai klien: landing page, toko online, dan aplikasi Flutter.",
    },
  ],

  education: [
    {
      institution: "Universitas Contoh",
      degree: "S1 Teknik Informatika",
      period: "2016 — 2020",
    },
  ],

  // Tech stack yang dikuasai
  skills: {
    frontend: ["Next.js", "Vue.js", "React", "Tailwind CSS", "TypeScript"],
    backend: ["Laravel", "Node.js", "Express.js", "REST API"],
    mobile: ["Flutter", "Dart"],
    database: ["MySQL", "PostgreSQL", "MongoDB", "Redis"],
    devops: ["Docker", "Docker Compose", "Nginx", "VPS", "Git"],
    tools: ["Figma", "Postman", "VS Code"],
  },

  // Bahasa yang bisa digunakan untuk komunikasi dengan klien
  languages: ["Indonesia (Native)", "English (Professional)"],
};