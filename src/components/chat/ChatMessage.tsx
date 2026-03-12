"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "@/types/chat";

interface Props {
  message: ChatMessageType;
  index: number;
}

// Split teks jadi array kata dengan spasi
function splitIntoWords(text: string): string[] {
  return text.split(/(\s+)/).filter(Boolean);
}

// Komponen untuk render teks AI dengan fade-in per kata
function AnimatedText({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming?: boolean;
}) {
  const words = useMemo(() => splitIntoWords(content), [content]);

  if (!isStreaming) {
    // Sudah selesai streaming — render markdown biasa tanpa animasi
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p style={{ margin: "0 0 8px", lineHeight: 1.7, lastChild: { marginBottom: 0 } } as React.CSSProperties}>
              {children}
            </p>
          ),
          code: ({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode }) =>
            inline ? (
              <code
                {...props}
                style={{
                  padding: "1px 6px", borderRadius: "4px",
                  background: "hsl(var(--surface-2))",
                  border: "1px solid hsl(var(--border))",
                  fontSize: "12px", fontFamily: "var(--font-geist-mono)",
                  color: "hsl(var(--accent))",
                }}
              >
                {children}
              </code>
            ) : (
              <code
                {...props}
                style={{
                  display: "block", padding: "12px 14px", borderRadius: "8px",
                  background: "hsl(var(--surface-2))",
                  border: "1px solid hsl(var(--border))",
                  fontSize: "12px", fontFamily: "var(--font-geist-mono)",
                  overflowX: "auto", lineHeight: 1.6,
                }}
              >
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre style={{ margin: "8px 0", borderRadius: "8px", overflow: "hidden" }}>
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul style={{ paddingLeft: "16px", margin: "4px 0" }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ paddingLeft: "16px", margin: "4px 0" }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: "2px 0", lineHeight: 1.6 }}>{children}</li>
          ),
          strong: ({ children }) => (
            <strong style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>
              {children}
            </strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "hsl(var(--accent))", textDecoration: "underline" }}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  // Sedang streaming — render kata per kata dengan fade in
  return (
    <span style={{ lineHeight: 1.7 }}>
      {words.map((word, i) => (
        <motion.span
          key={`${i}-${word}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
            // Delay per kata — makin belakang makin cepat biar tidak lag
            delay: Math.min(i * 0.015, 0.3),
          }}
          style={{ display: "inline" }}
        >
          {word}
        </motion.span>
      ))}
      {/* Blinking cursor saat streaming */}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{
          display: "inline-block",
          width: "2px", height: "14px",
          background: "hsl(var(--accent))",
          marginLeft: "2px",
          verticalAlign: "middle",
          borderRadius: "1px",
        }}
      />
    </span>
  );
}

export function ChatMessage({ message, index }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        delay: index === 0 ? 0.1 : 0,
      }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        padding: "6px 16px",
      }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: "24px", height: "24px", borderRadius: "6px",
          background: "hsl(var(--accent) / 0.15)",
          border: "1px solid hsl(var(--accent) / 0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginRight: "8px", marginTop: "2px",
          fontSize: "10px",
        }}>
          ⚡
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: "82%",
        padding: isUser ? "8px 14px" : "10px 14px",
        borderRadius: isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
        background: isUser
          ? "hsl(var(--accent))"
          : "hsl(var(--surface))",
        border: isUser
          ? "none"
          : "1px solid hsl(var(--border))",
        color: isUser
          ? "hsl(var(--accent-foreground))"
          : "hsl(var(--foreground))",
        fontSize: "13px",
        lineHeight: 1.7,
      }}>
        {isUser ? (
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
        ) : (
          <AnimatedText
            content={message.content}
            isStreaming={message.isStreaming}
          />
        )}
      </div>
    </motion.div>
  );
}