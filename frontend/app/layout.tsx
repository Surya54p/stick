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
  title: "stick. - Simpel Ticketing SaaS",
  description: "Buka workspace ticketing mandiri untuk tim support Anda dalam hitungan detik. Kelola tiket, selesaikan keluhan pelanggan, dan tingkatkan efisiensi kerja tim.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-primary-base text-zinc-100 selection:bg-accent-orange/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
