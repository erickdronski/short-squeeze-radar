/**
 * Stock data fetching layer using yahoo-finance2 (v3+).
 * All calls are server-side only. Cache revalidates every hour.
 *
 * yahoo-finance2 v3 requires instantiation: new YahooFinance()
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinanceClass = require("yahoo-finance2").default;

// Singleton instance (module-level, shared across calls in the same worker)
const yf = new YahooFinanceClass({
  suppressNotices: ["yahooSurvey"],
});

import { calculateScore, ScoreBreakdown, ScoringInputs } from "./scoring";
import { rsi, relativeVolume, movingAverageSignals } from "./technicals";

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
  // Score
  score: ScoreBreakdown;
  // Meta
  fetchedAt: string;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [summary, history]: [any, any[]] = await Promise.all([
      yf.quoteSummary(ticker, { modules }, { validateResult: false }),
      yf.historical(
        ticker,
        {
          // Use ISO date string — yf v3 validates period1 strictly
          period1: new Date(Date.now() - 220 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          interval: "1d",
        },
        { validateResult: false }
      ),
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

    // Build closes and volumes arrays for technicals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedHistory = [...history].sort(
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

    // Short data
    const shortFloatPct: number | null =
      stats?.shortPercentOfFloat != null ? stats.shortPercentOfFloat : null;
    const daysToCoverVal: number | null =
      stats?.shortRatio != null ? stats.shortRatio : null;
    const floatSharesVal: number | null =
      stats?.floatShares != null ? stats.floatShares : null;
    const sharesShort: number | null =
      stats?.sharesShort != null ? stats.sharesShort : null;
    const sharesShortPriorMonth: number | null =
      stats?.sharesShortPriorMonth != null ? stats.sharesShortPriorMonth : null;

    // Options
    const callPutRatio = await fetchOptionsCallPutRatio(ticker);

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
