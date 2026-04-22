import Link from "next/link";
import { Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--orange)]/15 border border-[var(--orange)]/30 flex items-center justify-center group-hover:bg-[var(--orange)]/25 transition-colors">
            <Activity className="w-4 h-4 text-[var(--orange)]" />
          </div>
          <div className="leading-none">
            <span className="text-[var(--text-primary)] font-semibold text-sm tracking-wide">
              Squeeze
            </span>
            <span className="text-[var(--orange)] font-semibold text-sm tracking-wide">
              Radar
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live · Updates hourly</span>
          </div>
          <a
            href="https://finra.org/finra-data/browse-catalog/equity-short-interest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors hidden sm:block"
          >
            Data: FINRA + Yahoo Finance
          </a>
        </div>
      </div>
    </header>
  );
}
