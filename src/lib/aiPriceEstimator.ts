// ─── AI-Powered Price Estimation using Gemini ────────────────────────────
// When no flight/hotel API is available, uses Gemini to generate realistic
// estimated prices based on route, season, and travel patterns.
// This ensures users NEVER see "Live fare on partner" or "$0" prices.

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// ─── In-memory cache (24h TTL) ────────────────────────────────────────────

const estimateCache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached<T>(key: string): T | null {
  const entry = estimateCache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  if (entry) estimateCache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  // Limit cache size
  if (estimateCache.size > 100) {
    const firstKey = estimateCache.keys().next().value;
    if (firstKey) estimateCache.delete(firstKey);
  }
  estimateCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// ─── Flight Price Estimation ──────────────────────────────────────────────

const flightEstimateSchema = z.object({
  flights: z.array(z.object({
    airline: z.string().describe("Real airline name that operates this route"),
    flightNumber: z.string().describe("Realistic flight number like AI 502, 6E 234"),
    departureTime: z.string().describe("Departure time in HH:MM format (24h)"),
    arrivalTime: z.string().describe("Arrival time in HH:MM format (24h)"),
    durationMinutes: z.number().describe("Flight duration in minutes"),
    stops: z.number().describe("Number of stops (0=direct)"),
    layoverCity: z.string().optional().describe("Layover city code if stops > 0"),
    priceINR: z.number().describe("Estimated price in INR per person one-way"),
    cabin: z.string().describe("Economy, Premium Economy, or Business"),
  })).min(3).max(5),
});

export type EstimatedFlight = z.infer<typeof flightEstimateSchema>["flights"][number];

export async function estimateFlightPrices(params: {
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departDate: string;
  returnDate: string;
  adults: number;
}): Promise<{ outbound: EstimatedFlight[]; inbound: EstimatedFlight[] } | null> {
  const cacheKey = `est_flight:${params.originCode}:${params.destinationCode}:${params.departDate}`;
  const cached = getCached<{ outbound: EstimatedFlight[]; inbound: EstimatedFlight[] }>(cacheKey);
  if (cached) return cached;

  try {
    const departMonth = new Date(params.departDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const { object: outboundData } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: flightEstimateSchema,
      prompt: `You are a flight pricing expert. Generate 4 realistic flight options for:
Route: ${params.origin} (${params.originCode}) → ${params.destination} (${params.destinationCode})
Date: ${departMonth}
Adults: ${params.adults}

CRITICAL RULES:
- Use ONLY real airlines that ACTUALLY fly this route (e.g., IndiGo, Air India for domestic India, Emirates/Singapore Airlines for international)
- Prices must be realistic for ${departMonth} season in Indian Rupees (INR) per person one-way
- Include a mix: 1 budget option, 2 mid-range, 1 premium
- Flight numbers must look real (airline code + 3-4 digit number)
- Duration must be accurate for this route distance
- For domestic India flights: ₹2,500-₹12,000 range
- For Asia flights from India: ₹8,000-₹35,000 range
- For Europe/US flights from India: ₹25,000-₹80,000 range
- Include at least 1 direct flight if the route has direct service`,
      temperature: 0.3,
    });

    const { object: inboundData } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: flightEstimateSchema,
      prompt: `Generate 4 realistic return flight options for:
Route: ${params.destination} (${params.destinationCode}) → ${params.origin} (${params.originCode})
Date: ${new Date(params.returnDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
Use ONLY real airlines that fly this route. Prices in INR per person one-way.
Include a mix of budget, mid-range, and premium options with accurate durations.`,
      temperature: 0.3,
    });

    const result = {
      outbound: outboundData.flights,
      inbound: inboundData.flights,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("[AI Price Estimator] Flight estimation error:", error);
    return null;
  }
}

// ─── Hotel Price Estimation ───────────────────────────────────────────────

