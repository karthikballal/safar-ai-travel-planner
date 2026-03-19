import type { Flight, Hotel } from "@/data/mockTrip";
import type { ActivityOption } from "@/components/ActivitiesSelectionPage";
import {
  buildBookingSearchUrl,
  buildGoogleFlightsUrl,
  buildMapsUrl,
  buildSkyscannerSearchUrl,
} from "@/lib/affiliate";
import { runtimeConfig } from "@/lib/runtimeConfig";
import { withRedisCache } from "@/lib/cache/redis";
import { resolveIATA } from "@/lib/amadeus";
import { searchAmadeusFlights, isAmadeusConfigured } from "@/lib/amadeusClient";
import {
  estimateFlightPrices,
  estimateHotelPrices,
  estimateActivityPrices,
  type EstimatedFlight,
  type EstimatedHotel,
  type EstimatedActivity,
} from "@/lib/aiPriceEstimator";

const airlineLogos: Record<string, string> = {
  "Air India": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Air_India_Logo.svg/200px-Air_India_Logo.svg.png",
  IndiGo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IndiGo_Airlines_logo.svg/200px-IndiGo_Airlines_logo.svg.png",
  Emirates: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/200px-Emirates_logo.svg.png",
  Lufthansa: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lufthansa_Logo_2018.svg/200px-Lufthansa_Logo_2018.svg.png",
  "Singapore Airlines": "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/200px-Singapore_Airlines_Logo_2.svg.png",
  "Qatar Airways": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Qatar_Airways_Logo.svg/200px-Qatar_Airways_Logo.svg.png",
  ANA: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/All_Nippon_Airways_Logo.svg/200px-All_Nippon_Airways_Logo.svg.png",
};

function getAirlineLogo(airline: string): string {
  return (
    airlineLogos[airline] ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(airline)}&background=0f172a&color=ffffff&size=64`
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(minutes?: number): string {
  if (!minutes || Number.isNaN(minutes)) return "Live details on partner site";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function convertPriceLevelToLabel(priceLevel?: string): string {
  switch (priceLevel) {
    case "PRICE_LEVEL_FREE":
      return "Free";
    case "PRICE_LEVEL_INEXPENSIVE":
      return "Budget stay";
    case "PRICE_LEVEL_MODERATE":
      return "Mid-range stay";
    case "PRICE_LEVEL_EXPENSIVE":
      return "Premium stay";
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "Luxury stay";
    default:
      return "Check live rates";
  }
}

function buildPlacePhotoUrl(photoName?: string): string {
  if (!photoName || !runtimeConfig.googlePlacesApiKey) {
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
  }

  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&key=${runtimeConfig.googlePlacesApiKey}`;
}

type KiwiRoute = {
  local_departure?: string;
  local_arrival?: string;
  cityFrom?: string;
  cityTo?: string;
  flyFrom?: string;
  flyTo?: string;
};

type KiwiResult = {
  id: string;
  airlines?: string[];
  route?: KiwiRoute[];
  cityFrom?: string;
  cityTo?: string;
  flyFrom?: string;
  flyTo?: string;
  local_departure?: string;
  local_arrival?: string;
  duration?: { departure?: number };
  price?: number;
  deep_link?: string;
};

type FlightDataAirportEvent = {
  airport?: string;
  code?: string;
  time?: string;
};

type FlightDataSegment = {
  airline?: string;
  airline_code?: string;
  flight_number?: string;
  aircraft?: string;
  departure?: FlightDataAirportEvent;
  arrival?: FlightDataAirportEvent;
  duration_minutes?: number;
  travel_class?: string;
};

type FlightDataBookingOption = {
  url?: string;
  deep_link?: string;
  booking_url?: string;
};

type FlightDataResult = {
  rank?: number;
  price?: {
    amount?: number;
    currency?: string;
  };
  total_duration_minutes?: number;
  stops?: number;
  segments?: FlightDataSegment[];
  booking_options?: FlightDataBookingOption[];
};

type PlacesSearchResult = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  photos?: { name?: string }[];
  googleMapsUri?: string;
  websiteUri?: string;
  editorialSummary?: { text?: string };
  primaryTypeDisplayName?: { text?: string };
};

