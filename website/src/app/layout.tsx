import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerProvider } from "@/components/layout/sw-provider";

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
  manifest: "/manifest.json",
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--primary-foreground)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <ServiceWorkerProvider />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
