"use client";

/**
 * Client-side hook for fetching live stock quotes from /api/quotes.
 *
 * - Batches all requested symbols into a single API call.
 * - Caches results in module memory for 30 minutes per unique symbol set.
 * - Silently falls back (returns empty map) on any error so static prices show instead.
 */

import { useEffect, useState } from "react";
import type { LiveQuote } from "@/types/quotes";

export type { LiveQuote };
export type QuoteMap = Record<string, LiveQuote>;

// Module-level cache — survives across re-renders, cleared on page reload
interface CacheEntry {
  data: QuoteMap;
  expiresAt: number;
}
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, CacheEntry>();

function cacheKey(symbols: string[]) {
  return [...symbols].sort().join(",");
}

export function useLiveQuotes(symbols: string[]): {
  quotes: QuoteMap;
  loading: boolean;
} {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbols.length) {
      setLoading(false);
      return;
    }

    const key = cacheKey(symbols);
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      setQuotes(cached.data);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/quotes?symbols=${symbols.join(",")}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: QuoteMap) => {
        if (cancelled) return;
        cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
        setQuotes(data);
      })
      .catch(() => {
        // Silently swallow — static prices remain visible
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // symbols array identity changes each render, so join as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

  return { quotes, loading };
}
