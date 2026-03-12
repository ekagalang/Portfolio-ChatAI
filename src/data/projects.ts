export interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  stack: string[];
  type: string;
  status: string;
  pinned: boolean;
  githubUrl: string;
  liveUrl?: string;
  year: number;
}

export const featuredProjects: FeaturedProject[] = [
  {
    id: "project-1",
    title: "Learning Management System (LMS)",
    description:
      "Ini adalah aplikasi Learning Management System (LMS) yang dibangun menggunakan framework Laravel. Aplikasi ini dirancang untuk memfasilitasi proses pembelajaran online, memungkinkan instruktur untuk membuat kursus, mengelola materi, dan berinteraksi dengan peserta.",
    stack: ["Laravel", "MySQL", "Docker"],
    type: "Web App",
    status: "Completed",
    pinned: true,
     githubUrl: "https://github.com/ekagalang/LMSAPP_Laravel_V2",
    // liveUrl: "https://demo.yourapp.com",
    year: 2025,
  },
  {
    id: "project-2",
    title: "Inventory Management System",
    description:
      "Aplikasi Inventaris ini adalah sebuah sistem berbasis web yang dibangun menggunakan Laravel untuk mengelola inventaris barang dan aset secara komprehensif. Aplikasi ini dirancang untuk membantu organisasi dalam melacak stok, mengelola pergerakan barang, menangani alur permintaan/peminjaman, serta mengatur hak akses pengguna dengan sistem yang terstruktur dan aman.",
    stack: ["Laravel", "MySQL", "Docker"],
    type: "Web App",
    status: "Completed",
    pinned: true,
     githubUrl: "https://github.com/ekagalang/InventoryAPP_Laravel",
    year: 2025,
  },
  {
    id: "project-3",
    title: "Tour Travel Booking Website",
    description:
      "Aplikasi katalog paket Haji & Umroh dengan keranjang belanja sederhana, dibuat dengan Next.js (App Router), Tailwind CSS v4, Prisma (MySQL), dan komponen UI berbasis shadcn.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "Docker"],
    type: "Web App",
    status: "Completed",
     githubUrl: "https://github.com/ekagalang/KHAIRO-NEXTJS",
    pinned: true,
    year: 2025,
  },
  {
    id: "project-4",
    title: "Bankqu Web & Mobile Apps",
    description:
      "Personal Finance Management",
    stack: ["Kotlin", "Laravel", "React", "MySQL"],
    type: "Mobile App",
    status: "Completed",
    githubUrl: "https://github.com/ekagalang/Bankqu",
    pinned: true,
    year: 2025,
  },
  {
    id: "project-5",
    title: "MyHabit ML Mobile Apps",
    description:
      "Daily Habit Tracker for Improvement Good Habit and Self-Reflection powered by Machine Learning Prediction",
    stack: ["Kotlin", "Jetpack Compose", "Golang", "MySQL"],
    type: "Mobile App",
    status: "Completed",
    githubUrl: "https://github.com/ekagalang/MyHabit-ML",
    pinned: true,
    year: 2026,
  },
  {
    id: "project-6",
    title: "Nirmala ML",
    description:
      "Personal Finance Management with AI Assistant for Financial Advice and Budgeting powered by Machine Learning Prediction",
    stack: ["Kotlin", "Jetpack Compose"],
    type: "Web App",
    status: "Completed",
    githubUrl: "https://github.com/ekagalang/Nirmala-ML",
    pinned: true,
    year: 2026,
  },
  {
    id: "project-7",
    title: "Finara",
    description:
      "A Powerfull Web App for Accounting and Financial Report with AI Assistant for Financial Analysis and Forecasting powered by Machine Learning Prediction",
    stack: ["Golang", "MySQL", "Restful API"],
    type: "Web App",
    status: "Ongoing",
    githubUrl: "https://github.com/ekagalang/FINARA",
    pinned: true,
    year: 2026,
  },
  // TODO: Tambah project lainnya
];

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  fork: boolean;
}

export interface GithubProfile {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}
