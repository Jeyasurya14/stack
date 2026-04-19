import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://polystack.dev"),
  title: {
    default: "Polystack — Polyglot Stack Builder",
    template: "%s · Polystack",
  },
  description:
    "Pick your language (Java, Python, JS, TS, PHP), framework, database. Copy one command. Scaffold instantly.",
  openGraph: {
    title: "Polystack — Polyglot Stack Builder",
    description:
      "Pick your language, framework, database. Copy one command. Scaffold instantly.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polystack — Polyglot Stack Builder",
    description: "Pick your stack. Copy one command. Done.",
  },
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
