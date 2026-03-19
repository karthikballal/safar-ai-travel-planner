import { runtimeConfig } from "@/lib/runtimeConfig";

export type AffiliateProvider = "booking" | "skyscanner" | "google-flights" | "maps";

const PROVIDER_HOSTS: Record<AffiliateProvider, string[]> = {
  booking: ["www.booking.com", "booking.com"],
  skyscanner: ["www.skyscanner.co.in", "skyscanner.co.in", "www.skyscanner.net", "skyscanner.net"],
  "google-flights": ["www.google.com", "google.com"],
  maps: ["www.google.com", "google.com", "maps.google.com"],
};

export function buildBookingSearchUrl(params: { hotelName?: string; city?: string }): string {
  const url = new URL("https://www.booking.com/searchresults.html");
  const searchString = [params.hotelName, params.city].filter(Boolean).join(" ").trim();

  url.searchParams.set("ss", searchString || params.city || "Hotels");
  if (runtimeConfig.bookingAffiliateId) {
    url.searchParams.set("aid", runtimeConfig.bookingAffiliateId);
  }

  return url.toString();
}

export function buildSkyscannerSearchUrl(params: { originCode: string; destinationCode: string }): string {
  return `https://www.skyscanner.co.in/transport/flights/${params.originCode.toLowerCase()}/${params.destinationCode.toLowerCase()}/`;
}

export function buildGoogleFlightsUrl(params: { originCode: string; destinationCode: string }): string {
  return `https://www.google.com/travel/flights?q=flights+from+${params.originCode}+to+${params.destinationCode}`;
}

export function buildMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildAffiliateRedirectPath(params: {
  provider: AffiliateProvider;
  target: string;
  category: "flight" | "hotel" | "activity";
  label: string;
  destination?: string;
}): string {
  const searchParams = new URLSearchParams({
    target: params.target,
    category: params.category,
    label: params.label,
  });

  if (params.destination) {
    searchParams.set("destination", params.destination);
  }

  return `/go/${params.provider}?${searchParams.toString()}`;
}

export function sanitizeAffiliateTarget(provider: AffiliateProvider, target: string): string | null {
  try {
    const url = new URL(target);
    const allowedHosts = PROVIDER_HOSTS[provider];
    if (!allowedHosts.includes(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
