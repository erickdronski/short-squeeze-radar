/**
 * GET /api/quotes?symbols=GME,AMC,...
 *
 * Fetches current market price + change for a batch of tickers by calling
 * Yahoo Finance's public v8 quote endpoint directly with fetch(). No Node.js
 * built-ins required — works on any runtime (Node, Edge, Deno).
 *
 * Vercel CDN caches the response for 30 minutes (s-maxage=1800), so Yahoo's
 * servers see at most one request per 30-min window across all visitors.
 *
 * Used by client components to overlay live prices over the static weekly data.
 */

import { NextRequest, NextResponse } from "next/server";
import type { LiveQuote } from "@/types/quotes";

// Yahoo Finance public quote endpoint — no API key required, works server-side
const YF_QUOTE_URL = "https://query1.finance.yahoo.com/v8/finance/quote";
const FIELDS = "regularMarketPrice,regularMarketChange,regularMarketChangePercent";

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

  try {
    const url = `${YF_QUOTE_URL}?symbols=${symbols.join(",")}&fields=${FIELDS}&corsDomain=finance.yahoo.com`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SqueezeRadar/1.0)",
        Accept: "application/json",
      },
      // Next.js fetch cache — 30 min revalidation at the origin too
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.error(`[/api/quotes] Yahoo returned ${res.status}`);
      return NextResponse.json({});
    }

    const json = await res.json();
    const quotes: unknown[] = json?.quoteResponse?.result ?? [];

    const data: Record<string, LiveQuote> = {};
    for (const q of quotes) {
      const quote = q as Record<string, unknown>;
      if (!quote?.symbol || quote.regularMarketPrice == null) continue;
      data[quote.symbol as string] = {
        price: quote.regularMarketPrice as number,
        change: (quote.regularMarketChange as number) ?? 0,
        // Yahoo returns regularMarketChangePercent as a whole number (e.g. 2.3 for +2.3%)
        // which matches the priceChangePct format already stored in stocks.json.
        changePct: (quote.regularMarketChangePercent as number) ?? 0,
      };
    }

    return NextResponse.json(data, {
      headers: {
        // CDN caches for 30 min; stale responses served for up to 5 extra min while revalidating
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[/api/quotes] fetch error:", err);
    // Return empty object — clients silently fall back to static prices
    return NextResponse.json({});
  }
}
