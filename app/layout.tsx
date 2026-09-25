import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "./components/sidebar/sidebar";

const haffer = localFont({
  src: "./fonts/Haffer-Medium.otf",
  variable: "--font-haffer",
  weight: "500",
  style: "normal",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: "500",
});

import ClientShell from "./components/ClientShell";

export const metadata: Metadata = {
  title: "Papyrbound — Your graphic library",
  description:
    "A modern desktop library for comics, manga, and illustrated books.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${haffer.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-mono-100 antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
