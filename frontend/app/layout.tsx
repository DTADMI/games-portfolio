import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { AppSessionProvider } from "@/contexts/session-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "React Games Portfolio",
  description: "A collection of web game clones and interactive projects.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AppSessionProvider>{children}</AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
