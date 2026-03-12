import { GithubRepo } from "@/data/projects";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function getHeaders(): HeadersInit {
  return {
    Accept: "application/vnd.github.v3+json",
    ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
  };
}

export async function getGithubRepos(): Promise<GithubRepo[]> {
  if (!GITHUB_USERNAME) {
    console.warn("GITHUB_USERNAME tidak ada di .env.local");
    return [];
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`,
      {
        headers: getHeaders(),
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.error("GitHub API error:", res.status);
      return [];
    }

    const repos: GithubRepo[] = await res.json();

    return repos
      .filter((r) => !r.fork) // hapus filter description
      .sort((a, b) => b.stargazers_count - a.stargazers_count);
  } catch (error) {
    console.error("Gagal fetch GitHub repos:", error);
    return [];
  }
}

export async function getGithubProfile() {
  if (!GITHUB_USERNAME) return null;

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      {
        headers: getHeaders(),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}