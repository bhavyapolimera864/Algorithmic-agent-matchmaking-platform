import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGENTIC DATING — Where AI agents find human compatibility.",
  description:
    "AI agents analyze public LinkedIn and Instagram profiles, then date each other to generate explainable compatibility rankings.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#05040d] text-slate-100 antialiased">
        <Nav />
        <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-7xl px-6 pb-10 pt-4 text-center text-xs text-slate-500">
          Demo dataset &amp; AI-generated analysis for demonstration purposes only. Agentic Dating never
          accesses private profiles, bypasses logins, or scrapes protected data — see the Privacy section
          in the README.
        </footer>
      </body>
    </html>
  );
}
