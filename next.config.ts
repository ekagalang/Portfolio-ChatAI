import type { NextConfig } from "next";
import path from "path";

// Security headers global. CSP dibuat minimal (base-uri/object-src/frame-ancestors)
// agar TIDAK merusak app yang memakai inline style/script + Midtrans. CSP ketat
// berbasis nonce untuk script-src/style-src adalah pekerjaan tersendiri (lihat ANALYSIS.md).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Prisma: jangan di-bundle, dan paksa engine query ikut ke output standalone
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Explicitly set Turbopack root to this project directory.
  // Without this, Turbopack detects the stray package-lock.json in the parent
  // directory and uses that as the workspace root, breaking module resolution.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
      },
    ],
  },
};

export default nextConfig;