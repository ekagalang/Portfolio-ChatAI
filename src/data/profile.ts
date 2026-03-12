// TODO: Ganti semua data di bawah dengan info kamu sendiri

export const profile = {
  name: "Eka Galang Pratama",
  title: "Fullstack Developer",
  tagline: "Turning Complex Challenges into Robust Digital Innovations.",
  bio: `Fullstack Developer with over 4+ years of experience in web application development and IT infrastructure management.
  Proficient in Node.js, Go, PHP (Laravel, CodeIgniter), Next.js, React.js and Mobile App (Kotlin, Jetpack Compose),
  with a strong focus on building scalable, secure, and efficient systems. Skilled in designing and implementing backend architectures,
  RESTful APIs, and database integrations using MySQL, PostgreSQL, and MongoDB. On the frontend,
  I specialize in creating responsive and modern user interfaces using React.js and Next.js, applying best practices such as state management (Redux/Zustand), SSR/SSG, and component modularization.
  Experienced in deployment and CI/CD pipeline management, application performance optimization, and containerized environments (Docker).
  Familiar with reverse proxy setups (Nginx), Linux server administration, and security hardening for production systems.
  Driven by a passion for technology and continuous learning, I aim to deliver high-quality digital solutions that enhance business efficiency and innovation.       `,

  location: "Tangerang, Indonesia",
  available: true, // ganti false kalau sedang tidak open for work

  contact: {
    email: "ekagalangpratama@gmail.com",
    whatsapp: "6285157222301", // format internasional tanpa +
    linkedin: "https://linkedin.com/in/ekagalangpratama",
    github: "https://github.com/ekagalang",
  },

  // Dari Resume / LinkedIn
  experience: [
    {
      company: "Kanggo",
      role: "Fullstack Developer",
      period: "2025 — Sekarang",
      description:
        "Sebagai Fullstack Developer, saya membangun aplikasi pintar untuk melakukan perhitungan material yang complex dalam rangka mempermudah proses pekerjaan Kontraktor dan Pelaksana di lapangan.",
    },
    {
      company: "BASS Training Center & Consultant",
      role: "Full Stack Developer",
      period: "2022 — 2025",
      description:
        "As a Fullstack Developer, I design, develop, and maintain web applications using Laravel, Next.js while managing VPS and LAMP/LEMP infrastructure to ensure system performance and scalability. I have led the migration from shared hosting to VPS, enhancing stability and security; integrated Midtrans Payment Gateway for secure online transactions; and developed web-based Learning Management System (LMS) and Inventory Management System that improved operational efficiency by over 60%. Additionally, I implemented CI/CD pipelines, optimized website performance, and configured Cloudflare DNS to strengthen speed, reliability, and overall digital security.",
    },
    {
      company: "Remohire",
      role: "Game Tester (Freelance)",
      period: "Agustus 2025 — November 2025",
      description:
        "As a Game Tester, I conducted comprehensive testing of mobile and web games to identify bugs and ensure quality. I collaborated with development teams to report issues and suggest improvements, contributing to a 20% increase in game stability. Additionally, I documented test cases and results, ensuring effective communication and tracking of the testing process.",
    },
    {
      company: "LSP Fasilitator Instruktur dan Tenaga Kepelatihan",
      role: "Information Technology Administrator",
      period: "2020 — 2022",
      description:
        "As an IT Administrator, I managed and optimized the digital infrastructure supporting the competency certification process. I developed and maintained the LSP information system and Learning Management System (LMS), ensuring compliance with BNSP standards and seamless integration for online certification workflows. I performed LMS testing, troubleshooting, and error resolution, enhancing system reliability and user experience. Additionally, I automated administrative tasks such as certificate database management and report generation, handling an average of 700 records and certificates per month with improved accuracy and efficiency. I also provided technical support and training for assessors on LMS usage, ensuring smooth adoption of digital tools across certification activities.",
    },
    {
      company: "Perguruan Tinggi Ilmu Kepolisian (PTIK)",
      role: "IT Support Technician (Intern)",
      period: "Januari 2018 — April 2018",
      description:
        "Configure Network with Cisco, Mikrotik Troubleshooting Network & Computer Installation Network Maintenance CCTV Server",
    }
  ],

  education: [
    {
      institution: "Universitas Siber Asia",
      degree: "Informatika",
      period: "2023 — Sekarang",
    },
    {
      institution: "SMK Manggala",
      degree: "Teknik Komputer dan Jaringan",
      period: "2016 - 2019",
    },
  ],

  // Tech stack yang dikuasai
  skills: {
    frontend: ["Next.js", "Vue.js", "React", "Tailwind CSS", "TypeScript"],
    backend: ["Laravel", "Node.js", "Express.js", "REST API", "Golang"],
    mobile: ["Kotlin"],
    database: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Prisma"],
    devops: ["Docker", "Docker Compose", "Nginx", "VPS", "Git"],
    tools: ["Codex", "Claude", "Gemini", "Postman", "VS Code"],
  },

  // Bahasa yang bisa digunakan untuk komunikasi dengan klien
  languages: ["Indonesia (Native)", "English (Professional)"],
};