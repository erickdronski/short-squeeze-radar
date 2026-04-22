"use client";

/**
 * StockGrid — client component that wraps the dashboard tile grid.
 *
 * Fetches live quotes for all displayed tickers in a single /api/quotes call,
 * then passes the live price + change% down to each StockTile. Static data
 * renders immediately (no layout shift); prices swap in once the fetch resolves.
 */

import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import StockTile from "./StockTile";
import type { StockData } from "@/lib/stockData";

interface StockGridProps {
  stocks: StockData[];
}

export default function StockGrid({ stocks }: StockGridProps) {
  const symbols = stocks.map((s) => s.ticker);
  const { quotes } = useLiveQuotes(symbols);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {stocks.map((stock) => {
        const live = quotes[stock.ticker];
        return (
          <StockTile
            key={stock.ticker}
            stock={stock}
            livePrice={live?.price}
            liveChangePct={live?.changePct}
          />
        );
      })}
    </div>
  );
}
