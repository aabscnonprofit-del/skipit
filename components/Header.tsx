"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();
  const isHome = path === "/";
  const isReport = path === "/report";

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 active:scale-95 transition-transform">
          <div className="w-7 h-7 bg-amber-400 rounded-md flex items-center justify-center shrink-0">
            <span className="text-black text-xs font-black font-mono">S!</span>
          </div>

          <span className="font-mono font-black text-white text-base tracking-tight uppercase">
            Skip<span className="text-amber-400">It</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">

          {/* LIVE INDICATOR */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Live
          </div>

          {/* ACTION BUTTON */}
          {isHome ? (
            <Link
              href="/report"
              className="ml-2 bg-amber-400 text-black font-mono text-xs font-black px-3 py-2 rounded-lg uppercase tracking-wider shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              + Report
            </Link>
          ) : (
            <Link
              href="/"
              className="ml-2 border border-zinc-700 text-zinc-400 font-mono text-xs font-semibold px-3 py-2 rounded-lg uppercase tracking-wider active:scale-95 transition-all hover:border-zinc-500 hover:text-white"
            >
              ← Feed
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}