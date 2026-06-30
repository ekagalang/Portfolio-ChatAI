import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Prisma: jangan di-bundle, dan paksa engine query ikut ke output standalone
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**"],
  },
  // Halaman order pakai token rahasia di URL — jangan bocorkan via Referer ke situs lain
  async headers() {
    return [
      {
        source: "/order/:id",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
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