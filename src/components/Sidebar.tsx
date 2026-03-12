"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, FolderGit2, Briefcase, Mail,
  ChevronRight, Globe, Download, Clock, Trash2,
} from "lucide-react";
import { profile } from "@/data/profile";

export type SidebarView = "chat" | "projects" | "services" | "contact";

interface ChatSessionItem {
  id: string;
  preview: string;
  timestamp: Date;
}

interface Props {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  chatSessions: ChatSessionItem[];
  onClearHistory: () => void;
  language: "id" | "en";
  onLanguageToggle: () => void;
  onCVOpen: () => void; // ← prop baru
}

const NAV_ITEMS: {
  id: SidebarView;
  icon: React.ReactNode;
  label: string;
  labelEn: string;
}[] = [
  { id: "chat",     icon: <MessageSquare size={15} />, label: "Chat",    labelEn: "Chat" },
  { id: "projects", icon: <FolderGit2 size={15} />,    label: "Project", labelEn: "Projects" },
  { id: "services", icon: <Briefcase size={15} />,     label: "Jasa",    labelEn: "Services" },
  { id: "contact",  icon: <Mail size={15} />,          label: "Kontak",  labelEn: "Contact" },
];

export function Sidebar({
  activeView, onViewChange,
  chatSessions, onClearHistory,
  language, onLanguageToggle,
  onCVOpen,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        height: "100%",
        borderRight: "1px solid hsl(var(--border))",
        background: "hsl(var(--surface))",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── Collapse toggle ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-end",
        padding: "12px 10px 8px",
        borderBottom: "1px solid hsl(var(--border))",
        flexShrink: 0,
      }}>
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          style={{
            width: "24px", height: "24px", borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", cursor: "pointer",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <ChevronRight size={14} />
        </motion.button>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ padding: "8px 8px 0", flexShrink: 0 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? (language === "id" ? item.label : item.labelEn) : ""}
              style={{
                width: "100%",
                display: "flex", alignItems: "center",
                gap: "10px",
                padding: collapsed ? "9px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "8px", marginBottom: "2px",
                border: "none", cursor: "pointer",
                transition: "all 0.15s ease",
                background: isActive ? "hsl(var(--accent) / 0.12)" : "transparent",
                color: isActive ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
                fontFamily: "var(--font-geist-mono)",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.2 }}
                    style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                  >
                    {language === "id" ? item.label : item.labelEn}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    marginLeft: "auto",
                    width: "4px", height: "4px", borderRadius: "50%",
                    background: "hsl(var(--accent))",
                    boxShadow: "0 0 6px hsl(var(--accent))",
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div style={{ height: "1px", background: "hsl(var(--border))", margin: "10px 8px" }} />

      {/* ── Chat History ── */}
      <AnimatePresence>
        {!collapsed && activeView === "chat" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}
          >
            <div style={{
              padding: "0 10px 6px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono)",
              }}>
                history
              </span>
              {chatSessions.length > 0 && (
                <button
                  onClick={onClearHistory}
                  title="Clear history"
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "hsl(var(--muted-foreground))", padding: "2px",
                    display: "flex", alignItems: "center",
                  }}
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px", minHeight: 0 }}>
              {chatSessions.length === 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "6px", padding: "16px 8px", textAlign: "center",
                }}>
                  <Clock size={16} color="hsl(var(--border))" />
                  <p style={{
                    fontSize: "11px", color: "hsl(var(--muted-foreground))",
                    fontFamily: "var(--font-geist-mono)", margin: 0,
                  }}>
                    no history yet
                  </p>
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      padding: "7px 8px", borderRadius: "6px", marginBottom: "4px",
                      background: "hsl(var(--surface-2))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    <p style={{
                      fontSize: "11px", color: "hsl(var(--foreground))",
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", margin: 0,
                    }}>
                      {session.preview}
                    </p>
                    <p style={{
                      fontSize: "10px", color: "hsl(var(--muted-foreground))",
                      margin: "2px 0 0", fontFamily: "var(--font-geist-mono)",
                    }}>
                      {session.timestamp.toLocaleTimeString("id-ID", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* spacer */}
      {(collapsed || activeView !== "chat") && <div style={{ flex: 1 }} />}

      {/* ── Bottom Actions ── */}
      <div style={{
        padding: "8px",
        borderTop: "1px solid hsl(var(--border))",
        display: "flex", flexDirection: "column", gap: "4px",
        flexShrink: 0,
      }}>
        {/* CV — buka modal preview */}
        <button
          onClick={onCVOpen}
          title={collapsed ? "CV" : ""}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: collapsed ? "9px 0" : "9px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "8px", width: "100%",
            color: "hsl(var(--accent))",
            fontSize: "12px", fontFamily: "var(--font-geist-mono)",
            border: "1px solid hsl(var(--accent) / 0.2)",
            background: "hsl(var(--accent) / 0.06)",
            cursor: "pointer", transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "hsl(var(--accent) / 0.12)";
            e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "hsl(var(--accent) / 0.06)";
            e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.2)";
          }}
        >
          <Download size={14} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Download CV
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Language Toggle */}
        <button
          onClick={onLanguageToggle}
          title={collapsed ? "Toggle language" : ""}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: collapsed ? "9px 0" : "9px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "8px", width: "100%",
            color: "hsl(var(--muted-foreground))",
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: "12px", fontFamily: "var(--font-geist-mono)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "hsl(var(--surface-2))";
            e.currentTarget.style.color = "hsl(var(--foreground))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "hsl(var(--muted-foreground))";
          }}
        >
          <Globe size={14} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {language === "id" ? "🇮🇩 Indonesia" : "🇺🇸 English"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}