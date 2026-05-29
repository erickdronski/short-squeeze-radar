/**
 * Catalyst gate — the fifth squeeze ingredient.
 *
 * Short float, days-to-cover, a small float, and a tapped borrow are all just
 * stored fuel. Without a catalyst nothing ignites. We can't predict a catalyst,
 * but we CAN detect whether something is happening right now: a fresh news
 * headline. We pull the most recent item from Google News RSS (free) and flag
 * a catalyst as "present" only when it's recent (last ~10 days).
 *
 * This is a signal, not a guarantee — surfaced as a gate, never folded into the
 * fuel score. Server-only.
 */

const NEWS_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

export interface Catalyst {
  headline: string;
  link?: string;
  publisher?: string;
  publishedAt?: string; // ISO
  /** True when the freshest headline is recent enough to be a live catalyst. */
  fresh: boolean;
  ageDays: number | null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'");
}

const CATALYST_FRESH_DAYS = 10;

/**
 * Fetch the freshest news headline for a ticker as a potential catalyst.
 * Returns null when nothing relevant is found.
 */
export async function fetchCatalyst(ticker: string, companyName?: string): Promise<Catalyst | null> {
  try {
    const firstWord = companyName ? companyName.split(/[\s,]/)[0] : "";
    const q = `$${ticker} ${firstWord} stock`.trim();
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { "User-Agent": NEWS_UA },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const firstItem = xml.split("<item>").slice(1)[0]?.split("</item>")[0];
    if (!firstItem) return null;
    const rawTitle = (firstItem.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    if (!rawTitle) return null;
    const link = (firstItem.match(/<link>([\s\S]*?)<\/link>/) || [])[1];
    const source = (firstItem.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1];
    const pub = (firstItem.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1];
    let title = decodeEntities(rawTitle.trim());
    const src = source ? decodeEntities(source.trim()) : "";
    if (src && title.endsWith(` - ${src}`)) title = title.slice(0, -(src.length + 3)).trim();
    if (title.length < 8) return null;

    let publishedAt: string | undefined;
    let ageDays: number | null = null;
    if (pub) {
      const d = new Date(pub);
      if (!isNaN(d.getTime())) {
        publishedAt = d.toISOString();
        ageDays = Math.round((Date.now() - d.getTime()) / 86_400_000);
      }
    }
    const fresh = ageDays != null && ageDays <= CATALYST_FRESH_DAYS;
    return {
      headline: title,
      link: link?.trim(),
      publisher: src || undefined,
      publishedAt,
      fresh,
      ageDays,
    };
  } catch {
    return null;
  }
}