const hotelEstimateSchema = z.object({
  hotels: z.array(z.object({
    name: z.string().describe("Real hotel name that exists in this city"),
    category: z.enum(["budget", "mid-range", "premium", "luxury"]),
    rating: z.number().min(1).max(5).describe("Google rating out of 5"),
    reviewCount: z.number().describe("Approximate number of reviews"),
    pricePerNightINR: z.number().describe("Price per night in INR"),
    amenities: z.array(z.string()).max(5).describe("Key amenities"),
    neighborhood: z.string().describe("Area/neighborhood in the city"),
    description: z.string().describe("One-line description"),
  })).min(4).max(6),
});

export type EstimatedHotel = z.infer<typeof hotelEstimateSchema>["hotels"][number];

export async function estimateHotelPrices(params: {
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
}): Promise<EstimatedHotel[] | null> {
  const cacheKey = `est_hotel:${params.city}:${params.checkIn}`;
  const cached = getCached<EstimatedHotel[]>(cacheKey);
  if (cached) return cached;

  try {
    const month = new Date(params.checkIn).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: hotelEstimateSchema,
      prompt: `You are a hotel expert. Generate 5 real hotel options for:
City: ${params.city}
Stay: ${params.nights} nights in ${month}

CRITICAL RULES:
- Use ONLY real hotels that ACTUALLY exist in ${params.city}
- Include 1 budget, 2 mid-range, 1 premium, 1 luxury option
- Prices must be realistic for ${month} season in Indian Rupees (INR)
- Indian cities: budget ₹800-₹2,000, mid ₹2,500-₹5,000, premium ₹5,000-₹12,000, luxury ₹12,000+
- International cities: budget ₹2,000-₹4,000, mid ₹4,000-₹10,000, premium ₹10,000-₹20,000, luxury ₹20,000+
- Ratings should be between 3.5-4.8
- Include real neighborhoods (e.g., "Old Quarter" for Hanoi, "Calangute" for Goa)
- List 3-5 actual amenities (WiFi, Pool, Breakfast, AC, etc.)`,
      temperature: 0.3,
    });

    setCache(cacheKey, object.hotels);
    return object.hotels;
  } catch (error) {
    console.error("[AI Price Estimator] Hotel estimation error:", error);
    return null;
  }
}

// ─── Activity Price Estimation ────────────────────────────────────────────

const activityEstimateSchema = z.object({
  activities: z.array(z.object({
    name: z.string().describe("Real attraction/activity name"),
    category: z.enum(["attraction", "tour", "experience", "food"]),
    description: z.string().describe("2-3 sentence description"),
    durationHours: z.number().describe("Duration in hours"),
    priceINR: z.number().describe("Price per person in INR (0 if free)"),
    rating: z.number().min(1).max(5),
    reviewCount: z.number(),
    bestTimeToVisit: z.string().describe("e.g., 'Morning', 'Evening', 'Any time'"),
    mustVisit: z.boolean().describe("Is this a must-visit attraction?"),
  })).min(5).max(8),
});

export type EstimatedActivity = z.infer<typeof activityEstimateSchema>["activities"][number];

export async function estimateActivityPrices(params: {
  city: string;
  days: number;
}): Promise<EstimatedActivity[] | null> {
  const cacheKey = `est_activity:${params.city}:${params.days}`;
  const cached = getCached<EstimatedActivity[]>(cacheKey);
  if (cached) return cached;

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: activityEstimateSchema,
      prompt: `You are a travel activity expert. Generate ${Math.min(8, params.days * 2 + 2)} real activities for:
City: ${params.city}
Duration: ${params.days} days

CRITICAL RULES:
- Use ONLY real attractions, tours, restaurants that ACTUALLY exist in ${params.city}
- Include a mix: famous landmarks, hidden gems, food experiences, tours
- Prices in INR per person (many attractions in India are ₹0-₹500, international ₹500-₹5,000)
- Temple/monument entry fees in India: ₹0-₹500 for Indians
- Food experiences: ₹200-₹2,000 per person
- Guided tours: ₹500-₹5,000 per person
- Include rating (3.5-5.0) and realistic review counts
- Mark 2-3 as must-visit
- Include specific real names (e.g., "Ho Chi Minh Mausoleum" not "Famous monument")`,
      temperature: 0.3,
    });

    setCache(cacheKey, object.activities);
    return object.activities;
  } catch (error) {
    console.error("[AI Price Estimator] Activity estimation error:", error);
    return null;
  }
}
