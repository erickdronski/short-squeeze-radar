/** Shared type for live quote data returned by /api/quotes */
export interface LiveQuote {
  price: number;
  change: number;
  /** Whole percentage, e.g. 5.33 means +5.33% (matches priceChangePct in StockData) */
  changePct: number;
}
