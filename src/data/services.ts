// TODO: Sesuaikan jasa dan harga dengan penawaran kamu

export const services = [
  {
    id: "web-fullstack",
    icon: "🌐",
    title: "Web App Fullstack",
    description:
      "Pembuatan aplikasi web lengkap dari backend hingga frontend. Cocok untuk sistem internal, SaaS, atau platform bisnis.",
    stack: ["Laravel", "Next.js", "MySQL", "Docker"],
    deliverables: [
      "Source code lengkap",
      "Dokumentasi API",
      "Deployment ke VPS",
      "1 bulan free maintenance",
    ],
    pricing: {
      starting: 5000000,
      unit: "project",
      note: "Harga final tergantung kompleksitas fitur",
    },
    duration: "2 — 8 minggu",
  },
  {
    id: "mobile-flutter",
    icon: "📱",
    title: "Mobile App Flutter",
    description:
      "Aplikasi mobile cross-platform (Android & iOS) menggunakan Flutter. Terintegrasi dengan REST API backend.",
    stack: ["Flutter", "Dart", "Laravel API"],
    deliverables: [
      "APK & IPA build",
      "Source code",
      "Integrasi API",
      "Upload ke Play Store (opsional)",
    ],
    pricing: {
      starting: 4000000,
      unit: "project",
      note: "Harga final tergantung jumlah screen dan fitur",
    },
    duration: "3 — 10 minggu",
  },
  {
    id: "landing-page",
    icon: "🎨",
    title: "Landing Page",
    description:
      "Landing page modern, cepat, dan SEO-friendly. Cocok untuk bisnis, produk, atau personal branding.",
    stack: ["Next.js", "Tailwind CSS"],
    deliverables: [
      "Desain responsif",
      "SEO on-page",
      "Google Analytics setup",
      "Deployment",
    ],
    pricing: {
      starting: 1500000,
      unit: "project",
      note: "Termasuk revisi hingga 3x",
    },
    duration: "3 — 7 hari",
  },
  {
    id: "api-backend",
    icon: "⚙️",
    title: "Backend & API Development",
    description:
      "Pembuatan REST API robust menggunakan Laravel atau Express.js. Lengkap dengan autentikasi, dokumentasi, dan testing.",
    stack: ["Laravel", "Node.js", "MySQL", "Redis"],
    deliverables: [
      "REST API lengkap",
      "Dokumentasi Postman",
      "Unit testing",
      "Docker setup",
    ],
    pricing: {
      starting: 3000000,
      unit: "project",
      note: "Harga per modul tersedia",
    },
    duration: "1 — 4 minggu",
  },
  {
    id: "konsultasi",
    icon: "💬",
    title: "Konsultasi & Code Review",
    description:
      "Sesi konsultasi teknis untuk arsitektur sistem, code review, atau debugging project kamu.",
    stack: [],
    deliverables: [
      "Sesi video call",
      "Laporan rekomendasi",
      "Code review report",
    ],
    pricing: {
      starting: 300000,
      unit: "jam",
      note: "Minimum 1 jam",
    },
    duration: "Fleksibel",
  },
];