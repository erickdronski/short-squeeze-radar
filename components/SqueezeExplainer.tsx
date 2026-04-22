"use client";

import { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  BarChart2,
  Zap,
  Activity,
  Clock,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

const INDICATORS = [
  { icon: TrendingUp,     name: "Short Float %",    weight: "30 pts", description: "% of free float currently sold short. Above 20% is elevated; 35%+ is extreme. The higher this is, the more fuel exists for a forced short-covering rally." },
  { icon: Clock,          name: "Days to Cover",    weight: "25 pts", description: "Shares short ÷ avg daily volume. A high number means shorts are trapped — they can't exit without moving the price violently against themselves." },
  { icon: BarChart2,      name: "Float Size",       weight: "15 pts", description: "Freely tradeable shares. Small floats act as amplifiers — fewer shares means less supply for short sellers to buy back, creating a liquidity vacuum." },
  { icon: Activity,       name: "Rel. Volume",      weight: "15 pts", description: "Current volume ÷ 20-day average. A spike (RVOL >5×) signals a live catalyst — potentially the first shorts covering and triggering the cascade." },
  { icon: Zap,            name: "Momentum",         weight: "10 pts", description: "RSI(14) + price vs. 50/200-day moving averages. Price reclaiming key MAs puts stop-losses directly in the path of the remaining shorts." },
  { icon: AlertTriangle,  name: "Options Flow",     weight: "5 pts",  description: "Call / Put open interest ratio. Heavy call buying forces market makers to buy shares as delta hedges — mechanical fuel layered on top of the short squeeze (a gamma squeeze)." },
];

const HISTORY = [
  { name: "Volkswagen",  year: "2008", gain: "+378%", days: "2 days",    note: "Porsche cornered the float" },
  { name: "GameStop",    year: "2021", gain: "+2,700%", days: "~2 weeks", note: "Reddit vs. hedge funds" },
  { name: "AMC",         year: "2021", gain: "+3,512%", days: "5 months", note: "Multiple retail-driven waves" },
];

export default function SqueezeExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">

        {/* ── Always-visible summary row ── */}
        <div className="px-4 py-3.5 sm:px-5 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--orange)]/15 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--orange)]" />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              A{" "}
              <span className="text-[var(--beige)] font-medium">
                short squeeze
              </span>{" "}
              happens when heavily-shorted stocks surge, forcing short sellers
              to buy back shares to cover losses — a feedback loop producing
              50–500%+ moves in days.
            </p>

            {/* Chip row: scrollable with fade-right affordance */}
            <div className="relative mt-2.5">
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {INDICATORS.map((ind) => {
                  const Icon = ind.icon;
                  return (
                    <span
                      key={ind.name}
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] whitespace-nowrap shrink-0"
                    >
                      <Icon className="w-2.5 h-2.5 text-[var(--orange)]" />
                      {ind.name}
                      <span className="text-[var(--text-muted)]/60">
                        · {ind.weight}
                      </span>
                    </span>
                  );
                })}

                {/* WSB chip */}
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] whitespace-nowrap shrink-0">
                  <MessageSquare className="w-2.5 h-2.5 text-[#FF4500]" />
                  WSB Sentiment
                  <span className="text-[var(--text-muted)]/60">· signal</span>
                </span>

                {/* Spacer so last chip isn't flush against edge */}
                <span className="shrink-0 w-4" aria-hidden />
              </div>
              {/* Right fade — scroll affordance */}
              <div
                className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, transparent, var(--bg-card))",
                }}
              />
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 flex items-center gap-1 text-xs text-[var(--orange)] hover:text-[var(--orange-light)] transition-colors mt-0.5 py-0.5"
            aria-expanded={open}
          >
            <span className="hidden sm:inline">
              {open ? "Less" : "How it works"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* ── Expandable detail ── */}
        {open && (
          <div className="border-t border-[var(--border)] px-4 py-4 sm:px-5 space-y-5">

            {/* Full explanation */}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Short sellers borrow shares, sell them immediately, and must
              eventually buy them back. If the stock rises instead of falls,
              losses compound with no ceiling. When a catalyst appears —
              earnings surprise, viral news, regulatory approval — shorts face
              margin calls and stop-losses all at once. Their forced buying
              drives the price higher, which forces more shorts to cover, which
              drives the price higher still.
            </p>

            {/* Historical examples — horizontal scroll on mobile */}
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Famous examples
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {HISTORY.map((h) => (
                  <div
                    key={h.name}
                    className="shrink-0 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 w-36"
                  >
                    <div className="text-[var(--orange)] font-bold text-base leading-none">
                      {h.gain}
                    </div>
                    <div className="text-[var(--text-primary)] text-xs font-medium mt-1">
                      {h.name} {h.year}
                    </div>
                    <div className="text-[var(--text-secondary)] text-[10px] mt-0.5">
                      {h.days}
                    </div>
                    <div className="text-[var(--text-muted)] text-[10px] mt-1 leading-snug">
                      {h.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicators detail grid */}
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Scoring breakdown (100 pts total)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INDICATORS.map((ind) => {
                  const Icon = ind.icon;
                  return (
                    <div
                      key={ind.name}
                      className="flex gap-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[var(--orange)]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-[var(--orange)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--text-primary)] text-xs font-medium">
                            {ind.name}
                          </span>
                          <span className="text-[8px] font-bold text-[var(--orange)]/70 bg-[var(--orange)]/10 px-1.5 py-0.5 rounded-full">
                            {ind.weight}
                          </span>
                        </div>
                        <p className="text-[var(--text-muted)] text-[10px] leading-relaxed mt-0.5">
                          {ind.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data note */}
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              ⓘ Short Interest % and Days to Cover from FINRA via Yahoo Finance
              (biweekly, ~2–3 week lag). Price, RSI, and MAs from live market
              data. WSB mentions from Reddit&apos;s public API (past 7 days).
              Scores represent structural conditions only — a catalyst is
              required for a squeeze to materialize.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
