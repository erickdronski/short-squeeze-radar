// Curated watchlist of stocks commonly screened for short squeeze potential.
// This list is reviewed weekly and filtered by live scoring — only those
// scoring above the threshold will appear on the dashboard.

export const WATCHLIST: string[] = [
  // Classic meme / high-SI retail favorites
  "GME",
  "AMC",
  "BBWI",
  // EV / clean energy — historically heavy short interest
  "LCID",
  "RIVN",
  "CHPT",
  "PLUG",
  // Biotech / pharma (volatile, often high SI)
  "SAVA",
  "BYFC",
  // Retail / consumer — structurally challenged, heavy SI
  "BYND",
  "SPCE",
  // Fintech / crypto adjacent
  "MSTR",
  "COIN",
  "HOOD",
  // Small-cap tech / speculative
  "MVIS",
  "WKHS",
  "GENI",
  "OPEN",
  // Additional speculative names
  "SKLZ",
  "BARK",
  "CLOV",
  "SNDL",
  "HYMC",
];

export const MIN_SCORE_THRESHOLD = 20; // Only show stocks scoring above this
export const MAX_DISPLAY = 20; // Cap dashboard tiles
