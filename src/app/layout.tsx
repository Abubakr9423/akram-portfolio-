import type { Metadata } from "next";
import { Archivo, Inter, Geist_Mono } from "next/font/google";
import { profile } from "@/content";
import "./globals.css";

const display = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["800", "900"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${profile.fullName} — Portfolio`,
  description: `${profile.role.strong} ${profile.role.soft} portfolio of ${profile.fullName}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
