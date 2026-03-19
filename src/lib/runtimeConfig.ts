const DEFAULT_SITE_URL = "https://safarai.travel";

function normalizeSiteUrl(siteUrl?: string): string {
  if (!siteUrl) return DEFAULT_SITE_URL;
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export const runtimeConfig = {
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL),
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || "",
  flightDataApiKey: process.env.FLIGHTDATAAPI_KEY || process.env.FLIGHT_DATA_API_KEY || "",
  kiwiTequilaApiKey: process.env.KIWI_TEQUILA_API_KEY || "",
  serpApiKey: process.env.SERPAPI_KEY || "",
  bookingAffiliateId: process.env.BOOKING_AFFILIATE_ID || "",
  travelpayoutsToken: process.env.TRAVELPAYOUTS_TOKEN || "",
  travelpayoutsMarker: process.env.TRAVELPAYOUTS_MARKER || "",
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
  googleAdsenseClientId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || "",
};

export function hasGooglePlacesApi(): boolean {
  return runtimeConfig.googlePlacesApiKey.length > 0;
}

export function hasFlightDataApi(): boolean {
  return runtimeConfig.flightDataApiKey.length > 0;
}

export function hasKiwiApi(): boolean {
  return runtimeConfig.kiwiTequilaApiKey.length > 0;
}

export function hasSerpApi(): boolean {
  return runtimeConfig.serpApiKey.length > 0;
}

export function hasBookingAffiliate(): boolean {
  return runtimeConfig.bookingAffiliateId.length > 0;
}
