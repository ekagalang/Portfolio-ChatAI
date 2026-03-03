// Data project manual sebagai fallback / featured projects
// Project dari GitHub akan di-fetch otomatis via API
// Isi ini dengan project terbaik kamu yang ingin di-highlight

export const featuredProjects = [
  {
    id: "project-1",
    title: "Sistem Manajemen Material",
    description:
      "Aplikasi web untuk manajemen database material konstruksi (bata, semen, pasir, cat) dengan fitur autocomplete dan polymorphic relationships.",
    stack: ["Laravel", "Vue.js", "MySQL", "Docker"],
    type: "Web App",
    status: "Production",
    // githubUrl: "https://github.com/username/repo", // opsional
    // liveUrl: "https://demo.yourapp.com",           // opsional
    year: 2024,
  },
  {
    id: "project-2",
    title: "Mobile Banking UI",
    description:
      "Redesign antarmuka aplikasi mobile banking dengan Material Design modern, fitur horizontal scrolling dan animasi smooth.",
    stack: ["Flutter", "Dart"],
    type: "Mobile App",
    status: "Completed",
    year: 2024,
  },
  // TODO: Tambah project lainnya
];

// Tipe untuk GitHub API response
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