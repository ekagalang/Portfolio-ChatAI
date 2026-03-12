"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage, ChatHistory } from "@/types/chat";

const SESSION_KEY = "portfolio_chat_history";

function saveToSession(messages: ChatMessage[]) {
  try {
    const serialized = messages.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
    }));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(serialized));
  } catch { /* skip */ }
}

function loadFromSession(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: ChatMessage & { timestamp: string }) => ({
      ...m,
      timestamp: new Date(m.timestamp),
      isStreaming: false,
    }));
  } catch {
    return [];
  }
}

interface UseChatOptions {
  language: "id" | "en";
  externalMessages: ChatMessage[];
  onMessagesChange: (msgs: ChatMessage[]) => void;
}

export function useChat({ language, externalMessages, onMessagesChange }: UseChatOptions) {
  const [isLoading, setIsLoading]                   = useState(false);
  const [error, setError]                           = useState<string | null>(null);
  const [suggestions, setSuggestions]               = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const bottomRef                                   = useRef<HTMLDivElement>(null);
  const isRestoredRef                               = useRef(false);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Fetch suggestions — didefinisikan duluan ──
  const fetchSuggestions = useCallback(async (
    userMessage: string,
    aiResponse: string
  ) => {
    if (!userMessage || !aiResponse) return;
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastMessage:  userMessage,
          lastResponse: aiResponse,
          language,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      // Suggestions gagal — tidak perlu error state
    } finally {
      setLoadingSuggestions(false);
    }
  }, [language]);

  // ── Restore dari sessionStorage + regenerate suggestions ──
  useEffect(() => {
    if (isRestoredRef.current) return;
    isRestoredRef.current = true;

    if (externalMessages.length === 0) {
      const saved = loadFromSession();
      if (saved.length > 0) {
        onMessagesChange(saved);

        // Regenerate suggestions dari pesan terakhir
        const lastAI   = [...saved].reverse().find((m) => m.role === "assistant");
        const lastUser = [...saved].reverse().find((m) => m.role === "user");

        if (lastAI && lastUser) {
          setTimeout(() => {
            fetchSuggestions(lastUser.content, lastAI.content);
          }, 600);
        }
      }
    }
  }, [fetchSuggestions, onMessagesChange]);

  // ── Auto-save ──
  useEffect(() => {
    if (externalMessages.length === 0) return;
    const hasStreaming = externalMessages.some((m) => m.isStreaming);
    if (!hasStreaming) saveToSession(externalMessages);
  }, [externalMessages]);

  // ── Scroll saat messages berubah ──
  useEffect(() => {
    scrollToBottom();
  }, [externalMessages, scrollToBottom]);

  const buildHistory = (msgs: ChatMessage[]): ChatHistory[] => {
    return msgs.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;
      setError(null);
      setSuggestions([]);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      const updatedMessages = [...externalMessages, userMessage];
      onMessagesChange([...updatedMessages, assistantMessage]);
      setIsLoading(true);
      setTimeout(scrollToBottom, 100);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            history: buildHistory(updatedMessages),
            language,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error ?? "Gagal menghubungi AI.");
        }

        const reader  = res.body?.getReader();
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
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulatedText += parsed.text;
                onMessagesChange([
                  ...updatedMessages,
                  { ...assistantMessage, content: accumulatedText },
                ]);
                scrollToBottom();
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch { /* skip */ }
          }
        }

        const finalMessages = [
          ...updatedMessages,
          { ...assistantMessage, content: accumulatedText, isStreaming: false },
        ];
        onMessagesChange(finalMessages);
        saveToSession(finalMessages);

        // Fetch suggestions setelah stream selesai
        fetchSuggestions(content.trim(), accumulatedText);

      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan.";
        setError(errMsg);
        onMessagesChange(updatedMessages);
      } finally {
        setIsLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    },
    [externalMessages, isLoading, language, onMessagesChange, scrollToBottom, fetchSuggestions]
  );

  return {
    messages: externalMessages,
    isLoading,
    error,
    bottomRef,
    sendMessage,
    suggestions,
    loadingSuggestions,
  };
}