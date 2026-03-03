import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  const data = await res.json();

  // Filter hanya model yang support generateContent
  const models = data.models
    ?.filter((m: { supportedGenerationMethods?: string[] }) =>
      m.supportedGenerationMethods?.includes("generateContent")
    )
    .map((m: { name: string; displayName: string }) => ({
      name: m.name,
      displayName: m.displayName,
    }));

  return NextResponse.json({ models });
}