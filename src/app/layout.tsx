import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ASHFALL REBORN | US 2X Monthly | 8 Man | Vanilla+",
  description: "US monthly Rust 2X Vanilla+ PvP, max 8 per team, balanced quality-of-life features and wipe leaderboard prizes. Connect: 45.144.255.22:28015.",
  icons: {
    icon: "/ashfall-logo.png",
    shortcut: "/ashfall-logo.png",
    apple: "/ashfall-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        {children}
      </body>
    </html>
  );
}
