/**
 * GET /api/quotes?symbols=GME,AMC,...
 *
 * Fetches live price + daily change for each ticker using Yahoo Finance's
 * chart API (v8/finance/chart/:symbol) which works without authentication.
 * Requests are fired in parallel with Promise.all — typically 24 symbols
 * resolve in ~300ms on a warm Vercel function.
 *
 * Vercel CDN caches the response for 30 minutes (s-maxage=1800), so Yahoo
 * sees at most one batch of requests per 30-min window per Vercel region.
 */

import { NextRequest, NextResponse } from "next/server";
import type { LiveQuote } from "@/types/quotes";

async function fetchQuote(symbol: string): Promise<[string, LiveQuote | null]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "application/json",
      },
      // Next.js data cache — also revalidates at origin every 30 min
      next: { revalidate: 1800 },
    });

    if (!res.ok) return [symbol, null];

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return [symbol, null];

    const price: number = meta.regularMarketPrice;
    const prev: number = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prev;
    // Express as a whole percentage matching the priceChangePct format in stocks.json
    const changePct = prev !== 0 ? (change / prev) * 100 : 0;

    return [symbol, { price, change, changePct }];
  } catch {
    return [symbol, null];
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbols") ?? "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 50); // safety cap

  if (!symbols.length) {
    return NextResponse.json({});
  }

  // Parallel fetch — all symbols resolve concurrently
  const results = await Promise.all(symbols.map(fetchQuote));

  const data: Record<string, LiveQuote> = {};
  for (const [sym, quote] of results) {
    if (quote) data[sym] = quote;
  }

  return NextResponse.json(data, {
    headers: {
      // CDN caches 30 min; stale-while-revalidate serves instantly while refreshing
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300",
    },
  });
}
