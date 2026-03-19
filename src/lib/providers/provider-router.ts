// ─── Provider Router ──────────────────────────────────────────────────────
// Tries flight data providers in order, falls back gracefully.
// Always returns affiliate links even if all APIs fail.

import { getLatestPrices, isTravelpayoutsConfigured } from "./travelpayouts/data-api";
import type { TravelpayoutsPrice } from "./travelpayouts/types";

export interface FlightPriceResult {
  source: "travelpayouts_cache" | "flightdata" | "affiliate_only";
  freshness: "approximate" | "real-time" | "none";
  freshnessNote: string;
  prices: TravelpayoutsPrice[];
  affiliateLinks: Record<string, string>;
  errors?: string[];
}

// ─── Affiliate Link Generators ────────────────────────────────────────────

function generateFlightAffiliateLinks(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
}): Record<string, string> {
  const { origin, destination, departDate, returnDate, adults = 1 } = params;
  const marker = process.env.TRAVELPAYOUTS_MARKER || "";
  const depDDMM = departDate.slice(8, 10) + departDate.slice(5, 7);
  const depYYMMDD = departDate.replace(/-/g, "");

  return {
    aviasales: `https://www.aviasales.com/search/${origin}${depDDMM}${destination}${returnDate ? returnDate.slice(8, 10) + returnDate.slice(5, 7) : ""}${adults}?marker=${marker}`,
    skyscanner: `https://www.skyscanner.co.in/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${depYYMMDD}/${returnDate ? returnDate.replace(/-/g, "") : ""}?adults=${adults}&ref=safar`,
    googleFlights: `https://www.google.com/travel/flights?q=Flights+from+${origin}+to+${destination}+on+${departDate}`,
    cleartrip: `https://www.cleartrip.com/flights/results?adults=${adults}&origin=${origin}&destination=${destination}&depart_date=${departDate}${returnDate ? `&return_date=${returnDate}` : ""}`,
    makemytrip: `https://www.makemytrip.com/flight/search?tripType=${returnDate ? "R" : "O"}&itinerary=${origin}-${destination}-${departDate}${returnDate ? `_${destination}-${origin}-${returnDate}` : ""}&paxType=A-${adults}_C-0_I-0&cabinClass=E`,
    ixigo: `https://www.ixigo.com/search/result/flight?from=${origin}&to=${destination}&date=${depYYMMDD}&returnDate=${returnDate ? returnDate.replace(/-/g, "") : ""}&adults=${adults}&children=0&infants=0&class=e&source=Search+Form`,
  };
}

// ─── Main Router ──────────────────────────────────────────────────────────

export async function getFlightPriceData(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  currency?: string;
}): Promise<FlightPriceResult> {
  const errors: string[] = [];
  const affiliateLinks = generateFlightAffiliateLinks(params);

  // Step 1: Travelpayouts Data API (free, cached)
  if (isTravelpayoutsConfigured()) {
    try {
      const departMonth = params.departDate.slice(0, 7); // YYYY-MM
      const cached = await getLatestPrices({
        origin: params.origin,
        destination: params.destination,
        departMonth,
        currency: params.currency || "inr",
      });

      if (cached.length > 0) {
        return {
          source: "travelpayouts_cache",
          freshness: "approximate",
          freshnessNote: "Based on searches in the last 48 hours",
          prices: cached,
          affiliateLinks,
        };
      }
    } catch (e) {
      errors.push(`Travelpayouts: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Step 2: Always return affiliate links even if all APIs fail
  return {
    source: "affiliate_only",
    freshness: "none",
    freshnessNote: "Compare prices on partner sites for the latest fares",
    prices: [],
    affiliateLinks,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export { generateFlightAffiliateLinks };
