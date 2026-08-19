import type { Metadata } from "next";
import { Martian_Mono, Onest, Playfair_Display } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";

// Body and UI.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

// Metadata, section indices, `.tech-label`.
const martianMono = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin", "cyrillic"],
});

// Display serif for headings. Previously this was the bare `Georgia,
// "Times New Roman", serif` stack, which is not installed on Android and only
// partially on Windows — the same headline rendered in three different faces
// depending on the device. Georgia stays as the fallback.
const playfair = Playfair_Display({
  variable: "--font-display",
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
  // The three chapter headings and the rating counter animate through
  // motion/react, outside the GSAP layer that `useViartMotion` drives.
  // `revealInstantly` only knows `[data-reveal]` and the stylesheet's
  // reduced-motion reset only reaches CSS transitions, so without `MotionConfig`
  // they are the only things on the page that keep moving when the reader has
  // asked for stillness.
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${martianMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
