"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar, SidebarView } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { CVModal } from "@/components/CVModal";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ProjectsView } from "@/components/views/ProjectsView";
import { ServicesView } from "@/components/views/ServicesView";
import { ContactView } from "@/components/views/ContactView";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { ChatMessage } from "@/types/chat";

const SESSION_KEY = "portfolio_chat_history";

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Galang",
  url: "https://ekagalang.my.id",
  jobTitle: "Fullstack Developer",
  description: "Fullstack Developer spesialis Laravel, Next.js, dan Flutter",
  sameAs: [
    "https://github.com/ekagalang",
    "https://linkedin.com/in/ekagalang",
  ],
  knowsAbout: [
    "Laravel", "Next.js", "Flutter", "Vue.js",
    "TypeScript", "MySQL", "Docker",
  ],
  offers: {
    "@type": "Offer",
    description: "Jasa pembuatan website, aplikasi mobile, dan API backend",
  },
};

export default function Home() {
  const [activeView, setActiveView]   = useState<SidebarView>("chat");
  const [language, setLanguage]       = useState<"id" | "en">("id");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [cvOpen, setCvOpen]           = useState(false);
  const isMobile                      = useIsMobile();

  const handleClearHistory = () => {
    setChatHistory([]);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* skip */ }
  };

  const handleLanguageToggle = () =>
    setLanguage((l) => (l === "id" ? "en" : "id"));

  const chatSessions = chatHistory
    .filter((m) => m.role === "user")
    .slice(-8)
    .map((m) => ({
      id: m.id,
      preview: m.content.slice(0, 40) + (m.content.length > 40 ? "..." : ""),
      timestamp: m.timestamp,
    }));

  return (
    <>
      {/* JSON-LD Structured Data untuk SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{
        display: "flex", flexDirection: "column",
        height: "100dvh", overflow: "hidden",
      }}>
        <Navbar
          language={language}
          onCVOpen={() => setCvOpen(true)}
          onLanguageToggle={handleLanguageToggle}
        />

        <div style={{
          flex: 1, display: "flex", overflow: "hidden", minHeight: 0,
          paddingBottom: isMobile ? "60px" : 0,
        }}>
          {/* Sidebar — hanya desktop */}
          {!isMobile && (
            <Sidebar
              activeView={activeView}
              onViewChange={setActiveView}
              chatSessions={chatSessions}
              onClearHistory={handleClearHistory}
              language={language}
              onLanguageToggle={handleLanguageToggle}
              onCVOpen={() => setCvOpen(true)}
            />
          )}

          {/* Main content */}
          <main style={{
            flex: 1, overflow: "hidden",
            display: "flex", flexDirection: "column",
            minWidth: 0,
          }}>
            <AnimatePresence mode="wait">
              {activeView === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: "100%", display: "flex", flexDirection: "column" }}
                >
                  <div style={{
                    height: "100%",
                    maxWidth: isMobile ? "100%" : "760px",
                    width: "100%", margin: "0 auto",
                    display: "flex", flexDirection: "column",
                  }}>
                    <ChatWindow
                      language={language}
                      externalMessages={chatHistory}
                      onMessagesChange={setChatHistory}
                    />
                  </div>
                </motion.div>
              )}

              {activeView === "projects" && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    height: "100%",
                    maxWidth: isMobile ? "100%" : "760px",
                    width: "100%", margin: "0 auto",
                  }}
                >
                  <ProjectsView language={language} />
                </motion.div>
              )}

              {activeView === "services" && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    height: "100%",
                    maxWidth: isMobile ? "100%" : "760px",
                    width: "100%", margin: "0 auto",
                  }}
                >
                  <ServicesView language={language} />
                </motion.div>
              )}

              {activeView === "contact" && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    height: "100%",
                    maxWidth: isMobile ? "100%" : "760px",
                    width: "100%", margin: "0 auto",
                  }}
                >
                  <ContactView language={language} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Bottom Nav — hanya mobile */}
        {isMobile && (
          <BottomNav
            activeView={activeView}
            onViewChange={setActiveView}
            language={language}
          />
        )}

        <CVModal
          open={cvOpen}
          onClose={() => setCvOpen(false)}
          language={language}
        />
      </div>
    </>
  );
}