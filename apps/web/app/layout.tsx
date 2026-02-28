import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "startupShop",
  description: "Startup listings marketplace MVP",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${spaceGrotesk.variable} antialiased`}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              startupShop
            </Link>
            <p className="text-sm text-secondary">MVP marketplace for startup acquisitions</p>
          </div>
        </header>
        <div className="pt-24 pb-12">{children}</div>
      </body>
    </html>
  );
}
