import Link from "next/link";
import { Activity } from "lucide-react";
import DataSourceLogo from "./DataSourceLogo";

// Google's favicon service reliably returns the correct brand icon for any domain.
// All URLs confirmed returning valid PNGs (not error placeholders).
const GFAV = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

// Data sources actually used in this app
const DATA_SOURCES = [
  {
    name: "Yahoo Finance",
    description: "Price, volume, short interest %, options chain",
    href: "https://finance.yahoo.com",
    favicon: GFAV("finance.yahoo.com"),
    initials: "YF",
    color: "#6001D2",
  },
  {
    name: "FINRA",
    description: "Official biweekly short interest reports",
    href: "https://finra.org/finra-data/browse-catalog/equity-short-interest",
    favicon: GFAV("finra.org"),
    initials: "FN",
    color: "#003087",
  },
  {
    name: "TradingView",
    description: "Interactive price charts & technical indicators",
    href: "https://www.tradingview.com",
    favicon: GFAV("tradingview.com"),
    initials: "TV",
    color: "#2962FF",
  },
  {
    name: "Reddit (r/WallStreetBets)",
    description: "Social sentiment — WSB post mentions (past 7 days)",
    href: "https://www.reddit.com/r/wallstreetbets",
    favicon: GFAV("reddit.com"),
    initials: "RD",
    color: "#FF4500",
  },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
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

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Live pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updates weekly</span>
          </div>

          {/* Data source logos */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[10px] text-[var(--text-muted)] mr-1.5 uppercase tracking-widest">
              Data
            </span>
            {DATA_SOURCES.map((src) => (
              <DataSourceLogo key={src.name} {...src} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
