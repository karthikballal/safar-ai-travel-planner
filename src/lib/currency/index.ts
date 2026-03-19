// ─── Currency Formatting & Exchange ──────────────────────────────────────────
// Default currency: INR with Indian lakhs formatting.
// Supports conversion to USD, EUR, GBP for international display.

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "THB" | "AED" | "SGD" | "JPY";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  /** Number of decimal places */
  decimals: number;
}

const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", locale: "en-IN", decimals: 0 },
  USD: { code: "USD", symbol: "$", locale: "en-US", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", locale: "en-IE", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", decimals: 2 },
  THB: { code: "THB", symbol: "฿", locale: "th-TH", decimals: 0 },
  AED: { code: "AED", symbol: "د.إ", locale: "ar-AE", decimals: 2 },
  SGD: { code: "SGD", symbol: "S$", locale: "en-SG", decimals: 2 },
  JPY: { code: "JPY", symbol: "¥", locale: "ja-JP", decimals: 0 },
};

// ─── Fallback exchange rates (updated periodically, used when API is down) ───
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  THB: 0.42,
  AED: 0.044,
  SGD: 0.016,
  JPY: 1.78,
};

let cachedRates: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch live exchange rates from exchangerate.host (free tier, no key needed).
 * Falls back to hardcoded rates on failure.
 */
async function fetchRates(): Promise<Record<string, number>> {
  if (cachedRates !== null && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedRates;
  }
  try {
    const res = await fetch(
      "https://api.exchangerate.host/latest?base=INR&symbols=USD,EUR,GBP,THB,AED,SGD,JPY",
      { next: { revalidate: 21600 } } // 6h ISR
    );
    if (!res.ok) throw new Error(`Exchange rate API returned ${res.status}`);
    const data = await res.json();
    if (data.rates) {
      const rates: Record<string, number> = { INR: 1, ...data.rates };
      cachedRates = rates;
      cacheTimestamp = Date.now();
      return rates;
    }
  } catch (err) {
    console.warn("[Currency] Exchange rate fetch failed, using fallback:", err);
  }
  return FALLBACK_RATES;
}

/**
 * Format a number as currency with proper locale formatting.
 * For INR, uses Indian lakhs system (1,23,456).
 */
export function formatCurrency(amount: number, currency: CurrencyCode = "INR"): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

/**
 * Format a number in Indian lakhs notation (e.g., "1.2L", "45K").
 * Used for compact budget display.
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  }
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)}L`;
  }
  if (amount >= 1_000) {
    return `₹${(amount / 1_000).toFixed(0)}K`;
  }
  return `₹${amount}`;
}

/**
 * Convert between currencies.
 * @param amount - Amount in source currency
 * @param from - Source currency code
 * @param to - Target currency code
 */
export async function convertCurrency(
  amount: number,
  from: CurrencyCode = "INR",
  to: CurrencyCode = "USD"
): Promise<number> {
  if (from === to) return amount;
  const rates = await fetchRates();
  // Convert via INR base
  const inINR = from === "INR" ? amount : amount / (rates[from] || 1);
  const result = to === "INR" ? inINR : inINR * (rates[to] || 1);
  return Math.round(result * 100) / 100;
}

/**
 * Format price range for display (e.g., "₹45,000 – ₹65,000").
 */
export function formatPriceRange(min: number, max: number, currency: CurrencyCode = "INR"): string {
  if (min === max) return formatCurrency(min, currency);
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
}

/**
 * Get the currency symbol only.
 */
export function getCurrencySymbol(currency: CurrencyCode = "INR"): string {
  return CURRENCY_CONFIG[currency]?.symbol ?? "₹";
}

export { CURRENCY_CONFIG, FALLBACK_RATES };
