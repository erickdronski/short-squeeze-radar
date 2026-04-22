import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { fetchStockData, formatNumber, formatBigNumber, formatPct, StockData } from "@/lib/stockData";
import { WATCHLIST } from "@/lib/watchlist";
import ScoreBreakdownCard from "@/components/ScoreBreakdownCard";
import TradingViewChart from "@/components/TradingViewChart";
import { SCORE_COLOR_MAP } from "@/lib/scoring";

export const revalidate = 3600;

export async function generateStaticParams() {
  return WATCHLIST.map((ticker) => ({ ticker: ticker.toLowerCase() }));
}

const getCachedStock = (ticker: string) =>
  unstable_cache(
    () => fetchStockData(ticker.toUpperCase()),
    [`stock-${ticker.toUpperCase()}`],
    { revalidate: 3600 }
  )();

export default async function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const stock = await getCachedStock(ticker);

  if (!stock) {
    notFound();
  }

  const isUp = stock.priceChangePct >= 0;
  const hexColor = SCORE_COLOR_MAP[stock.score.color];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to radar
      </Link>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[var(--text-primary)] text-4xl font-bold">
              {stock.ticker}
            </h1>
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{ background: `${hexColor}20`, color: hexColor }}
            >
              {stock.score.label} · {stock.score.totalScore}/100
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-lg mt-1">
            {stock.companyName}
          </p>
          {(stock.sector || stock.industry) && (
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {[stock.sector, stock.industry].filter(Boolean).join(" · ")}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-[var(--text-primary)] text-3xl font-bold tabular-nums">
              ${formatNumber(stock.price)}
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
              {formatNumber(stock.priceChangePct)}% today
            </span>
          </div>
        </div>

        {/* External links */}
        <div className="flex gap-2 flex-wrap shrink-0">
          <a
            href={`https://finviz.com/quote.ashx?t=${stock.ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--orange)]/40 hover:text-[var(--text-primary)] transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            Finviz
          </a>
          <a
            href={`https://www.marketbeat.com/stocks/NASDAQ/${stock.ticker}/short-interest/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--orange)]/40 hover:text-[var(--text-primary)] transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            Short Interest
          </a>
          <a
            href={`https://finance.yahoo.com/quote/${stock.ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--orange)]/40 hover:text-[var(--text-primary)] transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            Yahoo Finance
          </a>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart (spans 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <TradingViewChart ticker={stock.ticker} height={500} />

          {/* Stats table */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h3 className="text-[var(--text-primary)] font-semibold mb-4 text-sm uppercase tracking-widest">
              Key Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatRow
                label="Short Interest"
                value={formatPct(stock.shortFloatPct)}
                sub="% of float"
                highlight={
                  stock.shortFloatPct !== null && stock.shortFloatPct >= 0.2
                }
              />
              <StatRow
                label="Days to Cover"
                value={
                  stock.daysToCover !== null
                    ? `${stock.daysToCover.toFixed(1)}`
                    : "—"
                }
                sub="days"
                highlight={
                  stock.daysToCover !== null && stock.daysToCover >= 7
                }
              />
              <StatRow
                label="Float"
                value={formatBigNumber(stock.floatShares)}
                sub="shares"
                highlight={
                  stock.floatShares !== null &&
                  stock.floatShares < 20_000_000
                }
              />
              <StatRow
                label="Rel. Volume"
                value={
                  stock.rvol !== null ? `${stock.rvol.toFixed(2)}×` : "—"
                }
                sub="vs 20-day avg"
                highlight={stock.rvol !== null && stock.rvol >= 2.5}
              />
              <StatRow
                label="RSI (14)"
                value={stock.rsi14 !== null ? stock.rsi14.toFixed(1) : "—"}
                sub={
                  stock.rsi14 !== null
                    ? stock.rsi14 >= 70
                      ? "Overbought"
                      : stock.rsi14 <= 30
                      ? "Oversold"
                      : "Neutral"
                    : ""
                }
                highlight={stock.rsi14 !== null && stock.rsi14 >= 70}
              />
              <StatRow
                label="Call/Put Ratio"
                value={
                  stock.callPutRatio !== null
                    ? stock.callPutRatio.toFixed(2)
                    : "—"
                }
                sub="OI ratio"
                highlight={
                  stock.callPutRatio !== null && stock.callPutRatio >= 1.5
                }
              />
              <StatRow
                label="Shares Short"
                value={formatBigNumber(stock.sharesShort)}
                sub="shares"
              />
              <StatRow
                label="Prior Month Short"
                value={formatBigNumber(stock.sharesShortPriorMonth)}
                sub={
                  stock.sharesShort !== null &&
                  stock.sharesShortPriorMonth !== null
                    ? stock.sharesShort > stock.sharesShortPriorMonth
                      ? "▲ increasing"
                      : "▼ decreasing"
                    : "shares"
                }
                highlight={
                  stock.sharesShort !== null &&
                  stock.sharesShortPriorMonth !== null &&
                  stock.sharesShort > stock.sharesShortPriorMonth
                }
              />
              <StatRow
                label="Market Cap"
                value={formatBigNumber(stock.marketCap)}
                sub="USD"
              />
              <StatRow
                label="Volume"
                value={formatBigNumber(stock.volume)}
                sub="today"
              />
              <StatRow
                label="Avg Volume"
                value={formatBigNumber(stock.avgVolume)}
                sub="30-day avg"
              />
              <StatRow
                label="50-day MA"
                value={stock.sma50 !== null ? `$${formatNumber(stock.sma50)}` : "—"}
                sub={stock.above50MA ? "Price above ↑" : "Price below ↓"}
                highlight={stock.above50MA}
              />
              <StatRow
                label="200-day MA"
                value={stock.sma200 !== null ? `$${formatNumber(stock.sma200)}` : "—"}
                sub={stock.above200MA ? "Price above ↑" : "Price below ↓"}
                highlight={stock.above200MA}
              />
            </div>

            <p className="mt-4 text-[10px] text-[var(--text-muted)]">
              ⓘ Short interest data from FINRA via Yahoo Finance (biweekly reporting, ~2–3 week lag).
              Price, volume, and technical indicators computed from live market data.
              Last updated: {new Date(stock.fetchedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Score card */}
        <div className="space-y-6">
          <ScoreBreakdownCard score={stock.score} />

          {/* What to watch */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h3 className="text-[var(--text-primary)] font-semibold mb-3 text-sm">
              What to Watch
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
              <WatchItem
                active={
                  stock.shortFloatPct !== null && stock.shortFloatPct >= 0.2
                }
                text={`Short interest at ${formatPct(stock.shortFloatPct)} of float — ${
                  stock.shortFloatPct !== null && stock.shortFloatPct >= 0.35
                    ? "extreme level"
                    : stock.shortFloatPct !== null && stock.shortFloatPct >= 0.2
                    ? "elevated level"
                    : "moderate level"
                }`}
              />
              <WatchItem
                active={stock.daysToCover !== null && stock.daysToCover >= 7}
                text={`${
                  stock.daysToCover !== null
                    ? stock.daysToCover.toFixed(1)
                    : "—"
                } days to cover — shorts ${
                  stock.daysToCover !== null && stock.daysToCover >= 7
                    ? "are trapped"
                    : "can exit relatively quickly"
                }`}
              />
              <WatchItem
                active={
                  stock.floatShares !== null &&
                  stock.floatShares < 20_000_000
                }
                text={`${formatBigNumber(stock.floatShares)} share float — ${
                  stock.floatShares !== null && stock.floatShares < 5_000_000
                    ? "micro float amplifies any move"
                    : stock.floatShares !== null &&
                      stock.floatShares < 20_000_000
                    ? "low float adds volatility"
                    : "large float dampens squeeze dynamics"
                }`}
              />
              <WatchItem
                active={stock.rvol !== null && stock.rvol >= 2.5}
                text={`Volume ${
                  stock.rvol !== null ? `${stock.rvol.toFixed(1)}×` : ""
                } normal — ${
                  stock.rvol !== null && stock.rvol >= 5
                    ? "major catalyst may be live"
                    : stock.rvol !== null && stock.rvol >= 2.5
                    ? "above-average activity"
                    : "quiet — awaiting catalyst"
                }`}
              />
              <WatchItem
                active={stock.above50MA}
                text={`Price ${stock.above50MA ? "above" : "below"} 50-day MA — ${
                  stock.above50MA
                    ? "momentum shifted bullish, shorts face stop-loss pressure"
                    : "bearish trend intact, shorts less pressured"
                }`}
              />
            </ul>
          </div>

          {/* Squeeze checklist */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h3 className="text-[var(--text-primary)] font-semibold mb-3 text-sm">
              Squeeze Conditions Checklist
            </h3>
            <div className="space-y-2">
              <CheckItem
                label="High Short Interest (>20%)"
                met={stock.shortFloatPct !== null && stock.shortFloatPct >= 0.2}
              />
              <CheckItem
                label="Long Days to Cover (>7)"
                met={stock.daysToCover !== null && stock.daysToCover >= 7}
              />
              <CheckItem
                label="Low Float (<20M shares)"
                met={
                  stock.floatShares !== null &&
                  stock.floatShares < 20_000_000
                }
              />
              <CheckItem
                label="Volume Spike (RVOL >2.5×)"
                met={stock.rvol !== null && stock.rvol >= 2.5}
              />
              <CheckItem
                label="Price above 50-day MA"
                met={stock.above50MA}
              />
              <CheckItem
                label="RSI Building Momentum (>60)"
                met={stock.rsi14 !== null && stock.rsi14 >= 60}
              />
              <CheckItem
                label="Call-Heavy Options Flow"
                met={
                  stock.callPutRatio !== null && stock.callPutRatio >= 1.5
                }
              />
              <CheckItem
                label="Short Interest Increasing"
                met={
                  stock.sharesShort !== null &&
                  stock.sharesShortPriorMonth !== null &&
                  stock.sharesShort > stock.sharesShortPriorMonth
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-10 text-xs text-[var(--text-muted)] leading-relaxed p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
        <strong className="text-[var(--text-secondary)]">Risk disclaimer: </strong>
        Short squeezes are inherently unpredictable and can reverse violently. High confidence
        scores indicate structural conditions only — a catalyst is required to trigger an actual
        squeeze and timing cannot be predicted. Past squeezes (GameStop, AMC, VW) do not guarantee
        future outcomes. This is not financial advice.
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3">
      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">
        {label}
      </div>
      <div
        className={`text-base font-semibold ${
          highlight ? "text-[var(--orange)]" : "text-[var(--text-primary)]"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{sub}</div>
    </div>
  );
}

function WatchItem({ active, text }: { active: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-0.5 w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold ${
          active
            ? "bg-[var(--orange)]/20 text-[var(--orange)]"
            : "bg-[var(--border)] text-[var(--text-muted)]"
        }`}
      >
        {active ? "●" : "○"}
      </span>
      <span
        className={active ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}
      >
        {text}
      </span>
    </li>
  );
}

function CheckItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div
        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
          met
            ? "bg-emerald-900/40 text-emerald-400"
            : "bg-[var(--border)] text-[var(--text-muted)]"
        }`}
      >
        {met ? "✓" : "✗"}
      </div>
      <span
        className={met ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}
      >
        {label}
      </span>
    </div>
  );
}
