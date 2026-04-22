/**
 * Stock data fetching layer using yahoo-finance2 (v3+).
 * All calls are server-side only. Cache revalidates every hour.
 *
 * yahoo-finance2 v3 requires instantiation: new YahooFinance()
 *
 * NOTE: Do NOT import this file from "use client" components — it pulls in
 * yahoo-finance2 which has Node-only dependencies. Import types and formatters
 * from lib/stockTypes.ts instead (zero server deps, safe everywhere).
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinanceClass = require("yahoo-finance2").default;

// Singleton instance — suppress console noise, use chart() instead of deprecated historical()
const yf = new YahooFinanceClass({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

import { calculateScore, ScoreBreakdown, ScoringInputs } from "./scoring";
import { rsi, relativeVolume, movingAverageSignals } from "./technicals";
import { StockData } from "./stockTypes";

// Re-export pure types and formatters from stockTypes so server-side imports
// that already use "from @/lib/stockData" continue to work unchanged.
export type { StockData } from "./stockTypes";
export { formatNumber, formatBigNumber, formatPct } from "./stockTypes";

/**
 * Yahoo Finance v3 sometimes returns numeric share-count fields as Date objects
 * (the raw API value is a Unix-epoch number and the library mis-types it).
 * This helper accepts only genuine finite numbers and rejects everything else.
 */
function safeNum(val: unknown): number | null {
  if (val == null) return null;
  if (val instanceof Date) return null;        // Date object mis-cast
  if (typeof val === "string") {
    // ISO date string stored in JSON — also invalid for a share count
    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return null;
    const n = Number(val);
    return isFinite(n) ? n : null;
  }
  if (typeof val === "number") return isFinite(val) ? val : null;
  return null;
}

// StockData interface lives in stockTypes.ts — imported and re-exported above.
// Use `import type { StockData } from "@/lib/stockData"` or "@/lib/stockTypes" — both work.

/**
 * Fetch recent r/WallStreetBets post count mentioning a ticker.
 * Free Reddit API — no key required, just a User-Agent header.
 * Returns { mentions, score } where score: 0=none, 1=light, 2=moderate, 3=high
 */
async function fetchWSBMentions(ticker: string): Promise<{ mentions: number; score: number }> {
  try {
    const url = `https://www.reddit.com/r/wallstreetbets/search.json?q=${encodeURIComponent(ticker)}&sort=new&restrict_sr=1&t=week&limit=25`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SqueezeRadar/1.0 (educational project)" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { mentions: 0, score: 0 };
    const data = await res.json();
    const mentions: number = data?.data?.children?.length ?? 0;
    const score = mentions >= 10 ? 3 : mentions >= 5 ? 2 : mentions >= 1 ? 1 : 0;
    return { mentions, score };
  } catch {
    return { mentions: 0, score: 0 };
  }
}

async function fetchOptionsCallPutRatio(ticker: string): Promise<number | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: any = await yf.options(ticker, {}, { validateResult: false });
    if (!chain?.options || chain.options.length === 0) return null;
    const nearest = chain.options[0];
    let totalCallOI = 0;
    let totalPutOI = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const c of (nearest.calls ?? []) as any[]) {
      totalCallOI += c.openInterest ?? 0;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const p of (nearest.puts ?? []) as any[]) {
      totalPutOI += p.openInterest ?? 0;
    }
    if (totalPutOI === 0) return totalCallOI > 0 ? 5 : null;
    return totalCallOI / totalPutOI;
  } catch {
    return null;
  }
}

export async function fetchStockData(ticker: string): Promise<StockData | null> {
  try {
    const modules = ["price", "defaultKeyStatistics", "summaryDetail", "assetProfile"];

    const period1 = new Date(Date.now() - 220 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const period2 = new Date().toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [summary, chartData]: [any, any] = await Promise.all([
      yf.quoteSummary(ticker, { modules }, { validateResult: false }),
      yf.chart(ticker, { period1, period2, interval: "1d" }, { validateResult: false }),
    ]);

    const price = summary.price;
    const stats = summary.defaultKeyStatistics;
    const detail = summary.summaryDetail;
    const profile = summary.assetProfile;

    if (!price) return null;

    const currentPrice: number = price.regularMarketPrice ?? 0;
    const priceChange: number = price.regularMarketChange ?? 0;
    const priceChangePct: number = (price.regularMarketChangePercent ?? 0) * 100;
    const volume: number = price.regularMarketVolume ?? 0;
    const avgVolume: number =
      detail?.averageVolume ?? detail?.averageVolume10days ?? 0;

    // Build closes and volumes arrays for technicals (chart() returns .quotes array)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawQuotes: any[] = chartData?.quotes ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedHistory = [...rawQuotes].sort(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const closes: number[] = sortedHistory.map((d: any) => d.close ?? 0).filter((c: number) => c > 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const volumes: number[] = sortedHistory.map((d: any) => d.volume ?? 0);

    // Append today's intraday price
    closes.push(currentPrice);
    volumes.push(volume);

    const rsi14 = rsi(closes);
    const rvolVal = relativeVolume(volumes, 20);
    const maSignals = movingAverageSignals(closes);

    // Short data — use safeNum() to reject Date objects that yahoo-finance2 sometimes returns
    const shortFloatPct: number | null = safeNum(stats?.shortPercentOfFloat);
    const daysToCoverVal: number | null = safeNum(stats?.shortRatio);
    const floatSharesVal: number | null = safeNum(stats?.floatShares);
    const sharesShort: number | null = safeNum(stats?.sharesShort);
    const sharesShortPriorMonth: number | null = safeNum(stats?.sharesShortPriorMonth);

    // Options + social — fetch in parallel
    const [callPutRatio, wsb] = await Promise.all([
      fetchOptionsCallPutRatio(ticker),
      fetchWSBMentions(ticker),
    ]);

    const inputs: ScoringInputs = {
      shortFloatPct,
      daysToCover: daysToCoverVal,
      floatShares: floatSharesVal,
      rvol: rvolVal,
      rsi: rsi14,
      above50MA: maSignals.above50,
      above200MA: maSignals.above200,
      callPutRatio,
    };

    const scoreResult = calculateScore(inputs);

    return {
      ticker: ticker.toUpperCase(),
      companyName: price.longName ?? price.shortName ?? ticker,
      price: currentPrice,
      priceChange,
      priceChangePct,
      volume,
      avgVolume,
      marketCap: price.marketCap ?? null,
      sector: profile?.sector ?? null,
      industry: profile?.industry ?? null,
      sharesShort,
      sharesShortPriorMonth,
      shortFloatPct,
      daysToCover: daysToCoverVal,
      floatShares: floatSharesVal,
      sharesOutstanding: stats?.sharesOutstanding ?? null,
      rsi14,
      rvol: rvolVal,
      sma50: maSignals.sma50,
      sma200: maSignals.sma200,
      above50MA: maSignals.above50,
      above200MA: maSignals.above200,
      callPutRatio,
      wsbMentions: wsb.mentions,
      wsbScore: wsb.score,
      score: scoreResult,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[stockData] Failed to fetch ${ticker}:`, err);
    return null;
  }
}

export async function fetchAllStocks(tickers: string[]): Promise<StockData[]> {
  const results: StockData[] = [];
  const batchSize = 5;

  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map((t) => fetchStockData(t))
    );
    for (const res of settled) {
      if (res.status === "fulfilled" && res.value !== null) {
        results.push(res.value);
      }
    }
    if (i + batchSize < tickers.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return results;
}

// formatNumber, formatBigNumber, formatPct — re-exported from stockTypes.ts above.
