// ─── IATA Code Utility & Flight Types ──────────────────────────────────────
// Provides city ↔ IATA mapping and shared flight types.
// Previously used Amadeus SDK — now uses SerpAPI / algorithmic fallback
// since Amadeus Self-Service is being decommissioned (July 2026).

// ─── City ↔ IATA code mapping ─────────────────────────────────────────────
const cityToIATA: Record<string, string> = {
  // India
  mumbai: "BOM", delhi: "DEL", bangalore: "BLR", bengaluru: "BLR",
  chennai: "MAA", kolkata: "CCU", hyderabad: "HYD", pune: "PNQ",
  ahmedabad: "AMD", kochi: "COK", goa: "GOI", jaipur: "JAI",
  lucknow: "LKO", thiruvananthapuram: "TRV", coimbatore: "CJB",
  mangalore: "IXE", varanasi: "VNS", amritsar: "ATQ",
  // International
  paris: "CDG", london: "LHR", tokyo: "NRT", dubai: "DXB",
  singapore: "SIN", bangkok: "BKK", bali: "DPS", rome: "FCO",
  barcelona: "BCN", amsterdam: "AMS", prague: "PRG", vienna: "VIE",
  budapest: "BUD", zurich: "ZRH", lisbon: "LIS", berlin: "BER",
  seoul: "ICN", "hong kong": "HKG", istanbul: "IST", "new york": "JFK",
  maldives: "MLE", "kuala lumpur": "KUL", sydney: "SYD",
  "los angeles": "LAX", "san francisco": "SFO", toronto: "YYZ",
  moscow: "SVO", cairo: "CAI", nairobi: "NBO", "cape town": "CPT",
  "sao paulo": "GRU", "buenos aires": "EZE", lima: "LIM",
  mexico: "MEX", athens: "ATH", milan: "MXP", madrid: "MAD",
  // Regions → hub
  europe: "CDG", "southeast asia": "BKK", "east asia": "NRT",
  "middle east": "DXB", scandinavia: "CPH", japan: "NRT",
  "south korea": "ICN", "united states": "JFK", "united kingdom": "LHR",
};

export function resolveIATA(city: string): string {
  const key = city.toLowerCase().trim().replace(/\s+/g, " ");
  return cityToIATA[key] || cityToIATA[key.replace(/\s+/g, "_")] || city.toUpperCase().slice(0, 3);
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface FlightOffer {
  id: string;
  airline: string;
  airlineName: string;
  departure: string;       // ISO datetime
  arrival: string;         // ISO datetime
  duration: string;        // PT2H30M format
  stops: number;
  price: number;           // Total price in INR
  currency: string;
  cabin: string;
  bookingUrl?: string;
  source: "amadeus" | "estimated";
}

export interface FlightSearchResult {
  outbound: FlightOffer[];
  inbound: FlightOffer[];
  source: "amadeus" | "estimated";
  cached: boolean;
}

// ─── Airline name resolver ─────────────────────────────────────────────────
const airlineNames: Record<string, string> = {
  "6E": "IndiGo", AI: "Air India", UK: "Vistara", SG: "SpiceJet",
  EK: "Emirates", QR: "Qatar Airways", SQ: "Singapore Airlines",
  TG: "Thai Airways", BA: "British Airways", LH: "Lufthansa",
  AF: "Air France", KL: "KLM", TK: "Turkish Airlines",
  EY: "Etihad", CX: "Cathay Pacific", JL: "Japan Airlines",
  NH: "ANA", KE: "Korean Air", OZ: "Asiana", MH: "Malaysia Airlines",
  AA: "American Airlines", UA: "United Airlines", DL: "Delta",
  FZ: "flydubai", WY: "Oman Air", "9W": "Jet Airways", G8: "Go First",
};

function getAirlineName(code: string): string {
  return airlineNames[code] || code;
}

// ─── Stub: searchFlights (Amadeus removed — returns empty for fallback) ────

export async function searchFlights(
  _origin: string,
  _destination: string,
  _departDate: string,
  _returnDate?: string,
  _adults: number = 1,
  _currency: string = "INR",
  _maxOffers: number = 5
): Promise<FlightSearchResult> {
  // Amadeus Self-Service decommissioned July 2026.
  // Real flights now handled by SerpAPI in /api/flights/search.
  return { outbound: [], inbound: [], source: "estimated", cached: false };
}

// ─── Get cheapest flight dates (stub — was Amadeus) ────────────────────────

export interface DatePrice {
  date: string;
  price: number;
  source: "amadeus" | "estimated";
}

export async function getCheapestDates(
  _origin: string,
  _destination: string
): Promise<DatePrice[]> {
  return [];
}

// ─── Check if real flight API is configured ────────────────────────────────

export function isAmadeusConfigured(): boolean {
  // SerpAPI is now the primary real flight data source
  return !!process.env.SERPAPI_KEY;
}
