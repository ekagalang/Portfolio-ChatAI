"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickPrompts } from "./QuickPrompts";
import { useChat } from "@/hooks/useChat";
import { profile } from "@/data/profile";
import { AlertCircle, Cpu } from "lucide-react";

export function ChatWindow() {
  const { messages, isLoading, error, bottomRef, sendMessage } = useChat();
  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
        <AnimatePresence initial={false}>

          {/* Welcome */}
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
              {/* Glowing avatar */}
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
                  fontSize: "24px",
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
                  fontFamily: "var(--font-geist-mono)",
                  marginBottom: "8px",
                }}>
                  Halo, saya asisten {profile.name}
                </h1>
                <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", maxWidth: "380px", lineHeight: 1.6 }}>
                  {profile.tagline}
                </p>
              </motion.div>

              {/* Divider */}
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

          {/* Messages */}
          {messages.map((msg, i) => (
            <ChatMessage key={msg.id} message={msg} index={i} />
          ))}

        </AnimatePresence>

        {/* Error */}
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

      {/* Quick Prompts */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <QuickPrompts onSelect={sendMessage} disabled={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}