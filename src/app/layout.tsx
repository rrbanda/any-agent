import type { Metadata } from "next";
import "./globals.css";
import { getBranding } from "@/lib/branding";

const branding = getBranding();

export const metadata: Metadata = {
  title: branding.title,
  description: "Universal Agent UI - Connect to any AI agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
