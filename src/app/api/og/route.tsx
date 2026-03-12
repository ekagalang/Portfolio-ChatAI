import { label } from "framer-motion/client";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Background grid pattern ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.4,
            display: "flex",
          }}
        />

        {/* ── Accent blur circle kiri bawah ── */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #4ade8033 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* ── Accent blur circle kanan atas ── */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #4ade8022 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* ── Top: Brand + Status ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px #4ade8066",
              }}
            >
              <span style={{ color: "#fff", fontSize: "18px", display: "flex" }}>
                ⌨
              </span>
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#111827",
                letterSpacing: "-0.02em",
              }}
            >
              ekagalang.my.id
            </span>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "99px",
              border: "1px solid #d1fae5",
              background: "#f0fdf4",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#16a34a",
                boxShadow: "0 0 8px #16a34a",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                color: "#16a34a",
                fontWeight: 600,
              }}
            >
              Open to Work
            </span>
          </div>
        </div>

        {/* ── Middle: Main content ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Prefix terminal */}
          <span
            style={{
              fontSize: "16px",
              color: "#16a34a",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            &gt;_ AI Portfolio Assistant
          </span>

          {/* Nama */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: "#111827",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              Eka Galang
            </span>
            <span
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: "#d1d5db",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              /
            </span>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 500,
                color: "#6b7280",
                letterSpacing: "-0.02em",
                alignSelf: "center",
              }}
            >
              Fullstack Developer
            </span>
          </div>

          {/* Tagline */}
          <span
            style={{
              fontSize: "18px",
              color: "#6b7280",
              letterSpacing: "0.02em",
            }}
          >
            Freelance · Jasa Developer Web &amp; Mobile
          </span>
        </div>

        {/* ── Bottom: Tech stack badges ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Stack badges */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Laravel",      color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
              { label: "Next.js",      color: "#111827", bg: "#f9fafb", border: "#e5e7eb" },
              { label: "Vue.js",       color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "React",        color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Node.js",      color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Express.js",   color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Kotlin",       color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
              { label: "Golang",       color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
              { label: "TypeScript",   color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "JavaScript",   color: "#f59e0b", bg: "#fffbeb", border: "#fef3c7" },
              { label: "Python",       color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
              { label: "Tailwind CSS", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Bootstrap",    color: "#712cf9", bg: "#f5f3ff", border: "#ddd6fe" },
              { label: "Nginx",        color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
              { label: "VPS",          color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
              { label: "Docker",       color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
              { label: "MySQL",        color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
              { label: "PostgreSQL",   color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
              { label: "MongoDB",      color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Prisma",       color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
            ].map((tech) => (
              <div
                key={tech.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  background: tech.bg,
                  border: `1px solid ${tech.border}`,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: tech.color,
                }}
              >
                {tech.label}
              </div>
            ))}
          </div>

          {/* Right: CTA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#9ca3af" }}>
              Hubungi saya di:
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                background: "#16a34a",
                boxShadow: "0 0 20px #4ade8044",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                ekagalang.my.id →
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}