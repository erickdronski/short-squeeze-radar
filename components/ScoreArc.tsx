"use client";

import { SCORE_COLOR_MAP, ScoreColor } from "@/lib/scoring";

interface ScoreArcProps {
  score: number;
  color: ScoreColor;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ScoreArc({
  score,
  color,
  size = 80,
  strokeWidth = 7,
  showLabel = true,
}: ScoreArcProps) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc spans 240° (from 150° to 30°, going clockwise)
  const startAngle = 150;
  const endAngle = 30;
  const arcSpan = 240; // degrees

  const polarToCartesian = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const span = end > start ? end - start : 360 - start + end;
    const largeArc = span > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const fillAngle =
    startAngle + (Math.min(score, 100) / 100) * arcSpan;
  const normalizedEnd = fillAngle > 360 ? fillAngle - 360 : fillAngle;

  const trackPath = describeArc(startAngle, endAngle);
  const fillPath = score > 0 ? describeArc(startAngle, normalizedEnd) : null;

  const hexColor = SCORE_COLOR_MAP[color];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="#3d3630"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={hexColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px ${hexColor}80)`,
              transition: "stroke-dashoffset 0.8s ease",
            }}
          />
        )}
      </svg>
      {showLabel && (
        <div className="flex flex-col items-center z-10">
          <span
            className="font-bold leading-none tabular-nums"
            style={{
              color: hexColor,
              fontSize: size * 0.22,
            }}
          >
            {Math.round(score)}
          </span>
          <span
            className="text-[var(--text-secondary)] uppercase tracking-widest leading-none mt-0.5"
            style={{ fontSize: size * 0.1 }}
          >
            / 100
          </span>
        </div>
      )}
    </div>
  );
}
