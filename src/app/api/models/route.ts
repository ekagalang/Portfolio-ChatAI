import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Endpoint diagnostik — memakai GEMINI_API_KEY. Dibatasi admin agar tidak
// diabuse anonim (menghabiskan kuota / membocorkan daftar model).
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ models: [] });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await res.json();
    const models = (data.models ?? [])
      .filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent")
      )
      .map((m: { name: string; displayName: string }) => ({
        name: m.name,
        displayName: m.displayName,
      }));
    return NextResponse.json({ models });
  } catch (err) {
    console.error("[models]", err);
    return NextResponse.json({ models: [] }, { status: 502 });
  }
}
