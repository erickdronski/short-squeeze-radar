import type { NextConfig } from "next";

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
};

export default nextConfig;
