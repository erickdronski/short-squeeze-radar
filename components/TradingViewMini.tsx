"use client";

import { useEffect, useRef } from "react";

interface TradingViewMiniProps {
  ticker: string;
  height?: number;
}

declare global {
  interface Window {
    TradingView: {
      MiniWidget: new (config: Record<string, unknown>) => void;
    };
  }
}

export default function TradingViewMini({ ticker, height = 130 }: TradingViewMiniProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = `tv_mini_${ticker}_${Math.random().toString(36).slice(2, 7)}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: ticker,
      width: "100%",
      height: height,
      locale: "en",
      dateRange: "3M",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
      chartOnly: true,
      noTimeScale: true,
    });

    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";
    container.appendChild(wrapper);
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [ticker, height]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full overflow-hidden"
      style={{ height }}
    />
  );
}
