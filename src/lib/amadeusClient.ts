// ─── Amadeus Self-Service API Client ─────────────────────────────────────
// Free tier: 2,000 flight search requests/month (test), unlimited in production
// Sign up: https://developers.amadeus.com → Create account → Get API keys
// Uses OAuth2 client_credentials flow for authentication

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.AMADEUS_API_KEY || "";
  const clientSecret = process.env.AMADEUS_API_SECRET || "";

  if (!clientId || !clientSecret) {
    throw new Error("Amadeus API credentials not configured");
  }

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const baseUrl = process.env.AMADEUS_ENV === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";

  const response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Amadeus auth failed (${response.status}): ${text}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

// ─── Types ────────────────────────────────────────────────────────────────

interface AmadeusFlightSegment {
  departure: { iataCode: string; terminal?: string; at: string };
  arrival: { iataCode: string; terminal?: string; at: string };
  carrierCode: string;
  number: string;
  aircraft?: { code: string };
  operating?: { carrierCode: string };
  duration: string; // PT2H30M
  numberOfStops: number;
}

interface AmadeusItinerary {
  duration: string;
  segments: AmadeusFlightSegment[];
}

interface AmadeusFlightOffer {
  id: string;
  source: string;
  itineraries: AmadeusItinerary[];
  price: {
    currency: string;
    total: string;
    grandTotal: string;
  };
  validatingAirlineCodes: string[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;
      class: string;
    }[];
  }[];
}

// ─── Airline code → name mapping ──────────────────────────────────────────

const AIRLINE_NAMES: Record<string, string> = {
  "6E": "IndiGo", AI: "Air India", UK: "Vistara", SG: "SpiceJet",
  EK: "Emirates", QR: "Qatar Airways", SQ: "Singapore Airlines",
  TG: "Thai Airways", BA: "British Airways", LH: "Lufthansa",
  AF: "Air France", KL: "KLM", TK: "Turkish Airlines",
  EY: "Etihad", CX: "Cathay Pacific", JL: "Japan Airlines",
  NH: "ANA", KE: "Korean Air", OZ: "Asiana", MH: "Malaysia Airlines",
  AA: "American Airlines", UA: "United Airlines", DL: "Delta",
  FZ: "flydubai", WY: "Oman Air", G8: "Go First", IX: "Air India Express",
  "9I": "Alliance Air", "I5": "AirAsia India", VJ: "VietJet",
  GA: "Garuda Indonesia", PR: "Philippine Airlines", AK: "AirAsia",
  TR: "Scoot", "3K": "Jetstar Asia", FD: "Thai AirAsia",
  WS: "WestJet", AC: "Air Canada", LX: "Swiss", OS: "Austrian Airlines",
  AY: "Finnair", SK: "SAS", IB: "Iberia", AZ: "ITA Airways",
  TP: "TAP Portugal", RJ: "Royal Jordanian", GF: "Gulf Air",
  UL: "SriLankan Airlines", BG: "Biman", PK: "PIA",
};

function resolveAirlineName(code: string): string {
  return AIRLINE_NAMES[code] || code;
}

// ─── Duration parser (PT2H30M → "2h 30m") ────────────────────────────────

function parseDuration(iso: string): { text: string; minutes: number } {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const hours = parseInt(match?.[1] || "0", 10);
  const mins = parseInt(match?.[2] || "0", 10);
  return { text: `${hours}h ${mins}m`, minutes: hours * 60 + mins };
}

// ─── Flight Search ────────────────────────────────────────────────────────

export interface AmadeusSearchParams {
  originCode: string;
  destinationCode: string;
  departDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  adults: number;
  currency?: string;
  max?: number;
}

export interface ParsedFlight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: { code: string; time: string; date: string; terminal?: string };
  arrival: { code: string; time: string; date: string; terminal?: string };
  duration: string;
  durationMinutes: number;
  stops: number;
  layoverCity?: string;
  cabin: string;
  price: number;
  currency: string;
  pricePerPerson: number;
}

