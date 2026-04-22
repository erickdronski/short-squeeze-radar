"use client";

/**
 * LivePrice — drops into the stock detail page hero.
 *
 * Shows the static price immediately (no flash of nothing), then swaps in the
 * live quote once the /api/quotes fetch resolves. A small pulsing dot signals
 * that the price is live. If the fetch fails, static data stays visible.
 */

import { TrendingUp, TrendingDown } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { formatNumber } from "@/lib/stockTypes";

interface LivePriceProps {
  ticker: string;
  staticPrice: number;
  staticChangePct: number;
}

export default function LivePrice({
  ticker,
  staticPrice,
  staticChangePct,
}: LivePriceProps) {
  const { quotes, loading } = useLiveQuotes([ticker]);
  const live = quotes[ticker];

  const price = live?.price ?? staticPrice;
  const changePct = live?.changePct ?? staticChangePct;
  const isUp = changePct >= 0;
  const isLive = !!live;

  return (
    <div className="flex items-baseline gap-3 mt-4 flex-wrap">
      <span className="text-[var(--text-primary)] text-3xl font-bold tabular-nums">
        ${formatNumber(price)}
      </span>

      <span
        className={`text-base font-medium flex items-center gap-1 ${
          isUp ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {isUp ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        {isUp ? "+" : ""}
        {formatNumber(changePct)}% today
      </span>

      {/* Live indicator — shown once we have a live quote */}
      {isLive && (
        <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Live
        </span>
      )}

      {/* Loading shimmer — only while initial fetch is in flight */}
      {loading && !isLive && (
        <span className="text-[10px] text-[var(--text-muted)] animate-pulse">
          updating…
        </span>
      )}
    </div>
  );
}
