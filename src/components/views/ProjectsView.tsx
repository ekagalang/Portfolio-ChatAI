"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, GitFork, ExternalLink, Github,
  Users, BookMarked, Filter,
} from "lucide-react";
import { GithubRepo, GithubProfile, featuredProjects } from "@/data/projects";

interface Props {
  language: "id" | "en";
}

// Warna per bahasa pemrograman
const LANG_COLORS: Record<string, string> = {
  TypeScript:  "#3178c6",
  JavaScript:  "#f1e05a",
  PHP:         "#4F5D95",
  Dart:        "#00B4AB",
  Python:      "#3572A5",
  Vue:         "#41b883",
  CSS:         "#563d7c",
  HTML:        "#e34c26",
  Shell:       "#89e051",
  Go:          "#00ADD8",
};

function SkeletonCard() {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: "10px",
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--surface))",
      animation: "pulse-soft 1.5s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ width: "40%", height: "13px", borderRadius: "4px", background: "hsl(var(--surface-2))" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "hsl(var(--surface-2))" }} />
      </div>
      <div style={{ width: "90%", height: "11px", borderRadius: "4px", background: "hsl(var(--surface-2))", marginBottom: "6px" }} />
      <div style={{ width: "70%", height: "11px", borderRadius: "4px", background: "hsl(var(--surface-2))", marginBottom: "10px" }} />
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ width: "50px", height: "11px", borderRadius: "4px", background: "hsl(var(--surface-2))" }} />
        <div style={{ width: "30px", height: "11px", borderRadius: "4px", background: "hsl(var(--surface-2))" }} />
      </div>
    </div>
  );
}

function Section({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
      <span style={{
        fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
        color: accent ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
        fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "hsl(var(--border))" }} />
    </div>
  );
}

