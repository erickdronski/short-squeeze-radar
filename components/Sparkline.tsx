/**
 * Sparkline — instant inline-SVG mini chart from a closes array.
 *
 * Replaces the per-tile TradingView iframe embed (which loaded an external
 * script + iframe + remote data fetch per tile — brutal with ~24 tiles).
 * This renders synchronously from data already in stocks.json, so the grid
 * paints immediately with zero network. Server-renderable, no "use client".
 *
 * Coordinates are rounded to 2 decimals so the path string is byte-identical
 * across JS engines (avoids SVG-float hydration mismatches).
 */

interface SparklineProps {
  data: number[];
  height?: number;
  /** Up/down tint is derived from first vs last close unless overridden */
  up?: boolean;
}

export default function Sparkline({ data, height = 110, up }: SparklineProps) {
  const w = 300;
  const h = height;
  const padY = 8;

  if (!data || data.length < 2) {
    return <div style={{ height: h }} aria-hidden />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const rising = up ?? data[data.length - 1] >= data[0];
  const stroke = rising ? "#34d399" : "#f87171"; // emerald-400 / red-400
  const fillTop = rising ? "rgba(52,211,153,0.18)" : "rgba(248,113,113,0.16)";

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const pts = data.map((v, i) => ({
    x: r2((i / (data.length - 1)) * w),
    y: r2(padY + (1 - (v - min) / range) * (h - padY * 2)),
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;
  const gradId = `spark-${rising ? "up" : "dn"}-${Math.round(min)}-${data.length}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      style={{ display: "block" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
