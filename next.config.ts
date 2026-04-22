import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
