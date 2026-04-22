import {
  TrendingUp,
  AlertTriangle,
  BarChart2,
  Zap,
  Activity,
  Clock,
} from "lucide-react";

const indicators = [
  {
    icon: TrendingUp,
    name: "Short Float %",
    weight: "30 pts",
    description:
      "Percentage of the free float that is sold short. Above 20% is elevated; above 35% is extreme. The higher this is, the more potential fuel exists for a forced short-covering rally.",
  },
  {
    icon: Clock,
    name: "Days to Cover",
    weight: "25 pts",
    description:
      "How many average-volume trading days it would take for all shorts to buy back their positions. A high number means shorts are trapped — they can't exit without moving the price violently against themselves.",
  },
  {
    icon: BarChart2,
    name: "Float Size",
    weight: "15 pts",
    description:
      "Absolute count of freely tradeable shares. Small floats act as amplifiers — fewer shares means less supply for short sellers to buy back, creating a liquidity vacuum that turbocharges any upward move.",
  },
  {
    icon: Activity,
    name: "Relative Volume",
    weight: "15 pts",
    description:
      "Current trading volume divided by the 20-day average. A volume spike (RVOL > 5×) signals that a catalyst is live — potentially the first shorts covering and triggering the cascade.",
  },
  {
    icon: Zap,
    name: "Momentum",
    weight: "10 pts",
    description:
      "RSI(14) measures recent price momentum; price above the 50-day and 200-day moving averages confirms the trend has shifted bullish — the point at which remaining shorts face mounting stop-loss pressure.",
  },
  {
    icon: AlertTriangle,
    name: "Options Flow",
    weight: "5 pts",
    description:
      "Call-to-put open interest ratio. Heavy call buying relative to puts signals bullish conviction and — critically — forces market makers to buy shares as delta hedges, adding mechanical fuel to any squeeze (a gamma squeeze).",
  },
];

export default function SqueezeExplainer() {
  return (
    <section className="mb-12">
      {/* What is a short squeeze */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--orange)]/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[var(--orange)]" />
          </div>
          <div>
            <h2 className="text-[var(--text-primary)] font-semibold text-xl mb-3">
              What is a Short Squeeze?
            </h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
              A <span className="text-[var(--beige)] font-medium">short squeeze</span> is a rapid, self-reinforcing price surge triggered when
              short sellers — investors who bet on a stock falling — are forced to buy back
              shares to cover their losses simultaneously. Because short sellers borrow shares
              and sell them, they eventually must repurchase shares to return them. When the
              price rises instead of falling, those losses compound with no theoretical ceiling.
            </p>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
              The cascade works like this: a catalyst (earnings surprise, viral news, regulatory
              approval) causes the price to rise. Short sellers face margin calls or stop-loss
              triggers and must buy shares to close their positions — but that forced buying
              drives the price even higher, which forces more shorts to cover, which drives the
              price higher still. In extreme cases this feedback loop produces{" "}
              <span className="text-[var(--orange)] font-medium">50–500%+ moves in days</span>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <HistoryCard
                name="Volkswagen 2008"
                gain="+378%"
                days="2 days"
                note="Briefly most valuable company on Earth"
              />
              <HistoryCard
                name="GameStop 2021"
                gain="+2,700%"
                days="~2 weeks"
                note="Reddit's r/WallStreetBets vs. hedge funds"
              />
              <HistoryCard
                name="AMC 2021"
                gain="+3,512%"
                days="5 months"
                note="Multiple squeeze waves over the year"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div>
        <h3 className="text-[var(--text-secondary)] text-xs uppercase tracking-widest mb-4 px-1">
          How we calculate the squeeze confidence score
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {indicators.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.name}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--orange)]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--orange)]" />
                  </div>
                  <span className="text-[var(--text-primary)] text-sm font-medium">
                    {ind.name}
                  </span>
                  <span className="ml-auto text-[10px] font-semibold text-[var(--orange)]/70 bg-[var(--orange)]/10 px-1.5 py-0.5 rounded-full">
                    {ind.weight}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                  {ind.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Data note */}
        <p className="mt-4 text-[10px] text-[var(--text-muted)] leading-relaxed px-1">
          ⓘ Short Interest % and Days to Cover are sourced from FINRA via Yahoo Finance and reflect
          the most recent biweekly reporting cycle (typically 2–3 weeks old). Price, volume, RSI, and
          moving averages are computed from live market data and updated hourly. For real-time short
          data consider ORTEX or Fintel. Scores represent structural conditions only — not investment advice.
          A catalyst is required for a squeeze to materialize.
        </p>
      </div>
    </section>
  );
}

function HistoryCard({
  name,
  gain,
  days,
  note,
}: {
  name: string;
  gain: string;
  days: string;
  note: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3">
      <div className="text-[var(--orange)] font-bold text-lg leading-none">{gain}</div>
      <div className="text-[var(--text-primary)] text-sm font-medium mt-1">{name}</div>
      <div className="text-[var(--text-secondary)] text-xs mt-0.5">{days}</div>
      <div className="text-[var(--text-muted)] text-[10px] mt-1 leading-relaxed">{note}</div>
    </div>
  );
}
