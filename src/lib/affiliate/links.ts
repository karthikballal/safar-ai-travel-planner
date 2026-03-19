// ─── Affiliate URL Generators ─────────────────────────────────────────────
// Generates deep links for all partner platforms including India OTAs.

// ─── Flights ──────────────────────────────────────────────────────────────

export function generateFlightAffiliateLinks(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  marker?: string;
}): Record<string, string> {
  const { origin, destination, departDate, returnDate, adults = 1 } = params;
  const marker = params.marker || process.env.TRAVELPAYOUTS_MARKER || "";
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

// ─── Hotels ───────────────────────────────────────────────────────────────

export function generateHotelAffiliateLinks(params: {
  city: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
}): Record<string, string> {
  const { city, checkIn, checkOut, adults = 2, rooms = 1 } = params;
  const aid = process.env.BOOKING_AID || process.env.BOOKING_AFFILIATE_ID || "";

  return {
    booking: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${adults}&no_rooms=${rooms}&aid=${aid}`,
    agoda: `https://www.agoda.com/search?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}`,
    goibibo: `https://www.goibibo.com/hotels/hotels-in-${city.toLowerCase().replace(/\s+/g, "-")}/`,
    makemytripHotels: `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${checkIn.replace(/-/g, "")}&checkout=${checkOut.replace(/-/g, "")}&city=${encodeURIComponent(city)}&roomStayQualifier=${rooms}e_${adults}a_0c`,
  };
}

// ─── Activities ───────────────────────────────────────────────────────────

export function generateActivityAffiliateLinks(params: {
  city: string;
  query?: string;
}): Record<string, string> {
  const { city, query } = params;
  const searchTerm = query || `things to do in ${city}`;
  const gygId = process.env.GYG_PARTNER_ID || "";
  const viatorPid = process.env.VIATOR_PID || "";

  return {
    getYourGuide: `https://www.getyourguide.com/s/?q=${encodeURIComponent(searchTerm)}&partner_id=${gygId}`,
    viator: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(searchTerm)}&pid=${viatorPid}`,
    klook: `https://www.klook.com/search/?query=${encodeURIComponent(searchTerm)}`,
    tripadvisor: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(searchTerm)}`,
  };
}

// ─── Supported providers list (for redirect validation) ───────────────────

export const SUPPORTED_PROVIDERS = [
  "booking",
  "skyscanner",
  "google-flights",
  "google-maps",
  "aviasales",
  "makemytrip",
  "cleartrip",
  "ixigo",
  "goibibo",
  "agoda",
  "getyourguide",
  "viator",
  "klook",
  "tripadvisor",
  "irctc",
] as const;

export type AffiliateProvider = (typeof SUPPORTED_PROVIDERS)[number];

export const ALLOWED_AFFILIATE_HOSTS = [
  "booking.com",
  "www.booking.com",
  "skyscanner.co.in",
  "www.skyscanner.co.in",
  "google.com",
  "www.google.com",
  "google.co.in",
  "maps.google.com",
  "aviasales.com",
  "www.aviasales.com",
  "makemytrip.com",
  "www.makemytrip.com",
  "cleartrip.com",
  "www.cleartrip.com",
  "ixigo.com",
  "www.ixigo.com",
  "goibibo.com",
  "www.goibibo.com",
  "agoda.com",
  "www.agoda.com",
  "getyourguide.com",
  "www.getyourguide.com",
  "viator.com",
  "www.viator.com",
  "klook.com",
  "www.klook.com",
  "tripadvisor.com",
  "www.tripadvisor.com",
  "irctc.co.in",
  "www.irctc.co.in",
];

export function isAllowedAffiliateHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_AFFILIATE_HOSTS.some(
      (h) => hostname === h || hostname.endsWith(`.${h}`)
    );
  } catch {
    return false;
  }
}
