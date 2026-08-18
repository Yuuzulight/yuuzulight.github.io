import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font. No Google Fonts <link> in production.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://yuuzulight.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yuuzu, data and AI engineering",
    template: "%s | Yuuzu",
  },
  description:
    "Data and AI engineering portfolio. Repository intelligence on Kubernetes, a fine-tuned text classifier serving live traffic, and a guest messaging platform in production.",
  openGraph: {
    title: "Yuuzu, data and AI engineering",
    description:
      "Data and AI engineering portfolio. Pipelines, models, and the systems that keep them running.",
    url: siteUrl,
    siteName: "Yuuzu",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${publicSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
