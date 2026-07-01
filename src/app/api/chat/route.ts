import { NextRequest, NextResponse } from "next/server";
import {
  getGeminiModel,
  isRetryableGeminiError,
  withGeminiModelFallback,
} from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";
import { ChatHistory } from "@/types/chat";

const MAX_HISTORY = 20; // batasi konteks agar biaya token terkendali

function buildChatHistory(history: ChatHistory[], systemPrompt: string): ChatHistory[] {
  return [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [
        {
          text: `Siap! Saya adalah AI asisten personal. Saya akan membantu visitor mengenal pemilik portfolio ini. Silakan mulai bertanya!`,
        },
      ],
    },
    ...history,
  ];
}

export async function POST(req: NextRequest) {
  try {
    // ─── Rate Limiting ───
    const rl = await rateLimit(`chat:${clientIp(req)}`, 20, 60_000);
    if (!rl.ok) {
      return tooMany(rl.retryAfterSec, "Terlalu banyak request. Coba lagi dalam 1 menit.");
    }

    // ─── Parse Request Body ───
    const body = await req.json();
    const { message, history, language } = body as {
      message: string;
      history: ChatHistory[];
      language?: string;
    };
    const lang: "id" | "en" = language === "en" ? "en" : "id";

    // Validasi input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Pesan terlalu panjang. Maksimal 1000 karakter." },
        { status: 400 }
      );
    }

    // Batasi history: array valid + hanya N turn terakhir.
    const safeHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY) : [];

    // ─── Build System Prompt (mengikuti bahasa terpilih) ───
    const systemPrompt = buildSystemPrompt(lang);
    const geminiHistory = buildChatHistory(safeHistory, systemPrompt);

    // Mulai STREAM dari Gemini. Retry + fallback model hanya di tahap awal ini
    // (sebelum byte pertama). Setelah streaming mulai, error di tengah dikirim
    // sebagai event {error} karena tidak bisa lagi ganti model.
    const { result, modelName } = await withGeminiModelFallback(async (selectedModel) => {
      const chat = getGeminiModel(selectedModel).startChat({ history: geminiHistory });
      return chat.sendMessageStream(message);
    });

    if (modelName !== "gemini-2.5-flash") {
      console.warn(`Chat API fallback model in use: ${modelName}`);
    }

    // Alirkan token Gemini ke SSE begitu tiba (streaming asli — TTFB nyata).
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let produced = false;
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              produced = true;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          if (!produced) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: "AI tidak mengembalikan respons." })}\n\n`)
            );
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (streamError) {
          console.error("Stream error:", streamError);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream terputus." })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    if (isRetryableGeminiError(error)) {
      return NextResponse.json(
        {
          error:
            "AI sedang sibuk karena traffic tinggi. Coba lagi beberapa saat lagi.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    );
  }
}
