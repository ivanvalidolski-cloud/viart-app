import type { Metadata } from "next";
import { Geist, Geist_Mono, Martian_Mono, Onest } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ViART — студия лазерной эпиляции",
  description: "Лазерная эпиляция и массаж в Москве. Современное оборудование, чистота и аккуратный сервис.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${onest.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
