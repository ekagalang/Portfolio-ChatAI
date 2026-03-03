import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your Name — Fullstack Developer",
  description: "Portfolio interaktif. Tanya AI asisten saya tentang project, skill, dan jasa yang saya tawarkan.",
  openGraph: {
    title: "Your Name — Fullstack Developer",
    description: "Portfolio interaktif dengan AI asisten.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="scanlines">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}