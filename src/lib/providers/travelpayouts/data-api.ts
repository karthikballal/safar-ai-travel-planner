// ─── Travelpayouts Data API ───────────────────────────────────────────────
// FREE cached flight price data (24-48h old). Primary flight data source.
// Docs: https://travelpayouts.github.io/slate/

import { withRedisCache } from "@/lib/cache/redis";
import type { TravelpayoutsPrice, TravelpayoutsCalendarEntry, TravelpayoutsPopularRoute } from "./types";

const BASE_URL = "https://api.travelpayouts.com";

function getToken(): string {
  return process.env.TRAVELPAYOUTS_TOKEN || "";
}

function getMarker(): string {
  return process.env.TRAVELPAYOUTS_MARKER || "";
}

async function fetchTravelpayouts(url: string): Promise<unknown> {
  const token = getToken();
  if (!token) {
    throw new Error("TRAVELPAYOUTS_TOKEN not configured");
  }

  const res = await fetch(url, {
    headers: { "X-Access-Token": token },
  });

  if (!res.ok) {
    throw new Error(`Travelpayouts API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ─── Latest Prices (cached from last 48h of user searches) ───────────────

export async function getLatestPrices(params: {
  origin: string;
  destination: string;
  departMonth?: string; // YYYY-MM
  currency?: string;
}): Promise<TravelpayoutsPrice[]> {
  const { origin, destination, currency = "inr", departMonth } = params;
  const cacheKey = `tp:prices:${origin}:${destination}:${departMonth || "any"}:${currency}`;

  return withRedisCache(cacheKey, 3600, async () => {
    const url = new URL(`${BASE_URL}/aviasales/v3/prices_for_dates`);
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("currency", currency);
    url.searchParams.set("sorting", "price");
    url.searchParams.set("unique", "false");
    if (departMonth) {
      url.searchParams.set("departure_at", departMonth);
    }

    const data = (await fetchTravelpayouts(url.toString())) as {
      data?: Array<{
        origin: string;
        destination: string;
        depart_date: string;
        return_date: string;
        value: number;
        airline: string;
        flight_number: string;
        number_of_changes: number;
        found_at: string;
      }>;
    };

    return (
      data.data?.map((d) => ({
        origin: d.origin,
        destination: d.destination,
        departDate: d.depart_date,
        returnDate: d.return_date,
        price: d.value,
        airline: d.airline,
        flightNumber: d.flight_number,
        transfers: d.number_of_changes,
        foundAt: d.found_at,
        currency,
      })) ?? []
    );
  });
}

// ─── Monthly Price Calendar ───────────────────────────────────────────────

export async function getMonthlyPrices(params: {
  origin: string;
  destination: string;
  month: string; // YYYY-MM
  currency?: string;
}): Promise<TravelpayoutsCalendarEntry[]> {
  const { origin, destination, month, currency = "inr" } = params;
  const cacheKey = `tp:calendar:${origin}:${destination}:${month}:${currency}`;

  return withRedisCache(cacheKey, 3600, async () => {
    const url = `${BASE_URL}/v2/prices/month-matrix?currency=${currency}&origin=${origin}&destination=${destination}&month=${month}&show_to_affiliates=true`;

    const data = (await fetchTravelpayouts(url)) as {
      data?: Array<{
        depart_date: string;
        return_date: string;
        origin: string;
        destination: string;
        value: number;
        number_of_changes: number;
        gate: string;
        airline: string;
        flight_number: number;
      }>;
    };

    return (
      data.data?.map((d) => ({
        departDate: d.depart_date,
        returnDate: d.return_date,
        origin: d.origin,
        destination: d.destination,
        price: d.value,
        transfers: d.number_of_changes,
        airline: d.airline,
        flightNumber: d.flight_number,
      })) ?? []
    );
  });
}

// ─── Popular Destinations from a City ─────────────────────────────────────

export async function getPopularRoutes(
  origin: string,
  currency = "inr"
): Promise<Record<string, TravelpayoutsPopularRoute>> {
  const cacheKey = `tp:popular:${origin}:${currency}`;

  return withRedisCache(cacheKey, 86400, async () => {
    const url = `${BASE_URL}/v1/city-directions?origin=${origin}&currency=${currency}`;
    const data = (await fetchTravelpayouts(url)) as {
      data?: Record<
        string,
        {
          origin: string;
          destination: string;
          depart_date: string;
          return_date: string;
          price: number;
          number_of_changes: number;
          airline: string;
        }
      >;
    };

    if (!data.data) return {};

    const result: Record<string, TravelpayoutsPopularRoute> = {};
    for (const [dest, d] of Object.entries(data.data)) {
      result[dest] = {
        origin: d.origin,
        destination: d.destination,
        departDate: d.depart_date,
        returnDate: d.return_date,
        price: d.price,
        transfers: d.number_of_changes,
        airline: d.airline,
      };
    }
    return result;
  });
}

// ─── Check if Travelpayouts is configured ─────────────────────────────────

export function isTravelpayoutsConfigured(): boolean {
  return !!process.env.TRAVELPAYOUTS_TOKEN;
}

export { getMarker };
