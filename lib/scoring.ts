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
  shortFloatScore: number; // 0–25
  shortFloatMax: 25;

  /** Days to Cover (DTC) — shares short / avg daily volume */
  daysToCover: number | null;
  daysToCoverScore: number; // 0–20
  daysToCoverMax: 20;

  /** Float size in shares */
  floatShares: number | null;
  floatSizeScore: number; // 0–15
  floatSizeMax: 15;

  /**
   * Borrow pressure — the real pressure gauge. Cost-to-borrow (CTB) fee +
   * shares-available scarcity, the free proxy for utilization (true
   * utilization % is gated to securities-lending desks). Source: iBorrowDesk
   * / Interactive Brokers feed.
   */
  borrowFeePct: number | null; // annualized CTB fee, percent
  sharesAvailable: number | null; // IBKR shares available to borrow
  borrowScore: number; // 0–22
  borrowMax: 22;

  /** Relative Volume (current / avg) */
  rvol: number | null;
  rvolScore: number; // 0–8
  rvolMax: 8;

  /** Momentum: RSI + price vs moving averages */
  rsi: number | null;
  above50MA: boolean;
  above200MA: boolean;
  momentumScore: number; // 0–6
  momentumMax: 6;

  /** Options call/put open interest ratio */
  callPutRatio: number | null;
  optionsScore: number; // 0–4
  optionsMax: 4;

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
  borrowFeePct: number | null; // CTB fee %, from iBorrowDesk/IBKR (null if unavailable)
  sharesAvailable: number | null; // IBKR shares available to borrow (null if unavailable)
}

// Short interest as % of float — the classic squeeze geometry (0–25).
function scoreShortFloat(pct: number | null): number {
  if (pct === null) return 0;
  if (pct >= 0.5) return 25;
  if (pct >= 0.35) return 21;
  if (pct >= 0.20) return 16;
  if (pct >= 0.10) return 10;
  if (pct >= 0.05) return 5;
  return 0;
}

// Days to cover — how long shorts would take to exit (0–20).
function scoreDaysToCover(dtc: number | null): number {
  if (dtc === null) return 0;
  if (dtc >= 20) return 20;
  if (dtc >= 12) return 17;
  if (dtc >= 7)  return 13;
  if (dtc >= 4)  return 8;
  if (dtc >= 2)  return 3;
  return 0;
}

// Float size — a small float makes covering violent (0–15).
function scoreFloatSize(shares: number | null): number {
  if (shares === null) return 0;
  const millions = shares / 1_000_000;
  if (millions < 1)   return 15;
  if (millions < 5)   return 13;
  if (millions < 20)  return 10;
  if (millions < 100) return 5;
  return 0;
}

// Borrow pressure — cost-to-borrow fee (0–14) + availability scarcity, the free
// proxy for utilization (0–8). The real pressure gauge: when shares are scarce
// and expensive to borrow, supply is tapped and shorts are paying to stay in.
function scoreBorrowFee(feePct: number | null): number {
  if (feePct === null) return 0;
  if (feePct >= 50) return 14;
  if (feePct >= 25) return 12;
  if (feePct >= 10) return 9;
  if (feePct >= 5)  return 6;
  if (feePct >= 2)  return 4;
  if (feePct >= 1)  return 2;
  return 0;
}

function scoreAvailability(available: number | null, floatShares: number | null): number {
  if (available === null) return 0;
  if (floatShares && floatShares > 0) {
    const ratio = available / floatShares; // fraction of float still borrowable
    if (ratio <= 0.001) return 8;
    if (ratio <= 0.005) return 6;
    if (ratio <= 0.02)  return 4;
    if (ratio <= 0.05)  return 2;
    return 0;
  }
  // No float to normalize against — fall back to absolute availability.
  if (available < 100_000) return 8;
  if (available < 300_000) return 6;
  if (available < 1_000_000) return 4;
  if (available < 5_000_000) return 2;
  return 0;
}

function scoreBorrowPressure(
  feePct: number | null,
  available: number | null,
  floatShares: number | null
): number {
  return Math.min(scoreBorrowFee(feePct) + scoreAvailability(available, floatShares), 22);
}

// Relative volume — is it active right now (0–8).
function scoreRvol(rvol: number | null): number {
  if (rvol === null) return 0;
  if (rvol >= 10) return 8;
  if (rvol >= 5)  return 6;
  if (rvol >= 2.5) return 4;
  if (rvol >= 1.5) return 2;
  return 0;
}

// Momentum — RSI + price vs moving averages (0–6).
function scoreMomentum(
  rsiVal: number | null,
  above50: boolean,
  above200: boolean
): number {
  let pts = 0;
  if (rsiVal !== null) {
    if (rsiVal >= 70)      pts += 2;
    else if (rsiVal >= 50) pts += 1;
  }
  if (above50)  pts += 2;
  if (above200) pts += 2;
  return Math.min(pts, 6);
}

// Options call/put OI ratio — bullish option positioning (0–4).
function scoreOptions(cpr: number | null): number {
  if (cpr === null) return 0;
  if (cpr >= 3)   return 4;
  if (cpr >= 2)   return 3;
  if (cpr >= 1.5) return 2;
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
  const borrowScore = scoreBorrowPressure(
    inputs.borrowFeePct,
    inputs.sharesAvailable,
    inputs.floatShares
  );
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
    borrowScore +
    rvolScore +
    momentumScore +
    optionsScore;

  return {
    shortFloatPct: inputs.shortFloatPct,
    shortFloatScore,
    shortFloatMax: 25,
    daysToCover: inputs.daysToCover,
    daysToCoverScore,
    daysToCoverMax: 20,
    floatShares: inputs.floatShares,
    floatSizeScore,
    floatSizeMax: 15,
    borrowFeePct: inputs.borrowFeePct,
    sharesAvailable: inputs.sharesAvailable,
    borrowScore,
    borrowMax: 22,
    rvol: inputs.rvol,
    rvolScore,
    rvolMax: 8,
    rsi: inputs.rsi,
    above50MA: inputs.above50MA,
    above200MA: inputs.above200MA,
    momentumScore,
    momentumMax: 6,
    callPutRatio: inputs.callPutRatio,
    optionsScore,
    optionsMax: 4,
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
