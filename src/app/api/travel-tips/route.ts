// ─── AI Travel Tips API ─────────────────────────────────────────────────────
// Generates destination-specific travel tips using Gemini AI.
// Covers: weather, local customs, safety, transport hacks, food, packing, etc.
// Free tier: 60 req/min on Gemini.

import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache (TTL: 24 hours) — saves Gemini quota
const cache = new Map<string, { data: TravelTips; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export interface TravelTips {
  destination: string;
  isDomestic: boolean;
  weather: {
    current: string;
    bestTime: string;
    packingAdvice: string;
  };
  localTips: string[];
  foodGuide: {
    mustTry: string[];
    budgetEats: string;
    vegetarianFriendly: string;
  };
  transport: {
    fromAirport: string;
    gettingAround: string;
    hacks: string[];
  };
  safety: string[];
  budgetTips: string[];
  packingChecklist: string[];
  culturalNotes: string[];
  connectivity: {
    simCard: string;
    wifi: string;
    currency: string;
  };
}

function buildTipsPrompt(destination: string, isDomestic: boolean, month: string, duration: number): string {
  return `You are an expert travel advisor specializing in ${isDomestic ? "Indian domestic" : "international"} travel for Indian travelers.

Generate comprehensive, practical travel tips for a trip to ${destination} in ${month} for ${duration} days.

${isDomestic ? `This is a DOMESTIC trip within India. Focus on:
- Indian Railways tips (Tatkal booking, platform food, chain pulling rules)
- State transport bus services and their quality
- Local auto/rickshaw fare ranges
- Regional festivals happening in ${month}
- Monsoon/weather warnings specific to the region
- Local SIM/network coverage issues in remote areas
- UPI/digital payment availability
- Local food specialties and street food safety
- State-specific alcohol rules and dry days` : `This is an INTERNATIONAL trip from India. Focus on:
- Visa requirements and processing time for Indian passport holders
- Currency exchange tips (best rates, where to exchange in India vs abroad)
- International SIM/eSIM options from India (Airalo, local SIMs)
- Indian food availability at destination
- Cultural do's and don'ts for Indian travelers
- Tipping culture differences
- Power adapter requirements
- Time zone difference from IST`}

RESPOND WITH ONLY valid JSON matching this schema:
{
  "destination": "${destination}",
  "isDomestic": ${isDomestic},
  "weather": {
    "current": "Brief weather description for ${month}",
    "bestTime": "Best months to visit",
    "packingAdvice": "What to pack for ${month} weather"
  },
  "localTips": ["5-7 practical insider tips"],
  "foodGuide": {
    "mustTry": ["5 specific dishes/restaurants to try"],
    "budgetEats": "Where to eat cheaply",
    "vegetarianFriendly": "Vegetarian options availability and tips"
  },
  "transport": {
    "fromAirport": "How to get from airport/station to city center with costs",
    "gettingAround": "Best way to get around the city",
    "hacks": ["3-4 transport money-saving hacks"]
  },
  "safety": ["3-4 safety tips specific to ${destination}"],
  "budgetTips": ["4-5 money-saving tips"],
  "packingChecklist": ["10-12 essential items to pack"],
  "culturalNotes": ["3-4 cultural etiquette tips"],
  "connectivity": {
    "simCard": "SIM card / eSIM advice",
    "wifi": "WiFi availability",
    "currency": "Currency and payment tips"
  }
}

Return ONLY the JSON, no markdown code fences.`;
}

async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");
  const isDomestic = searchParams.get("domestic") === "true";
  const duration = parseInt(searchParams.get("duration") || "7", 10);

  if (!destination) {
    return NextResponse.json({ error: "destination is required" }, { status: 400 });
  }

  // Check cache
  const cacheKey = `${destination}-${isDomestic}-${new Date().getMonth()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ tips: cached.data, source: "cache" });
  }

  const month = new Date().toLocaleString("en-US", { month: "long" });
  const prompt = buildTipsPrompt(destination, isDomestic, month, duration);
  const result = await callGemini(prompt);

  if (!result) {
    return NextResponse.json({ tips: null, source: "unavailable" });
  }

  try {
    const tips: TravelTips = JSON.parse(result);
    cache.set(cacheKey, { data: tips, ts: Date.now() });
    return NextResponse.json({ tips, source: "gemini" });
  } catch {
    return NextResponse.json({ tips: null, source: "parse_error" });
  }
}
