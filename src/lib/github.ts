import { GithubRepo } from "@/data/projects";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function getGithubRepos(): Promise<GithubRepo[]> {
  if (!GITHUB_USERNAME) {
    console.warn("GITHUB_USERNAME tidak ada di .env.local");
    return [];
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    // Pakai token jika ada untuk rate limit lebih tinggi
    ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
  };

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`,
      {
        headers,
        // Revalidate setiap 1 jam — tidak perlu realtime
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.error("GitHub API error:", res.status, res.statusText);
      return [];
    }

    const repos: GithubRepo[] = await res.json();

    // Filter: exclude fork, exclude repo tanpa deskripsi
    return repos.filter((r) => !r.fork && r.description);
  } catch (error) {
    console.error("Gagal fetch GitHub repos:", error);
    return [];
  }
}