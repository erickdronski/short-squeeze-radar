import type { NextConfig } from "next";

/**
 * Security headers. CSP is production-only (in dev it would block the HMR
 * websocket); the rest are always on. Scoped to what the radar loads:
 *  - images: self + data: + any https (finviz + TradingView chart CDNs)
 *  - fonts: self (next/font self-hosts Inter at build time)
 *  - scripts/styles: self + inline (Next hydration)
 *  - connect: self (browser only talks to same-origin /api)
 */
const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Tell both Turbopack and webpack not to bundle yahoo-finance2 —
  // it pulls in @deno/shim-deno which has Node-only deps (fs, dns, child_process).
  // It's a server-only library; Node resolves it at runtime instead.
  serverExternalPackages: ["yahoo-finance2"],
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "charts2.finviz.com",
      },
      {
        protocol: "https",
        hostname: "s3.tradingview.com",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
