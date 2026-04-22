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
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} min-h-full flex flex-col`}
        style={{ background: "var(--bg-primary)" }}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[var(--text-muted)] text-xs text-center">
              SqueezeRadar — for educational purposes only. Not financial advice.
              Short interest data sourced from FINRA via Yahoo Finance (biweekly, ~2–3 week lag).
            </p>
            <p className="text-[var(--text-muted)] text-xs">
              Data updates hourly · Charts by TradingView
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
