"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "@/types/chat";

interface Props {
  message: ChatMessageType;
  index: number;
}

export function ChatMessage({ message, index }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index === 0 ? 0 : 0 }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        padding: "6px 16px",
        gap: "10px",
        alignItems: "flex-end",
      }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
          background: "hsl(var(--surface-2))",
          border: "1px solid hsl(var(--accent) / 0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "11px", fontWeight: 700,
          color: "hsl(var(--accent))",
          fontFamily: "var(--font-geist-mono)",
          boxShadow: "0 0 8px hsl(var(--accent) / 0.15)",
        }}>
          AI
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: "72%",
        padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        fontSize: "13.5px",
        lineHeight: 1.65,
        ...(isUser ? {
          background: "hsl(var(--accent))",
          color: "hsl(var(--accent-foreground))",
          fontFamily: "var(--font-geist-sans)",
        } : {
          background: "hsl(var(--surface))",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))",
        }),
      }}>
        {isUser ? (
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{message.content}</p>
        ) : (
          <div style={{ fontFamily: "var(--font-geist-sans)" }}>
            {message.content ? (
              <div className={`prose prose-sm dark:prose-invert max-w-none
                prose-p:my-1 prose-p:leading-relaxed
                prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                prose-headings:my-2 prose-headings:font-semibold
                prose-code:text-[hsl(var(--accent))] prose-code:bg-[hsl(var(--surface-2))]
                prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                prose-pre:bg-[hsl(var(--surface-2))] prose-pre:border prose-pre:border-[hsl(var(--border))]
                prose-strong:text-[hsl(var(--foreground))]
                prose-a:text-[hsl(var(--accent))] prose-a:no-underline hover:prose-a:underline
              `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <span className="typing-cursor" style={{ color: "hsl(var(--muted-foreground))" }}>&nbsp;</span>
            )}
            {message.isStreaming && message.content && (
              <span className="typing-cursor" />
            )}
          </div>
        )}

        {/* Time */}
        <p style={{
          fontSize: "10px", marginTop: "4px",
          color: isUser ? "hsl(var(--accent-foreground) / 0.6)" : "hsl(var(--muted-foreground))",
          textAlign: isUser ? "right" : "left",
          fontFamily: "var(--font-geist-mono)",
        }}>
          {message.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
          background: "hsl(var(--surface-2))",
          border: "1px solid hsl(var(--border))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px",
        }}>
          👤
        </div>
      )}
    </motion.div>
  );
}