export function ProjectsView({ language }: Props) {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [githubProfile, setGithubProfile] = useState<GithubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetch("/api/github")
      .then((r) => r.json())
      .then((data) => {
        setRepos(data.repos || []);
        setGithubProfile(data.profile || null);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Kumpulkan semua language yang ada
  const languages = useMemo(() => {
    const langs = repos
      .map((r) => r.language)
      .filter(Boolean) as string[];
    return ["all", ...Array.from(new Set(langs))];
  }, [repos]);

  // Filter repos by language
  const filteredRepos = useMemo(() => {
    if (selectedLang === "all") return repos;
    return repos.filter((r) => r.language === selectedLang);
  }, [repos, selectedLang]);

  const t = {
    featured:   language === "id" ? "Unggulan" : "Featured",
    github:     language === "id" ? "Repository GitHub" : "GitHub Repositories",
    empty:      language === "id" ? "Tidak ada repo yang cocok." : "No matching repositories.",
    error:      language === "id" ? "Gagal memuat repo. Cek GITHUB_USERNAME di .env" : "Failed to load repos.",
    allLang:    language === "id" ? "Semua" : "All",
    repos:      language === "id" ? "repo publik" : "public repos",
    followers:  language === "id" ? "followers" : "followers",
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px 20px" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

        {/* ── Header ── */}
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "hsl(var(--foreground))", fontFamily: "var(--font-geist-mono)", marginBottom: "4px" }}>
          {language === "id" ? "Project" : "Projects"}
        </h2>
        <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginBottom: "20px" }}>
          {language === "id" ? "Project pilihan & repository publik" : "Featured work & public repositories"}
        </p>

        {/* ── GitHub Profile Card ── */}
        {githubProfile && (
          <motion.a
            href={githubProfile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 14px", borderRadius: "10px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--surface))",
              textDecoration: "none", marginBottom: "24px",
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(var(--border))")}
          >
            {/* Avatar */}
            <img
              src={githubProfile.avatar_url}
              alt={githubProfile.login}
              style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground))", margin: "0 0 2px", fontFamily: "var(--font-geist-mono)" }}>
                {githubProfile.name || githubProfile.login}
              </p>
              {githubProfile.bio && (
                <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {githubProfile.bio}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "14px", flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground))", margin: 0, fontFamily: "var(--font-geist-mono)" }}>
                  {githubProfile.public_repos}
                </p>
                <p style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", margin: 0 }}>{t.repos}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground))", margin: 0, fontFamily: "var(--font-geist-mono)" }}>
                  {githubProfile.followers}
                </p>
                <p style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", margin: 0 }}>{t.followers}</p>
              </div>
            </div>
            <Github size={14} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0 }} />
          </motion.a>
        )}

        {/* ── Featured Projects ── */}
        <Section label={t.featured} accent />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
          {featuredProjects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: "14px 16px", borderRadius: "10px",
                border: "1px solid hsl(var(--accent) / 0.2)",
                background: "hsl(var(--accent) / 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {p.pinned && (
                    <BookMarked size={12} color="hsl(var(--accent))" />
                  )}
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground))", margin: 0 }}>
                    {p.title}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "hsl(var(--accent))", display: "flex" }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <span style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "99px",
                    background: p.status === "Production" ? "hsl(152 69% 52% / 0.15)" : "hsl(var(--surface-2))",
                    color: p.status === "Production" ? "hsl(152 69% 52%)" : "hsl(var(--muted-foreground))",
                    fontFamily: "var(--font-geist-mono)",
                  }}>
                    {p.status}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", margin: "0 0 10px", lineHeight: 1.5 }}>
                {p.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {p.stack.map((s) => (
                  <span key={s} style={{
                    fontSize: "10px", padding: "2px 7px", borderRadius: "4px",
                    background: "hsl(var(--surface-2))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                    fontFamily: "var(--font-geist-mono)",
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── GitHub Repos ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <Section label={t.github} />
          {!loading && repos.length > 0 && (
            <button
              onClick={() => setShowFilter(!showFilter)}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "4px 8px", borderRadius: "6px",
                border: `1px solid ${showFilter ? "hsl(var(--accent) / 0.4)" : "hsl(var(--border))"}`,
                background: showFilter ? "hsl(var(--accent) / 0.08)" : "transparent",
                color: showFilter ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
                fontSize: "11px", fontFamily: "var(--font-geist-mono)",
                cursor: "pointer", marginBottom: "10px", flexShrink: 0,
                transition: "all 0.15s ease",
              }}
            >
              <Filter size={11} />
              {language === "id" ? "Filter" : "Filter"}
            </button>
          )}
        </div>

        {/* Language filter chips */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: "12px" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingBottom: "4px" }}>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "3px 10px", borderRadius: "99px",
                      border: `1px solid ${selectedLang === lang ? "hsl(var(--accent) / 0.5)" : "hsl(var(--border))"}`,
                      background: selectedLang === lang ? "hsl(var(--accent) / 0.1)" : "hsl(var(--surface))",
                      color: selectedLang === lang ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
                      fontSize: "11px", fontFamily: "var(--font-geist-mono)",
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}
                  >
                    {lang !== "all" && (
                      <span style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: LANG_COLORS[lang] ?? "hsl(var(--muted-foreground))",
                        display: "inline-block", flexShrink: 0,
                      }} />
                    )}
                    {lang === "all" ? t.allLang : lang}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: "12px 14px", borderRadius: "8px",
            background: "hsl(0 69% 52% / 0.08)",
            border: "1px solid hsl(0 69% 52% / 0.2)",
            color: "hsl(0 69% 62%)", fontSize: "12px",
            fontFamily: "var(--font-geist-mono)",
          }}>
            {t.error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredRepos.length === 0 && (
          <div style={{
            padding: "24px", textAlign: "center",
            color: "hsl(var(--muted-foreground))", fontSize: "12px",
            fontFamily: "var(--font-geist-mono)",
          }}>
            <Users size={24} style={{ margin: "0 auto 8px", opacity: 0.3, display: "block" }} />
            {t.empty}
          </div>
        )}

        {/* Repo list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <AnimatePresence mode="popLayout">
            {filteredRepos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  padding: "12px 14px", borderRadius: "10px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--surface))",
                  textDecoration: "none", display: "block",
                  transition: "border-color 0.15s ease, background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.35)";
                  e.currentTarget.style.background = "hsl(var(--surface-2))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--border))";
                  e.currentTarget.style.background = "hsl(var(--surface))";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "hsl(var(--foreground))", margin: 0, fontFamily: "var(--font-geist-mono)" }}>
                    {repo.name}
                  </p>
                  <ExternalLink size={11} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0 }} />
                </div>

                {repo.description && (
                  <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", margin: "0 0 8px", lineHeight: 1.5 }}>
                    {repo.description}
                  </p>
                )}

                {/* Topics */}
                {repo.topics?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                    {repo.topics.slice(0, 4).map((topic) => (
                      <span key={topic} style={{
                        fontSize: "10px", padding: "1px 6px", borderRadius: "99px",
                        background: "hsl(var(--accent) / 0.08)",
                        border: "1px solid hsl(var(--accent) / 0.2)",
                        color: "hsl(var(--accent))",
                        fontFamily: "var(--font-geist-mono)",
                      }}>
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {repo.language && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                      <span style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: LANG_COLORS[repo.language] ?? "hsl(var(--muted-foreground))",
                        display: "inline-block", flexShrink: 0,
                      }} />
                      {repo.language}
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                    <Star size={11} /> {repo.stargazers_count}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                    <GitFork size={11} /> {repo.forks_count}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "10px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono)" }}>
                    {new Date(repo.updated_at).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}