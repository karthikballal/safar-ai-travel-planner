import type { Flight, Hotel } from "@/data/mockTrip";

function resolveCurrencyLocale(currency: string): string {
  return currency === "INR" ? "en-IN" : "en-US";
}

function resolveCurrencyDigits(currency: string): number {
  return currency === "INR" ? 0 : 2;
}

export function formatCurrency(value: number, currency = "INR"): string {
  try {
    const digits = resolveCurrencyDigits(currency);
    return new Intl.NumberFormat(resolveCurrencyLocale(currency), {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(resolveCurrencyDigits(currency))}`;
  }
}

export function hasVerifiedFlightPrice(flight: Flight | null | undefined): flight is Flight {
  return !!flight && flight.priceVerified !== false && flight.price > 0;
}

export function hasVerifiedHotelPrice(hotel: Hotel | null | undefined): boolean {
  return !!hotel && hotel.priceVerified !== false && hotel.totalPrice > 0;
}

function getFlightPricingSummary(flights: Array<Flight | null | undefined>) {
  const verifiedFlights = flights.filter(hasVerifiedFlightPrice);
  if (verifiedFlights.length === 0) {
    return {
      amount: null,
      currency: null,
      hasVerifiedPrice: false,
      hasCompositePricingConflict: false,
    };
  }

  const currencies = [...new Set(verifiedFlights.map((flight) => flight.priceCurrency || "INR"))];
  if (currencies.length !== 1) {
    return {
      amount: null,
      currency: null,
      hasVerifiedPrice: true,
      hasCompositePricingConflict: true,
    };
  }

  const bundledFlights = verifiedFlights.filter((flight) => flight.priceIsTripTotal && flight.priceBundleId);
  if (bundledFlights.length > 0) {
    const bundleIds = [...new Set(bundledFlights.map((flight) => flight.priceBundleId))];
    if (bundledFlights.length !== verifiedFlights.length || bundleIds.length !== 1) {
      return {
        amount: null,
        currency: currencies[0],
        hasVerifiedPrice: true,
        hasCompositePricingConflict: true,
      };
    }

    return {
      amount: bundledFlights[0].price,
      currency: currencies[0],
      hasVerifiedPrice: true,
      hasCompositePricingConflict: false,
    };
  }

  return {
    amount: verifiedFlights.reduce((sum, flight) => sum + flight.price, 0),
    currency: currencies[0],
    hasVerifiedPrice: true,
    hasCompositePricingConflict: false,
  };
}

export function getFlightPriceLabel(flight: Flight | null | undefined): string {
  if (!flight) return "Live fare on partner";
  if (flight.priceLabel) return flight.priceLabel;
  return hasVerifiedFlightPrice(flight)
    ? formatCurrency(flight.price, flight.priceCurrency || "INR")
    : "Live fare on partner";
}

export function hasCompositeFlightPricingConflict(
  flights: Array<Flight | null | undefined>
): boolean {
  return getFlightPricingSummary(flights).hasCompositePricingConflict;
}

export function getFlightTotalLabel(
  flights: Array<Flight | null | undefined>,
  fallback = "Live fares on partner"
): string {
  const summary = getFlightPricingSummary(flights);
  if (!summary.hasVerifiedPrice) return fallback;
  if (summary.hasCompositePricingConflict || summary.amount === null || !summary.currency) {
    return "Match outbound and return from the same itinerary";
  }

  return formatCurrency(summary.amount, summary.currency);
}

export function getHotelNightlyLabel(hotel: Hotel | null | undefined): string {
  if (!hotel) return "Check live rates";
  if (hotel.priceLabel) return hotel.priceLabel;
  return hasVerifiedHotelPrice(hotel) ? `${formatCurrency(hotel.pricePerNight)}/night` : "Check live rates";
}

export function getHotelTotalLabel(hotel: Hotel | null | undefined): string {
  if (!hotel) return "Check live rates";
  return hasVerifiedHotelPrice(hotel) ? formatCurrency(hotel.totalPrice) : hotel.priceLabel || "Check live rates";
}

export function sumVerifiedFlightPrices(flights: Array<Flight | null | undefined>): number {
  const summary = getFlightPricingSummary(flights);
  return summary.currency === "INR" && !summary.hasCompositePricingConflict && summary.amount !== null
    ? summary.amount
    : 0;
}

export function sumVerifiedHotelPrices(hotels: Array<Hotel | null | undefined>): number {
  return hotels.reduce((sum, hotel) => sum + (hasVerifiedHotelPrice(hotel) ? hotel!.totalPrice : 0), 0);
}

export function hasPartnerOnlyPricing(
  flights: Array<Flight | null | undefined>,
  hotels: Array<Hotel | null | undefined>
): boolean {
  return flights.some((flight) => !!flight && !hasVerifiedFlightPrice(flight)) || hotels.some((hotel) => !!hotel && !hasVerifiedHotelPrice(hotel));
}

export function getFlightSourceLabel(source?: string): string {
  switch (source) {
    case "flightdataapi":
      return "FlightDataAPI (live fares)";
    case "kiwi":
      return "Kiwi Tequila (live fares)";
    case "serpapi":
      return "Google Flights";
    case "partner-redirect":
      return "Partner redirects";
    default:
      return "Flight estimates";
  }
}