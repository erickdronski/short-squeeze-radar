/**
 * Short Squeeze Confidence Scoring Engine
 *
 * Combines 6 freely-available indicators into a 0–100 confidence score.
 * Each indicator is independently scored and then summed.
 *
 * Data sources (all free):
 *   - Short Float % & Days to Cover → Yahoo Finance (FINRA biweekly, ~2 wk lag)
 *   - Float Size                    → Yahoo Finance (quarterly)
 *   - RVOL                          → Calculated from Yahoo Finance price history
 *   - Momentum (RSI + MAs)          → Calculated from Yahoo Finance price history
 *   - Call/Put OI Ratio             → Yahoo Finance options chain
 */

export interface ScoreBreakdown {
  /** Short Interest as % of float (e.g. 0.25 = 25%) */
  shortFloatPct: number | null;
  shortFloatScore: number; // 0–30
  shortFloatMax: 30;

  /** Days to Cover (DTC) — shares short / avg daily volume */
  daysToCover: number | null;
  daysToCoverScore: number; // 0–25
  daysToCoverMax: 25;

  /** Float size in shares */
  floatShares: number | null;
  floatSizeScore: number; // 0–15
  floatSizeMax: 15;

  /** Relative Volume (current / avg) */
  rvol: number | null;
  rvolScore: number; // 0–15
  rvolMax: 15;

  /** Momentum: RSI + price vs moving averages */
  rsi: number | null;
  above50MA: boolean;
  above200MA: boolean;
  momentumScore: number; // 0–10
  momentumMax: 10;

  /** Options call/put open interest ratio */
  callPutRatio: number | null;
  optionsScore: number; // 0–5
  optionsMax: 5;

  /** Final composite score */
  totalScore: number; // 0–100
  label: ScoreLabel;
  color: ScoreColor;
}

export type ScoreLabel =
  | "Negligible"
  | "Low"
  | "Moderate"
  | "High"
  | "Very High"
  | "Extreme";

export type ScoreColor =
  | "gray"
  | "slate"
  | "yellow"
  | "amber"
  | "orange"
  | "red-orange";

export interface ScoringInputs {
  shortFloatPct: number | null; // 0–1+ (e.g. 0.35 = 35%)
  daysToCover: number | null;
  floatShares: number | null;
  rvol: number | null;
  rsi: number | null;
  above50MA: boolean;
  above200MA: boolean;
  callPutRatio: number | null; // calls OI / puts OI
}

function scoreShortFloat(pct: number | null): number {
  if (pct === null) return 0;
  if (pct >= 0.5) return 30;
  if (pct >= 0.35) return 26;
  if (pct >= 0.20) return 20;
  if (pct >= 0.10) return 13;
  if (pct >= 0.05) return 6;
  return 0;
}

function scoreDaysToCover(dtc: number | null): number {
  if (dtc === null) return 0;
  if (dtc >= 20) return 25;
  if (dtc >= 12) return 21;
  if (dtc >= 7)  return 16;
  if (dtc >= 4)  return 10;
  if (dtc >= 2)  return 4;
  return 0;
}

function scoreFloatSize(shares: number | null): number {
  if (shares === null) return 0;
  const millions = shares / 1_000_000;
  if (millions < 1)   return 15;
  if (millions < 5)   return 13;
  if (millions < 20)  return 10;
  if (millions < 100) return 5;
  return 0;
}

function scoreRvol(rvol: number | null): number {
  if (rvol === null) return 0;
  if (rvol >= 10) return 15;
  if (rvol >= 5)  return 12;
  if (rvol >= 2.5) return 8;
  if (rvol >= 1.5) return 4;
  return 0;
}

function scoreMomentum(
  rsiVal: number | null,
  above50: boolean,
  above200: boolean
): number {
  let pts = 0;
  if (rsiVal !== null) {
    if (rsiVal >= 80)      pts += 4;
    else if (rsiVal >= 70) pts += 3;
    else if (rsiVal >= 60) pts += 2;
    else if (rsiVal >= 50) pts += 1;
  }
  if (above50)  pts += 3;
  if (above200) pts += 3;
  return Math.min(pts, 10);
}

function scoreOptions(cpr: number | null): number {
  if (cpr === null) return 0;
  if (cpr >= 3)   return 5;
  if (cpr >= 2)   return 4;
  if (cpr >= 1.5) return 3;
  if (cpr >= 1)   return 1;
  return 0;
}

function getLabel(score: number): ScoreLabel {
  if (score >= 86) return "Extreme";
  if (score >= 71) return "Very High";
  if (score >= 56) return "High";
  if (score >= 41) return "Moderate";
  if (score >= 21) return "Low";
  return "Negligible";
}

function getColor(score: number): ScoreColor {
  if (score >= 86) return "red-orange";
  if (score >= 71) return "orange";
  if (score >= 56) return "amber";
  if (score >= 41) return "yellow";
  if (score >= 21) return "slate";
  return "gray";
}

export function calculateScore(inputs: ScoringInputs): ScoreBreakdown {
  const shortFloatScore = scoreShortFloat(inputs.shortFloatPct);
  const daysToCoverScore = scoreDaysToCover(inputs.daysToCover);
  const floatSizeScore = scoreFloatSize(inputs.floatShares);
  const rvolScore = scoreRvol(inputs.rvol);
  const momentumScore = scoreMomentum(
    inputs.rsi,
    inputs.above50MA,
    inputs.above200MA
  );
  const optionsScore = scoreOptions(inputs.callPutRatio);

  const totalScore =
    shortFloatScore +
    daysToCoverScore +
    floatSizeScore +
    rvolScore +
    momentumScore +
    optionsScore;

  return {
    shortFloatPct: inputs.shortFloatPct,
    shortFloatScore,
    shortFloatMax: 30,
    daysToCover: inputs.daysToCover,
    daysToCoverScore,
    daysToCoverMax: 25,
    floatShares: inputs.floatShares,
    floatSizeScore,
    floatSizeMax: 15,
    rvol: inputs.rvol,
    rvolScore,
    rvolMax: 15,
    rsi: inputs.rsi,
    above50MA: inputs.above50MA,
    above200MA: inputs.above200MA,
    momentumScore,
    momentumMax: 10,
    callPutRatio: inputs.callPutRatio,
    optionsScore,
    optionsMax: 5,
    totalScore,
    label: getLabel(totalScore),
    color: getColor(totalScore),
  };
}

/** CSS color value for a given ScoreColor token */
export const SCORE_COLOR_MAP: Record<ScoreColor, string> = {
  gray: "#4a4540",
  slate: "#6b7a8a",
  yellow: "#c8a840",
  amber: "#d08030",
  orange: "#e07848",
  "red-orange": "#e84830",
};

/** Tailwind bg class for score badges */
export function scoreBgClass(color: ScoreColor): string {
  const map: Record<ScoreColor, string> = {
    gray: "bg-neutral-700/40 text-neutral-400",
    slate: "bg-slate-700/40 text-slate-300",
    yellow: "bg-yellow-900/40 text-yellow-300",
    amber: "bg-amber-900/40 text-amber-300",
    orange: "bg-orange-900/40 text-orange-300",
    "red-orange": "bg-red-900/40 text-red-300",
  };
  return map[color];
}
