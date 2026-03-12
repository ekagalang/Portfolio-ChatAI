import { NextResponse } from "next/server";
import { getGithubRepos, getGithubProfile } from "@/lib/github";

export async function GET() {
  const [repos, profile] = await Promise.all([
    getGithubRepos(),
    getGithubProfile(),
  ]);

  return NextResponse.json(
    { repos, profile },
    {
      headers: {
        // Cache di browser 30 menit
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}