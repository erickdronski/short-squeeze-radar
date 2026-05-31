/**
 * Vercel Cron Job endpoint — called weekly to bust the cache
 * and force re-scoring of all watchlist stocks.
 *
 * Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/refresh", "schedule": "0 9 * * 1" }] }
 *
 * This runs every Monday at 9:00 AM UTC.
 * Protected by CRON_SECRET header (set in Vercel env vars).
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  // Fail CLOSED in production. Vercel cron sends `Authorization: Bearer
  // <CRON_SECRET>` automatically, so the legit job still passes. If the secret
  // isn't configured in prod we refuse rather than run unauthenticated — an
  // open endpoint lets anyone force cache invalidation (extra upstream load).
  // In dev (no NODE_ENV=production) an unset secret stays open for convenience.
  if (isProd && !expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Invalidate the dashboard and all stock pages — Next.js re-fetches on next load
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: "Cache invalidated. Data will refresh on next page load.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/refresh] Error:", err);
    return NextResponse.json(
      { error: "Cache invalidation failed" },
      { status: 500 }
    );
  }
}
