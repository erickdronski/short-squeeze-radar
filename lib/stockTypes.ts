/**
 * Pure client-safe types and formatting utilities.
 * No server-only imports (no yahoo-finance2, no fs, no Node built-ins).
 * Safe to import from both client components ("use client") and server code.
 */

import type { ScoreBreakdown } from "./scoring";

export interface StockData {
  ticker: string;
  companyName: string;
  price: number;
  priceChange: number;
  priceChangePct: number;
  volume: number;
  avgVolume: number;
  marketCap: number | null;
  sector: string | null;
  industry: string | null;
  // Short data (biweekly FINRA, ~2 wk lag via Yahoo)
  sharesShort: number | null;
  sharesShortPriorMonth: number | null;
  shortFloatPct: number | null;
  daysToCover: number | null;
  floatShares: number | null;
  sharesOutstanding: number | null;
  // Calculated technicals
  rsi14: number | null;
  rvol: number | null;
  sma50: number | null;
  sma200: number | null;
  above50MA: boolean;
  above200MA: boolean;
  // Options
  callPutRatio: number | null;
  // Social sentiment (r/WallStreetBets, free Reddit API)
  wsbMentions: number;
  wsbScore: number;
  // Score
  score: ScoreBreakdown;
  // Meta
  fetchedAt: string;
}

export function formatNumber(n: number | null, decimals = 2): string {
  if (n === null) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatBigNumber(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

export function formatPct(n: number | null, alreadyPct = false): string {
  if (n === null) return "—";
  const val = alreadyPct ? n : n * 100;
  return `${val.toFixed(2)}%`;
}
