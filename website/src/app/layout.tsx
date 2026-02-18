import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ASM Cheatsheet - Attack Surface Management Reference",
    template: "%s | ASM Cheatsheet",
  },
  description:
    "Interactive Attack Surface Management reference with tools, commands, workflows, and a structured learning path — all in one place.",
  keywords: [
    "attack surface management",
    "ASM",
    "security",
    "penetration testing",
    "reconnaissance",
    "bug bounty",
    "cybersecurity",
    "infosec",
  ],
  authors: [{ name: "ASM Cheatsheet" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ASM Cheatsheet",
    title: "ASM Cheatsheet - Attack Surface Management Reference",
    description:
      "Interactive Attack Surface Management reference with tools, commands, workflows, and a structured learning path.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASM Cheatsheet",
    description:
      "Interactive Attack Surface Management reference with tools, commands, workflows, and a structured learning path.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
