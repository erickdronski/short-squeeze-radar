import Link from "next/link";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { StockData, formatNumber, formatBigNumber } from "@/lib/stockData";
import { scoreBgClass, SCORE_COLOR_MAP } from "@/lib/scoring";
import ScoreArc from "./ScoreArc";
import TradingViewMini from "./TradingViewMini";

interface StockTileProps {
  stock: StockData;
  /** Live price from /api/quotes — overrides static value when available */
  livePrice?: number;
  /** Live change % as decimal (e.g. 0.023 = +2.3%) — overrides static value */
  liveChangePct?: number;
}

export default function StockTile({ stock, livePrice, liveChangePct }: StockTileProps) {
  const { score } = stock;
  const price = livePrice ?? stock.price;
  const changePct = liveChangePct ?? stock.priceChangePct;
  const isUp = changePct >= 0;
  const hexColor = SCORE_COLOR_MAP[score.color];

  return (
    <Link
      href={`/stock/${stock.ticker}`}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--orange)]/40 transition-all duration-300 overflow-hidden"
      style={{
        boxShadow: score.totalScore >= 56
          ? `0 0 0 1px ${hexColor}20, 0 4px 24px ${hexColor}10`
          : undefined,
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] text-lg tracking-wide">
              {stock.ticker}
            </span>
            {score.totalScore >= 71 && (
              <span className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-[var(--orange)]/15 text-[var(--orange)]">
                <Activity className="w-3 h-3" />
                <span>Hot</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5 max-w-[160px]">
            {stock.companyName}
          </p>
        </div>
        <ScoreArc score={score.totalScore} color={score.color} size={64} strokeWidth={6} />
      </div>

      {/* Mini chart */}
      <div className="px-1 -mt-1">
        <TradingViewMini ticker={stock.ticker} height={110} />
      </div>

      {/* Price row */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[var(--text-primary)] font-semibold text-base">
            ${formatNumber(price)}
          </span>
          <span
            className={`ml-2 text-sm font-medium ${
              isUp ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isUp ? <TrendingUp className="inline w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="inline w-3.5 h-3.5 mr-0.5" />}
            {isUp ? "+" : ""}
            {formatNumber(changePct)}%
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-lg ${scoreBgClass(score.color)}`}
        >
          {score.label}
        </span>
      </div>

      {/* Stats grid */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-[var(--border)]">
        <StatCell
          label="Short Float"
          value={
            stock.shortFloatPct !== null
              ? `${(stock.shortFloatPct * 100).toFixed(1)}%`
              : "—"
          }
          highlight={
            stock.shortFloatPct !== null && stock.shortFloatPct >= 0.2
          }
        />
        <StatCell
          label="Days to Cover"
          value={
            stock.daysToCover !== null
              ? `${stock.daysToCover.toFixed(1)}d`
              : "—"
          }
          highlight={stock.daysToCover !== null && stock.daysToCover >= 7}
        />
        <StatCell
          label="Float"
          value={formatBigNumber(stock.floatShares)}
          highlight={
            stock.floatShares !== null && stock.floatShares < 20_000_000
          }
        />
      </div>

      {/* Footer hover cue */}
      <div className="px-4 pb-3 text-xs text-[var(--text-muted)] group-hover:text-[var(--orange)] transition-colors flex items-center gap-1">
        <span>View full analysis</span>
        <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
      </div>
    </Link>
  );
}

function StatCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight: boolean;
}) {
  return (
    <div className="bg-[var(--bg-secondary)] px-2 py-2 text-center">
      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-0.5">
        {label}
      </div>
      <div
        className={`text-xs font-semibold ${
          highlight ? "text-[var(--orange)]" : "text-[var(--text-secondary)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
