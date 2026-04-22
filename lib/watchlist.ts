// Curated watchlist of stocks screened for short squeeze potential.
// Criteria: documented high short-interest (>15 % float), actively traded,
// not delisted or halted. Filtered at runtime by live scoring.

export const WATCHLIST: string[] = [
  // ── Classic meme / retail-driven ──────────────────────────────
  "GME",    // GameStop — perpetual high SI, retail favourite
  "AMC",    // AMC Entertainment — ongoing meme dynamic
  "BBWI",   // Bath & Body Works — elevated short interest

  // ── EV / clean energy / air-taxi ─────────────────────────────
  "LCID",   // Lucid Group — one of the most shorted EV names
  "RIVN",   // Rivian — large float but consistently high SI
  "CHPT",   // ChargePoint — charging infrastructure, high SI
  "PLUG",   // Plug Power — hydrogen, chronically shorted
  "BLNK",   // Blink Charging — small-cap EV infra, high SI
  "ACHR",   // Archer Aviation — air-taxi, small float
  "JOBY",   // Joby Aviation — air-taxi, heavily shorted
  "ASTS",   // AST SpaceMobile — satellite broadband, high SI, small float

  // ── Biotech / pharma (volatile, catalyst-driven) ─────────────
  "SAVA",   // Cassava Sciences — Alzheimer's drug controversy, extreme SI
  "NVAX",   // Novavax — vaccine maker, persistently high short interest
  "OCGN",   // Ocugen — gene therapy, small float, high SI
  "PRLD",   // Prelude Therapeutics — oncology, high SI
  "FULC",   // Fulcrum Therapeutics — rare disease, elevated SI

  // ── Consumer / retail ─────────────────────────────────────────
  "BYND",   // Beyond Meat — plant-based, one of the most shorted names
  "CVNA",   // Carvana — online auto dealer, historically extreme SI
  "W",      // Wayfair — e-commerce furniture, consistently high SI

  // ── Space / aerospace ─────────────────────────────────────────
  "SPCE",   // Virgin Galactic — space tourism, perpetual high SI

  // ── Crypto / fintech adjacent ─────────────────────────────────
  "MSTR",   // MicroStrategy (now Strategy) — BTC proxy, heavy SI
  "MARA",   // Marathon Digital — BTC miner, high SI
  "RIOT",   // Riot Platforms — BTC miner, high SI
  "COIN",   // Coinbase — crypto exchange, elevated SI
  "HOOD",   // Robinhood — retail brokerage, moderate SI
  "AFRM",   // Affirm — BNPL, frequently high SI
  "UPST",   // Upstart — AI lending, high SI after revenue miss

  // ── Small-cap / speculative tech ──────────────────────────────
  "MVIS",   // MicroVision — lidar, small float, chronic short target
  "WKHS",   // Workhorse Group — EV delivery, extreme SI
  "GENI",   // Genius Sports — sports data, elevated SI
  "OPEN",   // Opendoor — iBuyer, high SI
  "SKLZ",   // Skillz — gaming, extreme SI
  "IONQ",   // IonQ — quantum computing, high SI
  "LMND",   // Lemonade — insurtech, high SI
  "SMCI",   // Super Micro Computer — accounting concerns, elevated SI
  "HIMS",   // Hims & Hers — telehealth, rising SI

  // ── Other high-SI speculative ─────────────────────────────────
  "CLOV",   // Clover Health — insurance, historically extreme SI
  "SNDL",   // SNDL (formerly Sundial) — cannabis, small float
  "BARK",   // BarkBox — pet subscription, elevated SI
];

export const MIN_SCORE_THRESHOLD = 20; // Only show stocks scoring above this
export const MAX_DISPLAY = 24;          // Show up to 24 tiles on dashboard
