/**
 * Weekly stock data refresh script.
 * Run via: npm run fetch-stocks
 * Called by GitHub Actions on a weekly cron schedule.
 *
 * Fetches all watchlist stocks from Yahoo Finance, scores them,
 * and writes the result to public/data/stocks.json which is
 * committed to the repo and deployed by Vercel automatically.
 */

import { fetchAllStocks } from "../lib/stockData";
import { WATCHLIST } from "../lib/watchlist";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

async function main() {
  const start = Date.now();
  console.log(
    `\n[fetch-stocks] Starting refresh for ${WATCHLIST.length} tickers...`
  );

  const stocks = await fetchAllStocks(WATCHLIST);

  const sorted = stocks.sort(
    (a, b) => b.score.totalScore - a.score.totalScore
  );

  const output = {
    stocks: sorted,
    lastUpdated: new Date().toISOString(),
    fetchedCount: sorted.length,
    durationMs: Date.now() - start,
  };

  const outputDir = path.join(process.cwd(), "public", "data");
  mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "stocks.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`[fetch-stocks] ✓ Wrote ${sorted.length} stocks to ${outputPath}`);
  console.log(`[fetch-stocks] Top 5 by score:`);
  sorted.slice(0, 5).forEach((s) => {
    console.log(`  ${s.ticker.padEnd(6)} ${s.score.totalScore.toString().padStart(3)}/100  ${s.score.label}`);
  });
  console.log(`[fetch-stocks] Done in ${((Date.now() - start) / 1000).toFixed(1)}s\n`);
}

main().catch((err) => {
  console.error("[fetch-stocks] Fatal error:", err);
  process.exit(1);
});
