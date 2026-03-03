"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, ChatHistory } from "@/types/chat";

// Custom hook ini handle semua logic chat:
// send message, streaming response, manage history
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref untuk auto-scroll ke bawah
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Convert messages ke format history Gemini
  const buildHistory = (msgs: ChatMessage[]): ChatHistory[] => {
    // Exclude pesan terakhir karena itu yang sedang dikirim
    return msgs.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      // Tambah pesan user ke UI
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      // Tambah placeholder AI yang masih kosong (streaming)
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages([...updatedMessages, assistantMessage]);
      setIsLoading(true);
      setTimeout(scrollToBottom, 100);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            history: buildHistory(updatedMessages),
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error ?? "Gagal menghubungi AI.");
        }

        // ─── Handle SSE Stream ───
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        if (!reader) throw new Error("Stream tidak tersedia.");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            const data = line.slice(6); // hapus "data: "
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulatedText += parsed.text;

                // Update pesan AI secara realtime saat stream masuk
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
                scrollToBottom();
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch {
              // Skip invalid JSON chunks
            }
          }
        }

        // Stream selesai — matikan isStreaming
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Terjadi kesalahan.";
        setError(errMsg);

        // Hapus placeholder AI yang gagal
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessage.id)
        );
      } finally {
        setIsLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    },
    [messages, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    bottomRef,
    sendMessage,
    clearMessages,
  };
}