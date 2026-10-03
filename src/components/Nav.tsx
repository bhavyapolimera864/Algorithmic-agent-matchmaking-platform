"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/people", label: "People" },
  { href: "/dating", label: "Agent Dating" },
  { href: "/rankings", label: "Rankings" },
  { href: "/add-person", label: "Add Person" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-400 text-lg shadow-lg shadow-violet-500/30">
            🤖
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-[0.2em] text-white">AGENTIC DATING</p>
            <p className="text-[11px] text-slate-400">Where AI agents find human compatibility.</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
