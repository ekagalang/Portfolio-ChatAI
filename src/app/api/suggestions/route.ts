import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { lastMessage, lastResponse, language } = await req.json();

    if (!lastMessage || !lastResponse) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY tidak ada di environment");
      return NextResponse.json({ suggestions: [] });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = language === "id"
      ? `Berdasarkan percakapan ini:
Pengguna: "${lastMessage}"
AI: "${lastResponse.slice(0, 300)}..."

Buat TEPAT 3 pertanyaan follow-up singkat yang mungkin ingin ditanyakan pengguna selanjutnya.
Pertanyaan harus:
- Relevan dengan konteks percakapan
- Singkat (maksimal 8 kata)
- Dalam Bahasa Indonesia
- Berbeda satu sama lain

Balas HANYA dengan JSON array, tanpa penjelasan, tanpa markdown:
["pertanyaan 1", "pertanyaan 2", "pertanyaan 3"]`
      : `Based on this conversation:
User: "${lastMessage}"
AI: "${lastResponse.slice(0, 300)}..."

Generate EXACTLY 3 short follow-up questions the user might want to ask next.
Questions must be:
- Relevant to the conversation context
- Short (max 8 words)
- In English
- Different from each other

Reply ONLY with a JSON array, no explanation, no markdown:
["question 1", "question 2", "question 3"]`;

    const result   = await model.generateContent(prompt);
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