export async function searchAmadeusFlights(
  params: AmadeusSearchParams
): Promise<{ outbound: ParsedFlight[]; inbound: ParsedFlight[] } | null> {
  try {
    const token = await getAccessToken();
    const baseUrl = process.env.AMADEUS_ENV === "production"
      ? "https://api.amadeus.com"
      : "https://test.api.amadeus.com";

    const url = new URL(`${baseUrl}/v2/shopping/flight-offers`);
    url.searchParams.set("originLocationCode", params.originCode);
    url.searchParams.set("destinationLocationCode", params.destinationCode);
    url.searchParams.set("departureDate", params.departDate);
    url.searchParams.set("returnDate", params.returnDate);
    url.searchParams.set("adults", String(params.adults));
    url.searchParams.set("currencyCode", params.currency || "INR");
    url.searchParams.set("max", String(params.max || 5));

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Amadeus] Search failed (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json() as {
      data: AmadeusFlightOffer[];
      dictionaries?: { carriers?: Record<string, string> };
    };

    if (!data.data || data.data.length === 0) return null;

    // Build carrier name lookup from response dictionaries
    const carrierNames = data.dictionaries?.carriers || {};

    const outbound: ParsedFlight[] = [];
    const inbound: ParsedFlight[] = [];

    for (const offer of data.data) {
      const totalPrice = parseFloat(offer.price.grandTotal || offer.price.total);
      const currency = offer.price.currency;
      const pricePerPerson = totalPrice / params.adults;

      // First itinerary = outbound
      if (offer.itineraries[0]) {
        const itin = offer.itineraries[0];
        const firstSeg = itin.segments[0];
        const lastSeg = itin.segments[itin.segments.length - 1];
        const carrier = firstSeg.carrierCode;
        const airlineName = carrierNames[carrier] || resolveAirlineName(carrier);
        const dur = parseDuration(itin.duration);
        const cabin = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY";

        outbound.push({
          id: `amadeus_out_${offer.id}`,
          airline: airlineName,
          airlineCode: carrier,
          flightNumber: `${carrier} ${firstSeg.number}`,
          departure: {
            code: firstSeg.departure.iataCode,
            time: new Date(firstSeg.departure.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
            date: new Date(firstSeg.departure.at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            terminal: firstSeg.departure.terminal,
          },
          arrival: {
            code: lastSeg.arrival.iataCode,
            time: new Date(lastSeg.arrival.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
            date: new Date(lastSeg.arrival.at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            terminal: lastSeg.arrival.terminal,
          },
          duration: dur.text,
          durationMinutes: dur.minutes,
          stops: itin.segments.length - 1,
          layoverCity: itin.segments.length > 1 ? itin.segments[0].arrival.iataCode : undefined,
          cabin: cabin.charAt(0) + cabin.slice(1).toLowerCase(),
          price: totalPrice,
          currency,
          pricePerPerson,
        });
      }

      // Second itinerary = inbound (return)
      if (offer.itineraries[1]) {
        const itin = offer.itineraries[1];
        const firstSeg = itin.segments[0];
        const lastSeg = itin.segments[itin.segments.length - 1];
        const carrier = firstSeg.carrierCode;
        const airlineName = carrierNames[carrier] || resolveAirlineName(carrier);
        const dur = parseDuration(itin.duration);
        const cabin = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY";

        inbound.push({
          id: `amadeus_in_${offer.id}`,
          airline: airlineName,
          airlineCode: carrier,
          flightNumber: `${carrier} ${firstSeg.number}`,
          departure: {
            code: firstSeg.departure.iataCode,
            time: new Date(firstSeg.departure.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
            date: new Date(firstSeg.departure.at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            terminal: firstSeg.departure.terminal,
          },
          arrival: {
            code: lastSeg.arrival.iataCode,
            time: new Date(lastSeg.arrival.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
            date: new Date(lastSeg.arrival.at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            terminal: lastSeg.arrival.terminal,
          },
          duration: dur.text,
          durationMinutes: dur.minutes,
          stops: itin.segments.length - 1,
          layoverCity: itin.segments.length > 1 ? itin.segments[0].arrival.iataCode : undefined,
          cabin: cabin.charAt(0) + cabin.slice(1).toLowerCase(),
          price: totalPrice,
          currency,
          pricePerPerson,
        });
      }
    }

    if (outbound.length === 0) return null;

    return { outbound, inbound };
  } catch (error) {
    console.error("[Amadeus] Flight search error:", error);
    return null;
  }
}

export function isAmadeusConfigured(): boolean {
  return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
}
