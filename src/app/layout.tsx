import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const BASE_URL = "https://ekagalang.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── Basic ──
  title: {
    default: "Galang — Fullstack Developer",
    template: "%s | Galang",
  },
  description:
    "Portfolio interaktif Galang, Fullstack Developer spesialis Laravel, Next.js, dan Flutter. Tanya AI assistant untuk info lebih lanjut.",
  keywords: [
    "fullstack developer",
    "laravel developer",
    "nextjs developer",
    "flutter developer",
    "web developer indonesia",
    "jasa pembuatan website",
    "jasa aplikasi mobile",
    "programmer freelance indonesia",
    "portfolio developer",
  ],
  authors: [{ name: "Galang", url: BASE_URL }],
  creator: "Galang",
  publisher: "Galang",

  // ── Canonical ──
  alternates: {
    canonical: BASE_URL,
    languages: {
      "id-ID": BASE_URL,
      "en-US": `${BASE_URL}/en`,
    },
  },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn) ──
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    url: BASE_URL,
    siteName: "Galang Portfolio",
    title: "Galang — Fullstack Developer",
    description:
      "Portfolio interaktif berbasis AI. Tanya apapun tentang Galang — skill, project, jasa, dan cara hire.",
    images: [
      {
        url: "/api/og",   // buat file ini (instruksi di bawah)
        width: 1200,
        height: 630,
        alt: "Galang — Fullstack Developer Portfolio",
      },
    ],
  },

  // ── Twitter / X Card ──
  twitter: {
    card: "summary_large_image",
    title: "Galang — Fullstack Developer",
    description:
      "Portfolio interaktif berbasis AI. Tanya apapun tentang Galang.",
    images: ["/api/og"],
    creator: "@ekagalang",   // ganti dengan Twitter kamu kalau ada
  },

  // ── Icons ──
  icons: {
    icon: [
      { url: "/favicon.ico",  sizes: "any" },
      { url: "/icon-16.png",  type: "image/png", sizes: "16x16" },
      { url: "/icon-32.png",  type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple:   [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  // ── PWA Manifest ──
  manifest: "/manifest.json",

  // ── Robots ──
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  // ── Verification (opsional) ──
  // verification: {
  //   google: "xxxxxxxxxxxx",   // Google Search Console
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const umamiId  = process.env.NEXT_PUBLIC_UMAMI_ID;
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;

  return (
    <html lang="id" className="light" suppressHydrationWarning>
      <head>
        {umamiId && umamiUrl && (
          <script
            defer
            src={`${umamiUrl}/script.js`}
            data-website-id={umamiId}
          />
        )}
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
