import { StockData } from "@/lib/stockData";
import { loadAllStocks } from "@/lib/staticData";
import { MIN_SCORE_THRESHOLD, MAX_DISPLAY } from "@/lib/watchlist";
import SqueezeExplainer from "@/components/SqueezeExplainer";
import StockTile from "@/components/StockTile";
import { Activity, RefreshCw } from "lucide-react";

// Static page — data comes from public/data/stocks.json, refreshed by GitHub Actions weekly.
// No API calls at runtime; Vercel redeploys automatically when the JSON file changes.
export const dynamic = "force-static";

export default function HomePage() {
  const { stocks: allStocks, lastUpdated } = loadAllStocks();

  const stocks = allStocks
    .filter((s) => s.score.totalScore >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score.totalScore - a.score.totalScore)
    .slice(0, MAX_DISPLAY);

  const fetchedAt = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : null;

  const extreme = stocks.filter((s) => s.score.totalScore >= 71);
  const high = stocks.filter(
    (s) => s.score.totalScore >= 41 && s.score.totalScore < 71
  );
  const moderate = stocks.filter((s) => s.score.totalScore < 41);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Page hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[var(--orange)] animate-pulse" />
          <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest">
            Live Watchlist
          </span>
          {fetchedAt && (
            <span className="ml-auto flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <RefreshCw className="w-3 h-3" />
              {fetchedAt}
            </span>
          )}
        </div>
        <h1 className="text-[var(--text-primary)] text-3xl sm:text-4xl font-bold leading-tight">
          Short Squeeze{" "}
          <span style={{ color: "var(--orange)" }}>Radar</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-base mt-2 max-w-2xl leading-relaxed">
          Tracking {stocks.length} stocks with elevated short squeeze conditions,
          scored across 6 quantitative indicators. Data refreshes weekly.
        </p>
      </div>

      {/* Explainer + methodology */}
      <SqueezeExplainer />

      {/* Stocks */}
      {stocks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          {extreme.length > 0 && (
            <StockGroup
              label="🔥 High Confidence"
              sublabel="Multiple extreme indicators aligned"
              stocks={extreme}
              accent="var(--orange)"
            />
          )}
          {high.length > 0 && (
            <StockGroup
              label="⚡ Elevated Conditions"
              sublabel="Notable squeeze setup building"
              stocks={high}
              accent="#c8a840"
            />
          )}
          {moderate.length > 0 && (
            <StockGroup
              label="👀 On Watch"
              sublabel="Conditions developing — worth monitoring"
              stocks={moderate}
              accent="#6b7a8a"
            />
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-14 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-xs text-[var(--text-muted)] leading-relaxed">
        <span className="text-[var(--text-secondary)] font-medium">Disclaimer: </span>
        SqueezeRadar is a data analysis and education tool only. Nothing here constitutes
        financial advice or a recommendation to buy or sell any security. Short interest
        data from FINRA reporting carries a 2–3 week lag. Scores reflect structural
        conditions only — a catalyst is required for a squeeze to develop. Always do
        your own research.
      </div>
    </div>
  );
}

function StockGroup({
  label,
  sublabel,
  stocks,
  accent,
}: {
  label: string;
  sublabel: string;
  stocks: StockData[];
  accent: string;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-base font-semibold" style={{ color: accent }}>
          {label}
        </h2>
        <span className="text-[var(--text-muted)] text-xs">{sublabel}</span>
        <span
          className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${accent}20`, color: accent }}
        >
          {stocks.length} stock{stocks.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stocks.map((stock) => (
          <StockTile key={stock.ticker} stock={stock} />
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
      <Activity className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
      <p className="text-[var(--text-secondary)] font-medium mb-1">
        No stocks above threshold
      </p>
      <p className="text-[var(--text-muted)] text-sm">
        All watchlist stocks are below the minimum confidence score.
        Data refreshes every Monday morning.
      </p>
    </div>
  );
}
