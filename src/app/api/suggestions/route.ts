import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel, withGeminiModelFallback } from "@/lib/gemini";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Endpoint ini memanggil Gemini (berbayar) → batasi agar tak diabuse.
    const rl = rateLimit(`suggestions:${clientIp(req)}`, 15, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ suggestions: [] }, { status: 429 });
    }

    const { lastMessage, lastResponse, language } = await req.json();

    if (!lastMessage || !lastResponse) {
      return NextResponse.json({ suggestions: [] });
    }

    // Batasi panjang input yang masuk ke prompt (kendalikan biaya token).
    const lastMsg = String(lastMessage).slice(0, 500);
    const lastResp = String(lastResponse).slice(0, 300);

    const prompt = language === "id"
      ? `Berdasarkan percakapan ini:
Pengguna: "${lastMsg}"
AI: "${lastResp}..."

Buat TEPAT 3 pertanyaan follow-up singkat yang mungkin ingin ditanyakan pengguna selanjutnya.
Pertanyaan harus:
- Relevan dengan konteks percakapan
- Singkat (maksimal 8 kata)
- Dalam Bahasa Indonesia
- Berbeda satu sama lain

Balas HANYA dengan JSON array, tanpa penjelasan, tanpa markdown:
["pertanyaan 1", "pertanyaan 2", "pertanyaan 3"]`
      : `Based on this conversation:
User: "${lastMsg}"
AI: "${lastResp}..."

Generate EXACTLY 3 short follow-up questions the user might want to ask next.
Questions must be:
- Relevant to the conversation context
- Short (max 8 words)
- In English
- Different from each other

Reply ONLY with a JSON array, no explanation, no markdown:
["question 1", "question 2", "question 3"]`;

    const { result } = await withGeminiModelFallback((selectedModel) =>
      getGeminiModel(selectedModel).generateContent(prompt)
    );
    const text     = result.response.text().trim();

    // Parse JSON — strip backticks kalau ada
    const clean    = text.replace(/```json|```/g, "").trim();
    const parsed   = JSON.parse(clean);

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ suggestions: [] });
    }

    return NextResponse.json({
      suggestions: parsed.slice(0, 3).filter((s: unknown) => typeof s === "string"),
    });
  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
