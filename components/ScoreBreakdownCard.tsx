import { ScoreBreakdown, SCORE_COLOR_MAP } from "@/lib/scoring";
import ScoreArc from "./ScoreArc";

interface ScoreBreakdownCardProps {
  score: ScoreBreakdown;
}

const indicators = [
  {
    key: "shortFloat" as const,
    label: "Short Float %",
    scoreKey: "shortFloatScore" as const,
    maxKey: "shortFloatMax" as const,
    valueKey: "shortFloatPct" as const,
    format: (v: number | null) =>
      v !== null ? `${(v * 100).toFixed(2)}%` : "—",
    description: "% of free float currently sold short",
  },
  {
    key: "daysToCover" as const,
    label: "Days to Cover",
    scoreKey: "daysToCoverScore" as const,
    maxKey: "daysToCoverMax" as const,
    valueKey: "daysToCover" as const,
    format: (v: number | null) => (v !== null ? `${v.toFixed(1)} days` : "—"),
    description: "Shares short ÷ avg daily volume",
  },
  {
    key: "floatSize" as const,
    label: "Float Size",
    scoreKey: "floatSizeScore" as const,
    maxKey: "floatSizeMax" as const,
    valueKey: "floatShares" as const,
    format: (v: number | null) => {
      if (v === null) return "—";
      if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B shares`;
      if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M shares`;
      return `${(v / 1e3).toFixed(1)}K shares`;
    },
    description: "Freely tradeable shares — smaller = more volatile",
  },
  {
    key: "rvol" as const,
    label: "Relative Volume",
    scoreKey: "rvolScore" as const,
    maxKey: "rvolMax" as const,
    valueKey: "rvol" as const,
    format: (v: number | null) => (v !== null ? `${v.toFixed(2)}×` : "—"),
    description: "Current volume ÷ 20-day average volume",
  },
  {
    key: "momentum" as const,
    label: "Momentum",
    scoreKey: "momentumScore" as const,
    maxKey: "momentumMax" as const,
    valueKey: "rsi" as const,
    format: (v: number | null) => (v !== null ? `RSI ${v.toFixed(1)}` : "—"),
    description: "RSI(14) + price vs. 50/200-day moving averages",
  },
  {
    key: "options" as const,
    label: "Options Flow",
    scoreKey: "optionsScore" as const,
    maxKey: "optionsMax" as const,
    valueKey: "callPutRatio" as const,
    format: (v: number | null) => (v !== null ? `${v.toFixed(2)} C/P` : "—"),
    description: "Call / Put open interest ratio (gamma fuel)",
  },
];

export default function ScoreBreakdownCard({
  score,
}: ScoreBreakdownCardProps) {
  const hexColor = SCORE_COLOR_MAP[score.color];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <div className="flex items-center gap-6 mb-6">
        <ScoreArc score={score.totalScore} color={score.color} size={100} strokeWidth={9} />
        <div>
          <div className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-1">
            Squeeze Confidence
          </div>
          <div
            className="text-3xl font-bold leading-none"
            style={{ color: hexColor }}
          >
            {score.totalScore}
            <span className="text-base font-normal text-[var(--text-secondary)] ml-1">
              / 100
            </span>
          </div>
          <div className="mt-1.5">
            <span
              className="text-sm font-semibold px-2 py-0.5 rounded-lg"
              style={{
                background: `${hexColor}20`,
                color: hexColor,
              }}
            >
              {score.label}
            </span>
          </div>
        </div>
      </div>

      {/* Indicator bars */}
      <div className="space-y-3">
        {indicators.map((ind) => {
          const pts = score[ind.scoreKey] as number;
          const max = score[ind.maxKey] as number;
          const val = score[ind.valueKey];
          const pct = max > 0 ? (pts / max) * 100 : 0;
          const barColor =
            pct >= 80
              ? SCORE_COLOR_MAP["red-orange"]
              : pct >= 60
              ? SCORE_COLOR_MAP["orange"]
              : pct >= 40
              ? SCORE_COLOR_MAP["amber"]
              : pct >= 20
              ? SCORE_COLOR_MAP["yellow"]
              : "#3d3630";

          return (
            <div key={ind.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-primary)] text-sm font-medium">
                    {ind.label}
                  </span>
                  <span className="text-[var(--text-muted)] text-xs">
                    {ind.format(val as number | null)}
                  </span>
                </div>
                <span className="text-[var(--text-secondary)] text-xs tabular-nums">
                  {pts} / {max}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: barColor,
                    boxShadow: pct > 20 ? `0 0 6px ${barColor}80` : undefined,
                  }}
                />
              </div>
              <p className="text-[var(--text-muted)] text-[10px] mt-1">
                {ind.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* MA footnote */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-2">
        <div className="text-xs">
          <span className="text-[var(--text-muted)]">50-day MA: </span>
          <span
            className={
              score.above50MA ? "text-emerald-400" : "text-red-400"
            }
          >
            {score.above50MA ? "Above ↑" : "Below ↓"}
          </span>
        </div>
        <div className="text-xs">
          <span className="text-[var(--text-muted)]">200-day MA: </span>
          <span
            className={
              score.above200MA ? "text-emerald-400" : "text-red-400"
            }
          >
            {score.above200MA ? "Above ↑" : "Below ↓"}
          </span>
        </div>
      </div>
    </div>
  );
}
