"use client";

import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  ticker: string;
  height?: number;
}

export default function TradingViewChart({
  ticker,
  height = 500,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: ticker,
      interval: "D",
      timezone: "America/New_York",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(24, 21, 18, 0)",
      gridColor: "rgba(61, 54, 48, 0.4)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
      support_host: "https://www.tradingview.com",
    });

    container.innerHTML = "";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = `${height}px`;
    widget.style.width = "100%";
    container.appendChild(widget);
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [ticker, height]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full rounded-xl overflow-hidden border border-[var(--border)]"
      style={{ height }}
    />
  );
}
