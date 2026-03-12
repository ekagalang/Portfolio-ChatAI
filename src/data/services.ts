// TODO: Sesuaikan jasa dan harga dengan penawaran kamu

export const services = [
  {
    id: "web-fullstack",
    icon: "🌐",
    title: "Web App Fullstack",
    description:
      "Pembuatan aplikasi web lengkap dari backend hingga frontend. Cocok untuk sistem internal, SaaS, atau platform bisnis.",
    stack: ["Laravel", "Next.js", "Vue.JS", "React", "Node.JS", "Express.JS", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Prisma", "Docker"],
    deliverables: [
      "Source code lengkap",
      "Dokumentasi API",
      "Deployment ke VPS",
      "1 bulan free maintenance",
    ],
    pricing: {
      starting: 500000,
      unit: "project",
      note: "Harga final tergantung kompleksitas fitur",
    },
    duration: "1 — 8 minggu",
  },
  {
    id: "mobile",
    icon: "📱",
    title: "Mobile App",
    description:
      "Aplikasi mobile Android. Terintegrasi dengan REST API backend.",
    stack: ["Kotlin", "Dart", "React Native", "Flutter", "MySQL", "PostgreSQL", "MongoDB"],
    deliverables: [
      "APK & IPA build",
      "Source code",
      "Integrasi API",
    ],
    pricing: {
      starting: 500000,
      unit: "project",
      note: "Harga final tergantung jumlah screen dan fitur",
    },
    duration: "1 — 8 minggu",
  },
  {
    id: "landing-page",
    icon: "🎨",
    title: "Landing Page",
    description:
      "Landing page modern, cepat, dan SEO-friendly. Cocok untuk bisnis, produk, atau personal branding.",
    stack: ["Next.js", "React", "Tailwind CSS"],
    deliverables: [
      "Desain responsif",
      "SEO on-page",
      "Google Analytics setup",
      "Deployment",
    ],
    pricing: {
      starting: 150000,
      unit: "project",
      note: "Termasuk revisi hingga 3x",
    },
    duration: "3 — 14 hari",
  },
  {
    id: "api-backend",
    icon: "⚙️",
    title: "Backend & API Development",
    description:
      "Pembuatan REST API robust menggunakan Laravel, Node.JS dll. Lengkap dengan autentikasi, dokumentasi, dan testing.",
    stack: ["Laravel", "Golang", "Node.js", "MySQL", "RESTfull API"],
    deliverables: [
      "REST API lengkap",
      "Dokumentasi Postman",
      "Unit testing",
      "Docker setup",
    ],
    pricing: {
      starting: 300000,
      unit: "project",
      note: "Harga per modul tersedia",
    },
    duration: "1 — 4 minggu",
  },
];