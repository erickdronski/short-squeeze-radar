import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SqueezeRadar — Short Squeeze Dashboard",
  description:
    "Real-time short squeeze confidence scoring for US equities. Track short interest, days to cover, relative volume, and momentum signals.",
  openGraph: {
    title: "SqueezeRadar",
    description: "Real-time short squeeze confidence dashboard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Speed: preconnect to TradingView CDN so chart iframes load faster */}
        <link rel="preconnect" href="https://s3.tradingview.com" />
        <link rel="preconnect" href="https://s.tradingview.com" />
        <link rel="preconnect" href="https://www.google.com" />
      </head>
      <body className={inter.className}>
        <div className="site-shell">
          <Header />
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[var(--text-muted)] text-xs text-center">
                SqueezeRadar — for educational purposes only. Not financial advice.
                Short interest data from FINRA via Yahoo Finance (biweekly, ~2–3 week lag).
              </p>
              <p className="text-[var(--text-muted)] text-xs whitespace-nowrap">
                Updates weekly · Charts by TradingView
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
