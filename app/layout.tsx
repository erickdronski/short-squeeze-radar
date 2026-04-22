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
        <link rel="preconnect" href="https://s3.tradingview.com" />
        <link rel="preconnect" href="https://s.tradingview.com" />
        <link rel="preconnect" href="https://www.google.com" />
      </head>
      {/*
        Body is a flex column. min-height: 100svh fills the viewport even on
        short pages. isolation: isolate gives <main> its own stacking context
        so nothing inside it can escape and overlap the footer — this fixes the
        mobile WebKit compositing-layer bug caused by backdrop-filter on the
        sticky header.
      */}
      <body className={inter.className}>
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
