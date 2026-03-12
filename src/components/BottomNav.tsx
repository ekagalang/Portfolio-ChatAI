"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, FolderGit2, Briefcase, Mail } from "lucide-react";
import { SidebarView } from "@/components/Sidebar";

interface Props {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  language: "id" | "en";
}

const NAV_ITEMS: {
  id: SidebarView;
  icon: React.ReactNode;
  label: string;
  labelEn: string;
}[] = [
  { id: "chat",     icon: <MessageSquare size={18} />, label: "Chat",    labelEn: "Chat" },
  { id: "projects", icon: <FolderGit2 size={18} />,    label: "Project", labelEn: "Projects" },
  { id: "services", icon: <Briefcase size={18} />,     label: "Jasa",    labelEn: "Services" },
  { id: "contact",  icon: <Mail size={18} />,          label: "Kontak",  labelEn: "Contact" },
];

export function BottomNav({ activeView, onViewChange, language }: Props) {
  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: "60px",
      background: "hsl(var(--background) / 0.95)",
      backdropFilter: "blur(16px)",
      borderTop: "1px solid hsl(var(--border))",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      zIndex: 40,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              height: "100%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: isActive ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
              transition: "color 0.15s ease",
              position: "relative",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="bottomNavIndicator"
                style={{
                  position: "absolute",
                  top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: "24px", height: "2px",
                  borderRadius: "0 0 2px 2px",
                  background: "hsl(var(--accent))",
                  boxShadow: "0 0 8px hsl(var(--accent) / 0.6)",
                }}
                transition={{ duration: 0.2 }}
              />
            )}

            <motion.div
              animate={{ scale: isActive ? 1.1 : 1 }}
              transition={{ duration: 0.15 }}
            >
              {item.icon}
            </motion.div>

            <span style={{
              fontSize: "10px",
              fontFamily: "var(--font-geist-mono)",
              fontWeight: isActive ? 600 : 400,
            }}>
              {language === "id" ? item.label : item.labelEn}
            </span>
          </button>
        );
      })}
    </nav>
  );
}