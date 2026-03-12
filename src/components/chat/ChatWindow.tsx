"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickPrompts } from "./QuickPrompts";
import { FollowUpSuggestions } from "./FollowUpSuggestions";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { profile } from "@/data/profile";
import { AlertCircle, Cpu, Share2, Trash2 } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { chatToMarkdown, copyToClipboard } from "@/lib/share";
import { useState } from "react";

interface Props {
  language: "id" | "en";
  externalMessages: ChatMessageType[];
  onMessagesChange: (msgs: ChatMessageType[]) => void;
}

export function ChatWindow({ language, externalMessages, onMessagesChange }: Props) {
  const {
    messages, isLoading, error,
    bottomRef, sendMessage,
    suggestions, loadingSuggestions,
  } = useChat({ language, externalMessages, onMessagesChange });

  const { toasts, addToast, removeToast } = useToast();
  const [shareHovered, setShareHovered]   = useState(false);
  const [clearHovered, setClearHovered]   = useState(false);

  const isEmpty = messages.length === 0;

  const handleShare = async () => {
    if (messages.length === 0) {
      addToast(
        language === "id" ? "Belum ada chat untuk dibagikan." : "No chat to share yet.",
        "info"
      );
      return;
    }
    const markdown = chatToMarkdown(messages, profile.name);
    const success  = await copyToClipboard(markdown);
    addToast(
      success
        ? (language === "id" ? "Chat berhasil disalin ke clipboard!" : "Chat copied to clipboard!")
        : (language === "id" ? "Gagal menyalin chat." : "Failed to copy chat."),
      success ? "success" : "error"
    );
  };

  const handleClear = () => {
    onMessagesChange([]);
    try { sessionStorage.removeItem("portfolio_chat_history"); } catch { /* skip */ }
    addToast(
      language === "id" ? "Chat dihapus." : "Chat cleared.",
      "info"
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Toolbar ── */}
      <AnimatePresence>
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex", alignItems: "center",
              gap: "4px", padding: "8px 16px 0",
              flexShrink: 0,
            }}
          >
            <span style={{
              fontSize: "10px", color: "hsl(var(--muted-foreground))",
              fontFamily: "var(--font-geist-mono)", marginRight: "auto",
            }}>
              {messages.length} {language === "id" ? "pesan" : "messages"}
            </span>

            <button
              onClick={handleShare}
              onMouseEnter={() => setShareHovered(true)}
              onMouseLeave={() => setShareHovered(false)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "4px 10px", borderRadius: "6px",
                border: `1px solid ${shareHovered ? "hsl(var(--accent) / 0.4)" : "hsl(var(--border))"}`,
                background: shareHovered ? "hsl(var(--accent) / 0.08)" : "transparent",
                color: shareHovered ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
                fontSize: "11px", fontFamily: "var(--font-geist-mono)",
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              <Share2 size={11} />
              {language === "id" ? "Salin" : "Copy"}
            </button>

            <button
              onClick={handleClear}
              onMouseEnter={() => setClearHovered(true)}
              onMouseLeave={() => setClearHovered(false)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "4px 10px", borderRadius: "6px",
                border: `1px solid ${clearHovered ? "hsl(0 69% 52% / 0.3)" : "hsl(var(--border))"}`,
                background: clearHovered ? "hsl(0 69% 52% / 0.08)" : "transparent",
                color: clearHovered ? "hsl(0 69% 62%)" : "hsl(var(--muted-foreground))",
                fontSize: "11px", fontFamily: "var(--font-geist-mono)",
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              <Trash2 size={11} />
              {language === "id" ? "Hapus" : "Clear"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
        <AnimatePresence initial={false}>

          {isEmpty && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                minHeight: "40vh", padding: "48px 24px 24px",
                textAlign: "center", gap: "20px",
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: "64px", height: "64px", borderRadius: "16px",
                  background: "hsl(var(--surface-2))",
                  border: "1px solid hsl(var(--accent) / 0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 32px hsl(var(--accent) / 0.2), 0 0 64px hsl(var(--accent) / 0.1)",
                }}
              >
                <Cpu size={28} color="hsl(var(--accent))" strokeWidth={1.5} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <p style={{
                  fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "hsl(var(--accent))", fontFamily: "var(--font-geist-mono)",
                  marginBottom: "8px",
                }}>
                  AI Portfolio Assistant
                </p>
                <h1 style={{
                  fontSize: "22px", fontWeight: 600,
                  color: "hsl(var(--foreground))",
                  fontFamily: "var(--font-geist-mono)", marginBottom: "8px",
                }}>
                  {language === "id"
                    ? `Halo, saya asisten ${profile.name}`
                    : `Hi, I'm ${profile.name}'s AI`}
                </h1>
                <p style={{
                  fontSize: "13px", color: "hsl(var(--muted-foreground))",
                  maxWidth: "380px", lineHeight: 1.6,
                }}>
                  {profile.tagline}
                </p>
              </motion.div>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{
                  width: "120px", height: "1px",
                  background: "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)",
                }}
              />
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={msg.id} message={msg} index={i} />
          ))}

        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              margin: "8px 16px", padding: "10px 14px", borderRadius: "10px",
              background: "hsl(0 69% 52% / 0.08)",
              border: "1px solid hsl(0 69% 52% / 0.2)",
              color: "hsl(0 69% 62%)", fontSize: "13px",
            }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}

        <div ref={bottomRef} style={{ height: "8px" }} />
      </div>

      {/* ── Quick Prompts (welcome state) ── */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <QuickPrompts onSelect={sendMessage} disabled={isLoading} language={language} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Follow-up Suggestions (setelah AI reply) ── */}
      <AnimatePresence>
        {!isEmpty && !isLoading && (suggestions.length > 0 || loadingSuggestions) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {loadingSuggestions ? (
              // Skeleton loading suggestions
              <div style={{ padding: "4px 16px 8px", display: "flex", gap: "6px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    height: "28px",
                    width: `${80 + i * 20}px`,
                    borderRadius: "99px",
                    background: "hsl(var(--surface-2))",
                    animation: "pulse-soft 1.5s ease-in-out infinite",
                  }} />
                ))}
              </div>
            ) : (
              <FollowUpSuggestions
                suggestions={suggestions}
                onSelect={sendMessage}
                disabled={isLoading}
                language={language}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} language={language} />

      {/* ── Toast ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}