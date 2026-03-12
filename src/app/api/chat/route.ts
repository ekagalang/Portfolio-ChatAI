import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { ChatHistory } from "@/types/chat";

// Simple in-memory rate limiter per IP
// Untuk production bisa diganti Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;        // max request per window
const RATE_WINDOW = 60 * 1000; // 1 menit dalam ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) return false;

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // ─── Rate Limiting ───
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi dalam 1 menit." },
        { status: 429 }
      );
    }

    // ─── Parse Request Body ───
    const body = await req.json();
    const { message, history } = body as {
      message: string;
      history: ChatHistory[];
    };

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

    // ─── Build System Prompt ───
    const systemPrompt = buildSystemPrompt();
    const geminiModel = getGeminiModel();

    // ─── Start Chat dengan History ───
    // Gemini menggunakan model "model" bukan "assistant"
    const chat = geminiModel.startChat({
      history: [
        // Inject system prompt sebagai pesan pertama
        // Ini trik agar Gemini "tahu" tentang pemilik portfolio
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
        // Inject conversation history sebelumnya
        ...history,
      ],
    });

    // ─── Send Message & Stream Response ───
    const result = await chat.sendMessageStream(message);

    // Streaming response agar terasa real-time seperti ChatGPT/Claude
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // Format: "data: <text>\n\n" — Server-Sent Events standard
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          // Signal bahwa stream selesai
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (streamError) {
          console.error("Stream error:", streamError);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream terputus." })}\n\n`
            )
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
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    );
  }
}
