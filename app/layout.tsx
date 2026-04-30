import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

export const metadata: Metadata = {
  title: "MEDORA",
  description: "AI Pediatric Fracture Detection Platform",
  manifest: "/manifest.json",
  themeColor: "#7C6EE6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MEDORA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="MEDORA" />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="flex min-h-screen flex-col bg-gradient-to-br from-[#F8F7FF] via-white to-[#F1EEFF] antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
