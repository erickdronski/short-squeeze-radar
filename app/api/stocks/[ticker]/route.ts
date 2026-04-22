/**
 * REST API endpoint: GET /api/stocks/:ticker
 * Returns the full scored stock data for a single ticker.
 * Useful for client-side refresh or external consumption.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchStockData } from "@/lib/stockData";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }

  try {
    const data = await fetchStockData(ticker.toUpperCase());

    if (!data) {
      return NextResponse.json(
        { error: `No data found for ticker: ${ticker}` },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    console.error(`[api/stocks/${ticker}] Error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
