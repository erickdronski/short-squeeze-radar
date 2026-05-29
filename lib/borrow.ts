/**
 * Borrow-desk data — the real pressure gauge for a squeeze.
 *
 * The authoritative cost-to-borrow (CTB) and shares-available numbers live on
 * securities-lending desks and are gated (Ortex, S3, Fintel-paid). The one
 * retail-FREE feed is iBorrowDesk, which republishes Interactive Brokers'
 * available-to-borrow + fee feed. We use it as our borrow source and derive a
 * utilization PROXY from it: true utilization (% of lendable shares on loan) is
 * gated, but a high fee + scarce availability is the same signal — supply is
 * tapped and shorts are paying up to stay short.
 *
 * Source: iBorrowDesk (https://iborrowdesk.com) → Interactive Brokers feed.
 * Server-only.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (SqueezeRadar; research)";

export interface BorrowData {
  /** Annualized cost-to-borrow fee, in percent (e.g. 12.66 = 12.66%). */
  feePct: number | null;
  /** Shares available to borrow at IBKR right now. Low = supply tapped. */
  available: number | null;
  /** Rebate rate (negative when hard-to-borrow). */
  rebate: number | null;
  /** Date of the borrow snapshot (iBorrowDesk daily series). */
  asOf: string | null;
}

export type BorrowDifficulty = "easy" | "moderate" | "hard" | "extreme" | "unknown";

/**
 * Fetch the latest borrow snapshot for a ticker from iBorrowDesk (IBKR feed).
 * Returns null on any failure so scoring degrades honestly (no fabricated CTB).
 */
export async function fetchBorrowData(ticker: string): Promise<BorrowData | null> {
  try {
    const res = await fetch(
      `https://iborrowdesk.com/api/ticker/${encodeURIComponent(ticker.toUpperCase())}`,
      {
        headers: { "User-Agent": UA, Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
        // iBorrowDesk updates intraday; an hour of caching is plenty.
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const daily = Array.isArray(data?.daily) ? data.daily : [];
    if (daily.length === 0) return null;
    const last = daily[daily.length - 1];
    const feePct = typeof last?.fee === "number" && isFinite(last.fee) ? last.fee : null;
    const available =
      typeof last?.available === "number" && isFinite(last.available) ? last.available : null;
    if (feePct == null && available == null) return null;
    return {
      feePct,
      available,
      rebate: typeof last?.rebate === "number" ? last.rebate : null,
      asOf: typeof last?.date === "string" ? last.date : null,
    };
  } catch {
    return null;
  }
}

/**
 * Classify borrow difficulty from fee + availability (+ float when known).
 * This is the human-readable read on the utilization proxy.
 */
export function borrowDifficulty(
  feePct: number | null,
  available: number | null,
  floatShares: number | null
): BorrowDifficulty {
  if (feePct == null && available == null) return "unknown";
  const fee = feePct ?? 0;
  // Availability as a fraction of float is the cleanest "supply tapped" read.
  const avail = available;
  const ratio = avail != null && floatShares && floatShares > 0 ? avail / floatShares : null;
  const scarce =
    ratio != null ? ratio <= 0.01 : avail != null ? avail < 300_000 : false;
  const veryScarce =
    ratio != null ? ratio <= 0.003 : avail != null ? avail < 100_000 : false;

  if (fee >= 50 || (fee >= 25 && veryScarce)) return "extreme";
  if (fee >= 10 || (fee >= 5 && scarce) || veryScarce) return "hard";
  if (fee >= 2 || scarce) return "moderate";
  return "easy";
}

/** Hard-to-borrow flag: expensive OR scarce — either is squeeze fuel. */
export function isHardToBorrow(feePct: number | null, available: number | null): boolean {
  if (feePct != null && feePct >= 10) return true;
  if (available != null && available < 500_000) return true;
  return false;
}
