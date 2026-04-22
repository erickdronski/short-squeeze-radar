/**
 * Technical indicator calculations from raw OHLCV price history.
 * All functions operate on arrays of close prices or full OHLCV objects,
 * oldest → newest (index 0 = oldest bar).
 */

/** Simple Moving Average over the last `period` closes */
export function sma(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/** RSI(14) — Wilder smoothing */
export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  const relevant = changes.slice(-(period * 3)); // use last 3× period for smooth seed

  let avgGain = 0;
  let avgLoss = 0;

  // Seed with simple average over first `period` changes
  const seed = relevant.slice(0, period);
  for (const ch of seed) {
    if (ch > 0) avgGain += ch;
    else avgLoss += Math.abs(ch);
  }
  avgGain /= period;
  avgLoss /= period;

  // Wilder smoothing over remaining changes
  for (const ch of relevant.slice(period)) {
    const gain = ch > 0 ? ch : 0;
    const loss = ch < 0 ? Math.abs(ch) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Relative Volume: current period volume vs. N-day average volume.
 * `volumes` is oldest → newest; last entry is the current period.
 */
export function relativeVolume(volumes: number[], lookback = 20): number | null {
  if (volumes.length < lookback + 1) return null;
  const recent = volumes.slice(-lookback - 1, -1); // exclude current bar
  const avgVol = recent.reduce((a, b) => a + b, 0) / recent.length;
  if (avgVol === 0) return null;
  return volumes[volumes.length - 1] / avgVol;
}

/** Returns { above50, above200, sma50, sma200 } */
export function movingAverageSignals(closes: number[]): {
  above50: boolean;
  above200: boolean;
  sma50: number | null;
  sma200: number | null;
} {
  const last = closes[closes.length - 1];
  const sma50val = sma(closes, 50);
  const sma200val = sma(closes, 200);
  return {
    above50: sma50val !== null ? last > sma50val : false,
    above200: sma200val !== null ? last > sma200val : false,
    sma50: sma50val,
    sma200: sma200val,
  };
}