async function searchKiwiOneWay(params: {
  originCode: string;
  destinationCode: string;
  date: string;
  adults: number;
}): Promise<KiwiResult[]> {
  if (!runtimeConfig.kiwiTequilaApiKey) return [];

  const date = new Date(params.date);
  const dateValue = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  const url = new URL("https://tequila-api.kiwi.com/v2/search");
  url.searchParams.set("fly_from", params.originCode);
  url.searchParams.set("fly_to", params.destinationCode);
  url.searchParams.set("date_from", dateValue);
  url.searchParams.set("date_to", dateValue);
  url.searchParams.set("curr", "INR");
  url.searchParams.set("adults", String(params.adults));
  url.searchParams.set("limit", "5");
  url.searchParams.set("sort", "price");
  url.searchParams.set("selected_cabins", "M");

  const response = await fetch(url.toString(), {
    headers: {
      apikey: runtimeConfig.kiwiTequilaApiKey,
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Kiwi search failed with ${response.status}`);
  }

  const data = (await response.json()) as { data?: KiwiResult[] };
  return data.data || [];
}

function formatProviderPrice(amount: number, currency: string): string {
  try {
    const digits = currency === "INR" ? 0 : 2;
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(currency === "INR" ? 0 : 2)}`;
  }
}

function sanitizeFlightNumber(value: string | undefined, airlineCode: string | undefined): string {
  if (!value || /\bnone\b/i.test(value)) {
    return `${(airlineCode || "LIVE").toUpperCase()} LIVE`;
  }

  return value;
}

function normalizeTravelClass(value?: string): string {
  if (!value) return "Economy";
  const normalized = value.toLowerCase();
  if (normalized === "eco") return "Economy";
  return normalized
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function selectPrimaryCarrier(segments: FlightDataSegment[]): FlightDataSegment | undefined {
  return segments.find((segment) => segment.airline && segment.airline !== "Duffel Airways") || segments[0];
}

function splitFlightDataSegments(
  segments: FlightDataSegment[],
  destinationCode: string,
  returnDate: string
): { outbound: FlightDataSegment[]; inbound: FlightDataSegment[] } | null {
  if (segments.length < 2) return null;

  for (let index = 1; index < segments.length; index += 1) {
    if (segments[index - 1]?.arrival?.code === destinationCode) {
      return {
        outbound: segments.slice(0, index),
        inbound: segments.slice(index),
      };
    }
  }

  const returnStart = new Date(`${returnDate}T00:00:00`).getTime();
  const splitIndex = segments.findIndex((segment) => {
    const departureTime = segment.departure?.time ? new Date(segment.departure.time).getTime() : Number.NaN;
    return Number.isFinite(departureTime) && departureTime >= returnStart;
  });

  if (splitIndex <= 0 || splitIndex >= segments.length) return null;

  return {
    outbound: segments.slice(0, splitIndex),
    inbound: segments.slice(splitIndex),
  };
}

function buildFlightDataBookingUrl(
  options: FlightDataBookingOption[] | undefined,
  fallback: string
): string {
  const directOption = options?.find((option) => option.url || option.deep_link || option.booking_url);
  return directOption?.url || directOption?.deep_link || directOption?.booking_url || fallback;
}

function mapFlightDataDirection(params: {
  result: FlightDataResult;
  direction: "outbound" | "inbound";
  segments: FlightDataSegment[];
  bundleId: string;
  bookingUrl: string;
}): Flight {
  const firstSegment = params.segments[0];
  const lastSegment = params.segments[params.segments.length - 1];
  const primaryCarrier = selectPrimaryCarrier(params.segments);
  const amount = params.result.price?.amount || 0;
  const currency = params.result.price?.currency || "USD";

  return {
    id: `flightdata_${params.direction}_${params.bundleId}`,
    airline: primaryCarrier?.airline || "FlightDataAPI live fare",
    airlineLogo: getAirlineLogo(primaryCarrier?.airline || "Live fare"),
    flightNumber: sanitizeFlightNumber(primaryCarrier?.flight_number, primaryCarrier?.airline_code),
    departure: {
      city: firstSegment?.departure?.airport || (params.direction === "outbound" ? "Origin" : "Destination"),
      code: firstSegment?.departure?.code || "",
      time: firstSegment?.departure?.time
        ? new Date(firstSegment.departure.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "Live",
      date: formatDate(firstSegment?.departure?.time || new Date().toISOString()),
    },
    arrival: {
      city: lastSegment?.arrival?.airport || (params.direction === "outbound" ? "Destination" : "Origin"),
      code: lastSegment?.arrival?.code || "",
      time: lastSegment?.arrival?.time
        ? new Date(lastSegment.arrival.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "Live",
      date: formatDate(lastSegment?.arrival?.time || firstSegment?.departure?.time || new Date().toISOString()),
    },
    duration: formatDuration(
      params.segments.reduce((sum, segment) => sum + (segment.duration_minutes || 0), 0) || params.result.total_duration_minutes
    ),
    layover:
      params.segments.length > 1
        ? {
            city: params.segments[0]?.arrival?.airport || params.segments[0]?.arrival?.code || "Connection",
            duration: "See itinerary",
          }
        : undefined,
    class: normalizeTravelClass(primaryCarrier?.travel_class),
    price: amount,
    priceVerified: amount > 0,
    priceCurrency: currency,
    priceLabel: amount > 0 ? `${formatProviderPrice(amount, currency)} round trip` : "Live fare on partner",
    priceBundleId: params.bundleId,
    priceIsTripTotal: true,
    bookingUrl: params.bookingUrl,
  };
}

async function searchFlightDataFlights(params: {
  originCode: string;
  destinationCode: string;
  departDate: string;
  returnDate: string;
  adults: number;
}): Promise<{ outbound: Flight[]; inbound: Flight[] } | null> {
  if (!runtimeConfig.flightDataApiKey) return null;

  const response = await fetch("https://api.flightdataapi.com/v1/flights/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": runtimeConfig.flightDataApiKey,
    },
    body: JSON.stringify({
      origin: params.originCode,
      destination: params.destinationCode,
      departure_date: params.departDate,
      return_date: params.returnDate,
      adults: params.adults,
      travel_class: "economy",
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`FlightDataAPI search failed with ${response.status}`);
  }

  const data = (await response.json()) as {
    search_id?: string;
    flights?: FlightDataResult[];
  };
  const itineraries = (data.flights || [])
    .map((result, index) => {
      const split = splitFlightDataSegments(result.segments || [], params.destinationCode, params.returnDate);
      if (!split) return null;

      const bundleId = `${data.search_id || "flightdata"}_${result.rank || index + 1}`;
      const outboundFallbackUrl = buildSkyscannerSearchUrl({
        originCode: params.originCode,
        destinationCode: params.destinationCode,
      });
      const inboundFallbackUrl = buildGoogleFlightsUrl({
        originCode: params.destinationCode,
        destinationCode: params.originCode,
      });
      const outboundBookingUrl = buildFlightDataBookingUrl(result.booking_options, outboundFallbackUrl);
      const inboundBookingUrl = buildFlightDataBookingUrl(result.booking_options, inboundFallbackUrl);

      return {
        outbound: mapFlightDataDirection({
          result,
          direction: "outbound",
          segments: split.outbound,
          bundleId,
          bookingUrl: outboundBookingUrl,
        }),
        inbound: mapFlightDataDirection({
          result,
          direction: "inbound",
          segments: split.inbound,
          bundleId,
          bookingUrl: inboundBookingUrl,
        }),
      };
    })
    .filter((itinerary): itinerary is { outbound: Flight; inbound: Flight } => !!itinerary)
    .slice(0, 5);

  if (itineraries.length === 0) return null;

  return {
    outbound: itineraries.map((itinerary) => itinerary.outbound),
    inbound: itineraries.map((itinerary) => itinerary.inbound),
  };
}

function mapKiwiFlight(result: KiwiResult, direction: "outbound" | "inbound"): Flight {
  const firstLeg = result.route?.[0];
  const lastLeg = result.route?.[result.route.length - 1];
  const airline = result.airlines?.[0] || "Live fare";
  const departureDate = firstLeg?.local_departure || result.local_departure || new Date().toISOString();
  const arrivalDate = lastLeg?.local_arrival || result.local_arrival || departureDate;
  const originCode = firstLeg?.flyFrom || result.flyFrom || "";
  const destinationCode = lastLeg?.flyTo || result.flyTo || "";

  return {
    id: `kiwi_${direction}_${result.id}`,
    airline,
    airlineLogo: getAirlineLogo(airline),
    flightNumber: airline === "Live fare" ? "LIVE" : `${airline.slice(0, 2).toUpperCase()} LIVE`,
    departure: {
      city: firstLeg?.cityFrom || result.cityFrom || "Origin",
      code: originCode,
      time: new Date(departureDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      date: formatDate(departureDate),
    },
    arrival: {
      city: lastLeg?.cityTo || result.cityTo || "Destination",
      code: destinationCode,
      time: new Date(arrivalDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      date: formatDate(arrivalDate),
    },
    duration: formatDuration(result.duration?.departure),
    layover:
      result.route && result.route.length > 1 && result.route[1]?.cityFrom
        ? {
            city: result.route[1].cityFrom,
            duration: "See partner details",
          }
        : undefined,
    class: "Economy",
    price: result.price || 0,
    priceVerified: typeof result.price === "number" && result.price > 0,
    bookingUrl:
      result.deep_link ||
      buildSkyscannerSearchUrl({
        originCode,
        destinationCode,
      }),
  };
}

type SerpFlight = {
  airline: string;
  departure_airport?: { id?: string; time?: string; name?: string };
  arrival_airport?: { id?: string; time?: string; name?: string };
  duration?: number;
  price?: number;
  layovers?: { name: string; duration: number }[];
  flights?: { flight_number?: string }[];
};

async function searchSerpFlights(params: {
  originCode: string;
  destinationCode: string;
  departDate: string;
  returnDate: string;
}): Promise<{ outbound: Flight[]; inbound: Flight[] } | null> {
  if (!runtimeConfig.serpApiKey) return null;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("departure_id", params.originCode);
  url.searchParams.set("arrival_id", params.destinationCode);
  url.searchParams.set("outbound_date", params.departDate);
  url.searchParams.set("return_date", params.returnDate);
  url.searchParams.set("currency", "INR");
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", runtimeConfig.serpApiKey);

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`SerpAPI flight search failed with ${response.status}`);
  }

  const data = (await response.json()) as {
    best_flights?: SerpFlight[];
    other_flights?: SerpFlight[];
  };
  const results = [...(data.best_flights || []), ...(data.other_flights || [])].slice(0, 5);
  if (results.length === 0) return null;

  const mapResult = (flight: SerpFlight, direction: "outbound" | "inbound", index: number): Flight => ({
    id: `serp_${direction}_${index}`,
    airline: flight.airline || "Live fare",
    airlineLogo: getAirlineLogo(flight.airline || "Live fare"),
    flightNumber: flight.flights?.[0]?.flight_number || `${(flight.airline || "LF").slice(0, 2).toUpperCase()} ${100 + index}`,
    departure: {
      city: direction === "outbound" ? "Origin" : "Destination",
      code: direction === "outbound" ? params.originCode : params.destinationCode,
      time: flight.departure_airport?.time || "Live",
      date: formatDate(direction === "outbound" ? params.departDate : params.returnDate),
    },
    arrival: {
      city: direction === "outbound" ? "Destination" : "Origin",
      code: direction === "outbound" ? params.destinationCode : params.originCode,
      time: flight.arrival_airport?.time || "Live",
      date: formatDate(direction === "outbound" ? params.departDate : params.returnDate),
    },
    duration: formatDuration(flight.duration),
    layover: flight.layovers?.[0]
      ? {
          city: flight.layovers[0].name,
          duration: formatDuration(flight.layovers[0].duration),
        }
      : undefined,
    class: "Economy",
    price: flight.price || 0,
    priceVerified: typeof flight.price === "number" && flight.price > 0,
    bookingUrl: buildSkyscannerSearchUrl({
      originCode: direction === "outbound" ? params.originCode : params.destinationCode,
      destinationCode: direction === "outbound" ? params.destinationCode : params.originCode,
    }),
  });

  return {
    outbound: results.map((flight, index) => mapResult(flight, "outbound", index)),
    inbound: results.map((flight, index) => mapResult(flight, "inbound", index)),
  };
}

// ─── Map Amadeus results to Flight type ──────────────────────────────────

function mapAmadeusToFlight(
  parsed: import("@/lib/amadeusClient").ParsedFlight,
  direction: "outbound" | "inbound",
  originCode: string,
  destinationCode: string
): Flight {
  return {
    id: parsed.id,
    airline: parsed.airline,
    airlineLogo: getAirlineLogo(parsed.airline),
    flightNumber: parsed.flightNumber,
    departure: {
      city: parsed.departure.code,
      code: parsed.departure.code,
      time: parsed.departure.time,
      date: parsed.departure.date,
    },
    arrival: {
      city: parsed.arrival.code,
      code: parsed.arrival.code,
      time: parsed.arrival.time,
      date: parsed.arrival.date,
    },
    duration: parsed.duration,
    layover: parsed.layoverCity
      ? { city: parsed.layoverCity, duration: `${parsed.stops} stop${parsed.stops > 1 ? "s" : ""}` }
      : undefined,
    class: parsed.cabin,
    price: parsed.pricePerPerson,
    priceVerified: true,
    priceCurrency: parsed.currency,
    priceLabel: `${formatProviderPrice(parsed.pricePerPerson, parsed.currency)} per person`,
    bookingUrl: buildSkyscannerSearchUrl({
      originCode: direction === "outbound" ? originCode : destinationCode,
      destinationCode: direction === "outbound" ? destinationCode : originCode,
    }),
  };
}

// ─── Map AI-estimated flights to Flight type ─────────────────────────────

function mapEstimatedFlight(
  est: EstimatedFlight,
  direction: "outbound" | "inbound",
  index: number,
  originCode: string,
  destinationCode: string,
  date: string
): Flight {
  const fromCode = direction === "outbound" ? originCode : destinationCode;
  const toCode = direction === "outbound" ? destinationCode : originCode;

  return {
    id: `est_${direction}_${index}`,
    airline: est.airline,
    airlineLogo: getAirlineLogo(est.airline),
    flightNumber: est.flightNumber,
    departure: {
      city: fromCode,
      code: fromCode,
      time: est.departureTime,
      date: formatDate(date),
    },
    arrival: {
      city: toCode,
      code: toCode,
      time: est.arrivalTime,
      date: formatDate(date),
    },
    duration: formatDuration(est.durationMinutes),
    layover: est.stops > 0 && est.layoverCity
      ? { city: est.layoverCity, duration: `${est.stops} stop${est.stops > 1 ? "s" : ""}` }
      : undefined,
    class: est.cabin,
    price: est.priceINR,
    priceVerified: false,
    priceCurrency: "INR",
    priceLabel: `~${formatProviderPrice(est.priceINR, "INR")} est.`,
    bookingUrl: buildSkyscannerSearchUrl({ originCode: fromCode, destinationCode: toCode }),
  };
}

// ─── Map AI-estimated hotels to Hotel type ───────────────────────────────

function mapEstimatedHotel(
  est: EstimatedHotel,
  cityEntry: { city: string; checkIn: string; checkOut: string },
  nights: number,
  index: number
): Hotel {
  return {
    id: `est_hotel_${cityEntry.city.toLowerCase().replace(/\s+/g, "_")}_${index}`,
    name: est.name,
    image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`,
    stars: est.category === "luxury" ? 5 : est.category === "premium" ? 4 : est.category === "mid-range" ? 3 : 2,
    rating: est.rating,
    reviews: est.reviewCount,
    address: `${est.neighborhood}, ${cityEntry.city}`,
    amenities: est.amenities,
    checkIn: formatDate(cityEntry.checkIn),
    checkOut: formatDate(cityEntry.checkOut),
    nights,
    pricePerNight: est.pricePerNightINR,
    totalPrice: est.pricePerNightINR * nights,
    priceVerified: false,
    priceLabel: `~${formatProviderPrice(est.pricePerNightINR, "INR")}/night est.`,
    bookingUrl: buildBookingSearchUrl({ hotelName: est.name, city: cityEntry.city }),
  };
}

// ─── Map AI-estimated activities to ActivityOption type ───────────────────

function mapEstimatedActivity(
  est: EstimatedActivity,
  city: string,
  index: number
): ActivityOption {
  return {
    id: `est_activity_${city.toLowerCase().replace(/\s+/g, "_")}_${index}`,
    title: est.name,
    description: est.description,
    duration: `${est.durationHours} hours`,
    price: est.priceINR,
    currency: "INR",
    rating: est.rating,
    reviews: est.reviewCount,
    category: est.category,
    bookingUrl: buildMapsUrl(`${est.name} ${city}`),
    googleMapsUrl: buildMapsUrl(`${est.name} ${city}`),
    priceVerified: false,
    source: "gemini-ai",
  };
}

function buildPartnerFallbackFlights(origin: string, destination: string, originCode: string, destinationCode: string, departDate: string, returnDate: string): { outbound: Flight[]; inbound: Flight[] } {
  const outboundTarget = buildSkyscannerSearchUrl({ originCode, destinationCode });
  const inboundTarget = buildGoogleFlightsUrl({ originCode: destinationCode, destinationCode: originCode });

  return {
    outbound: [
      {
        id: `partner_out_${originCode}_${destinationCode}`,
        airline: "Skyscanner live fares",
        airlineLogo: getAirlineLogo("Live fare"),
        flightNumber: "LIVE",
        departure: { city: origin, code: originCode, time: "Live", date: formatDate(departDate) },
        arrival: { city: destination, code: destinationCode, time: "Search", date: formatDate(departDate) },
        duration: "Real-time partner search",
        class: "Partner",
        price: 0,
        priceVerified: false,
        bookingUrl: outboundTarget,
      },
    ],
    inbound: [
      {
        id: `partner_in_${destinationCode}_${originCode}`,
        airline: "Google Flights live fares",
        airlineLogo: getAirlineLogo("Live fare"),
        flightNumber: "LIVE",
        departure: { city: destination, code: destinationCode, time: "Live", date: formatDate(returnDate) },
        arrival: { city: origin, code: originCode, time: "Search", date: formatDate(returnDate) },
        duration: "Real-time partner search",
        class: "Partner",
        price: 0,
        priceVerified: false,
        bookingUrl: inboundTarget,
      },
    ],
  };
}

async function searchPlaces(query: string): Promise<PlacesSearchResult[]> {
  if (!runtimeConfig.googlePlacesApiKey) return [];

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": runtimeConfig.googlePlacesApiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.priceLevel",
        "places.photos",
        "places.googleMapsUri",
        "places.websiteUri",
        "places.editorialSummary",
        "places.primaryTypeDisplayName",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: query,
      pageSize: 6,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Google Places search failed with ${response.status}`);
  }

  const data = (await response.json()) as { places?: PlacesSearchResult[] };
  return data.places || [];
}

function dedupeById<T extends { id?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.id || JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchFlights(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults: number;
}) {
  const cacheKey = `flights:${params.origin}:${params.destination}:${params.departDate}:${params.returnDate}:${params.adults}`;

  return withRedisCache(cacheKey, 900, async () => {
    const originCode = resolveIATA(params.origin);
    const destinationCode = resolveIATA(params.destination);

    try {
      const flightDataFlights = await searchFlightDataFlights({
        originCode,
        destinationCode,
        departDate: params.departDate,
        returnDate: params.returnDate,
        adults: params.adults,
      });

      if (flightDataFlights) {
        return {
          ...flightDataFlights,
          source: "flightdataapi" as const,
          searchedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("[Travel Providers] FlightDataAPI flights error:", error);
    }

    try {
      if (runtimeConfig.kiwiTequilaApiKey) {
        const [outbound, inbound] = await Promise.all([
          searchKiwiOneWay({ originCode, destinationCode, date: params.departDate, adults: params.adults }),
          searchKiwiOneWay({ originCode: destinationCode, destinationCode: originCode, date: params.returnDate, adults: params.adults }),
        ]);

        if (outbound.length > 0 && inbound.length > 0) {
          return {
            source: "kiwi" as const,
            outbound: outbound.map((result) => mapKiwiFlight(result, "outbound")),
            inbound: inbound.map((result) => mapKiwiFlight(result, "inbound")),
            searchedAt: new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.error("[Travel Providers] Kiwi flights error:", error);
    }

    try {
      const serpFlights = await searchSerpFlights({
        originCode,
        destinationCode,
        departDate: params.departDate,
        returnDate: params.returnDate,
      });

      if (serpFlights) {
        return {
          ...serpFlights,
          source: "serpapi" as const,
          searchedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("[Travel Providers] SerpAPI flights error:", error);
    }

    // Try Amadeus Self-Service API (free 2,000 req/month)
    try {
      if (isAmadeusConfigured()) {
        const amadeusResult = await searchAmadeusFlights({
          originCode,
          destinationCode,
          departDate: params.departDate,
          returnDate: params.returnDate,
          adults: params.adults,
        });

        if (amadeusResult) {
          return {
            outbound: amadeusResult.outbound.map((f) => mapAmadeusToFlight(f, "outbound", originCode, destinationCode)),
            inbound: amadeusResult.inbound.map((f) => mapAmadeusToFlight(f, "inbound", originCode, destinationCode)),
            source: "amadeus" as const,
            searchedAt: new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.error("[Travel Providers] Amadeus flights error:", error);
    }

    // AI-powered price estimation using Gemini (FREE — always available)
    try {
      const estimated = await estimateFlightPrices({
        origin: params.origin,
        originCode,
        destination: params.destination,
        destinationCode,
        departDate: params.departDate,
        returnDate: params.returnDate,
        adults: params.adults,
      });

      if (estimated) {
        return {
          outbound: estimated.outbound.map((est, i) =>
            mapEstimatedFlight(est, "outbound", i, originCode, destinationCode, params.departDate)
          ),
          inbound: estimated.inbound.map((est, i) =>
            mapEstimatedFlight(est, "inbound", i, originCode, destinationCode, params.returnDate)
          ),
          source: "ai-estimated" as const,
          searchedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("[Travel Providers] AI flight estimation error:", error);
    }

    return {
      ...buildPartnerFallbackFlights(
        params.origin,
        params.destination,
        originCode,
        destinationCode,
        params.departDate,
        params.returnDate
      ),
      source: "partner-redirect" as const,
      searchedAt: new Date().toISOString(),
    };
  });
}

export async function searchHotels(params: {
  cities: { city: string; checkIn: string; checkOut: string }[];
  rooms: number;
}) {
  const cacheKey = `hotels:${JSON.stringify(params.cities)}:${params.rooms}`;

  return withRedisCache(cacheKey, 21600, async () => {
    const results: { city: string; hotels: Hotel[]; source: "google-places" | "booking-affiliate" }[] = [];

    for (const cityEntry of params.cities) {
      const nights = Math.max(
        1,
        Math.round(
          (new Date(cityEntry.checkOut).getTime() - new Date(cityEntry.checkIn).getTime()) / 86400000
        )
      );

      try {
        const places = dedupeById(
          await searchPlaces(`best hotels in ${cityEntry.city}`)
        );

        if (places.length > 0) {
          results.push({
            city: cityEntry.city,
            source: "google-places",
            hotels: places.slice(0, 6).map((place, index) => ({
              id: `hotel_${cityEntry.city.toLowerCase().replace(/\s+/g, "_")}_${place.id || index}`,
              name: place.displayName?.text || `Hotel in ${cityEntry.city}`,
              image: buildPlacePhotoUrl(place.photos?.[0]?.name),
              stars: 0,
              rating: place.rating || 0,
              reviews: place.userRatingCount || 0,
              address: place.formattedAddress || cityEntry.city,
              amenities: [],
              checkIn: formatDate(cityEntry.checkIn),
              checkOut: formatDate(cityEntry.checkOut),
              nights,
              pricePerNight: 0,
              totalPrice: 0,
              priceVerified: false,
              priceLabel: convertPriceLevelToLabel(place.priceLevel),
              bookingUrl: buildBookingSearchUrl({
                hotelName: place.displayName?.text,
                city: cityEntry.city,
              }),
              placeId: place.id,
            })),
          });
          continue;
        }
      } catch (error) {
        console.error(`[Travel Providers] Google Places hotels error for ${cityEntry.city}:`, error);
      }

      // AI-powered hotel estimation fallback
      try {
        const estimatedHotels = await estimateHotelPrices({
          city: cityEntry.city,
          checkIn: cityEntry.checkIn,
          checkOut: cityEntry.checkOut,
          nights,
        });

        if (estimatedHotels && estimatedHotels.length > 0) {
          results.push({
            city: cityEntry.city,
            source: "booking-affiliate" as const,
            hotels: estimatedHotels.map((est, idx) => mapEstimatedHotel(est, cityEntry, nights, idx)),
          });
          continue;
        }
      } catch (estError) {
        console.error(`[Travel Providers] AI hotel estimation error for ${cityEntry.city}:`, estError);
      }

      results.push({
        city: cityEntry.city,
        source: "booking-affiliate",
        hotels: [
          {
            id: `booking_city_${cityEntry.city.toLowerCase().replace(/\s+/g, "_")}`,
            name: `Hotels in ${cityEntry.city}`,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
            stars: 0,
            rating: 0,
            reviews: 0,
            address: cityEntry.city,
            amenities: [],
            checkIn: formatDate(cityEntry.checkIn),
            checkOut: formatDate(cityEntry.checkOut),
            nights,
            pricePerNight: 0,
            totalPrice: 0,
            priceVerified: false,
            priceLabel: "Check live rates on Booking.com",
            bookingUrl: buildBookingSearchUrl({ city: cityEntry.city }),
          },
        ],
      });
    }

    return {
      cities: results,
      searchedAt: new Date().toISOString(),
    };
  });
}

function getActivityCategory(place: PlacesSearchResult): ActivityOption["category"] {
  const label = place.primaryTypeDisplayName?.text?.toLowerCase() || "";
  if (label.includes("museum") || label.includes("art") || label.includes("landmark")) return "attraction";
  if (label.includes("restaurant") || label.includes("food") || label.includes("market")) return "food";
  if (label.includes("tour") || label.includes("travel")) return "tour";
  return "experience";
}

function getActivityDuration(category: ActivityOption["category"]): string {
  if (category === "food") return "1.5 hours";
  if (category === "tour") return "3 hours";
  if (category === "experience") return "2 hours";
  return "2.5 hours";
}

export async function searchActivities(params: {
  cities: { city: string; days: number }[];
}) {
  const cacheKey = `activities:${JSON.stringify(params.cities)}`;

  return withRedisCache(cacheKey, 21600, async () => {
    const results: { city: string; activities: ActivityOption[] }[] = [];

    for (const cityEntry of params.cities) {
      const queries = [
        `top tourist attractions in ${cityEntry.city}`,
        `best museums in ${cityEntry.city}`,
        `best food market in ${cityEntry.city}`,
      ];

      const placeGroups = await Promise.all(
        queries.map(async (query) => {
          try {
            return await searchPlaces(query);
          } catch (error) {
            console.error(`[Travel Providers] Google Places activities error for ${cityEntry.city}:`, error);
            return [];
          }
        })
      );

      const places = dedupeById(placeGroups.flat()).slice(0, Math.max(6, cityEntry.days * 3));

      let activities: ActivityOption[];

      if (places.length > 0) {
        activities = places.map((place, index) => {
          const category = getActivityCategory(place);
          const title = place.displayName?.text || `${cityEntry.city} highlight`;
          return {
            id: `activity_${cityEntry.city.toLowerCase().replace(/\s+/g, "_")}_${place.id || index}`,
            title,
            description:
              place.editorialSummary?.text ||
              `${title} in ${cityEntry.city}. Use Google Maps for live timings, ticketing, and visitor updates.`,
            duration: getActivityDuration(category),
            price: 0,
            currency: "INR",
            rating: place.rating || 0,
            reviews: place.userRatingCount || 0,
            image: buildPlacePhotoUrl(place.photos?.[0]?.name),
            category,
            bookingUrl: place.websiteUri || place.googleMapsUri || buildMapsUrl(`${title} ${cityEntry.city}`),
            googleMapsUrl: place.googleMapsUri || buildMapsUrl(`${title} ${cityEntry.city}`),
            priceVerified: false,
            source: "google-places",
          };
        });
      } else {
        // AI-powered activity estimation fallback
        try {
          const estimatedActivities = await estimateActivityPrices({
            city: cityEntry.city,
            days: cityEntry.days,
          });

          if (estimatedActivities && estimatedActivities.length > 0) {
            activities = estimatedActivities.map((est, idx) =>
              mapEstimatedActivity(est, cityEntry.city, idx)
            );
          } else {
            activities = [{
              id: `maps_${cityEntry.city.toLowerCase().replace(/\s+/g, "_")}`,
              title: `${cityEntry.city} attractions on Google Maps`,
              description: `Use Google Maps to browse the most relevant attractions, reviews, and opening hours in ${cityEntry.city}.`,
              duration: "Flexible",
              price: 0,
              currency: "INR",
              rating: 0,
              reviews: 0,
              category: "attraction",
              bookingUrl: buildMapsUrl(`top attractions in ${cityEntry.city}`),
              googleMapsUrl: buildMapsUrl(`top attractions in ${cityEntry.city}`),
              priceVerified: false,
              source: "google-places",
            }];
          }
        } catch (estError) {
          console.error(`[Travel Providers] AI activity estimation error for ${cityEntry.city}:`, estError);
          activities = [{
            id: `maps_${cityEntry.city.toLowerCase().replace(/\s+/g, "_")}`,
            title: `${cityEntry.city} attractions on Google Maps`,
            description: `Use Google Maps to browse the most relevant attractions, reviews, and opening hours in ${cityEntry.city}.`,
            duration: "Flexible",
            price: 0,
            currency: "INR",
            rating: 0,
            reviews: 0,
            category: "attraction",
            bookingUrl: buildMapsUrl(`top attractions in ${cityEntry.city}`),
            googleMapsUrl: buildMapsUrl(`top attractions in ${cityEntry.city}`),
            priceVerified: false,
            source: "google-places",
          }];
        }
      }

      results.push({ city: cityEntry.city, activities });
    }

    return {
      cities: results,
      searchedAt: new Date().toISOString(),
    };
  });
}