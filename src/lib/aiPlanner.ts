// ─── AI Route Planner Service ──────────────────────────────────────────────
// Uses Google Gemini (free tier) or OpenAI to generate intelligent multi-city
// travel itineraries with optimal routing, transport modes, and budget allocation.
//
// Environment variables:
//   GEMINI_API_KEY    — Google AI Studio (free: 60 requests/min)
//   OPENAI_API_KEY    — OpenAI (paid, fallback)

import type { AIRoutePlan, AICity } from "@/lib/wizardContext";

// ─── Prompt Template ──────────────────────────────────────────────────────

function buildPrompt(params: {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  adults: number;
  children: number;
  foodPreference: string;
  preferredArrivalCity?: string;
  tripType?: string;
  selectedCities?: string[];
}): string {
  const { origin, destination, duration, budget, adults, children, foodPreference, preferredArrivalCity, tripType, selectedCities } = params;
  const travelers = adults + children;
  const budgetINR = budget.toLocaleString("en-IN");
  const isDomestic = tripType === "domestic";

  // Detect multi-country selection (e.g., "Netherlands, France, Germany")
  const isMultiCountry = destination.includes(",");
  const selectedCountries = isMultiCountry
    ? destination.split(",").map((c: string) => c.trim()).filter(Boolean)
    : [];

  const multiCountryInstruction = isMultiCountry
    ? `\nCRITICAL — MULTI-COUNTRY TRIP:\nThe traveler has specifically chosen to visit these ${selectedCountries.length} countries: ${selectedCountries.join(", ")}.\nYou MUST create EXACTLY ${selectedCountries.length} city entries — ONE major city per country:\n${selectedCountries.map((c: string, i: number) => `  ${i + 1}. Pick the #1 tourist city in ${c} (e.g., Paris for France, Amsterdam for Netherlands, Rome for Italy, Berlin for Germany, etc.)`).join("\n")}\nEach city entry must have the city name (NOT the country name) as the "city" field.\nFor example: {"city": "Amsterdam", "country": "Netherlands", ...} NOT {"city": "Netherlands", ...}\nAllocate days based on city importance. Include transport between cities (flights or trains).`
    : "";

  const arrivalCityInstruction = preferredArrivalCity
    ? `\nIMPORTANT: The traveler has chosen to arrive in ${preferredArrivalCity}. The FIRST city in the itinerary MUST be ${preferredArrivalCity}. Plan the route starting from ${preferredArrivalCity}.`
    : "";

  const domesticInstruction = isDomestic
    ? `\nThis is a DOMESTIC trip within India. No international flights needed. Focus on:
- Hotels and accommodation at the destination
- Local sightseeing and activities
- Inter-city transport via train (Indian Railways/Vande Bharat/Rajdhani/Shatabdi), bus (KSRTC/RSRTC/state transport), or car
- Do NOT suggest flights unless distance > 1000km
- Keep the first city as the destination city itself
- Include REAL Indian restaurant names and local food specialties (e.g., "Bademiya" in Mumbai, "Karim's" in Delhi)
- Mention specific REAL markets, temples, beaches, forts by their actual names
- For hill stations: mention altitude, best viewpoints, and trekking spots
- For beach destinations: mention specific beaches by name (e.g., "Baga Beach", "Palolem Beach")
- For heritage cities: mention specific forts, palaces, havelis by name
- Consider seasonal factors: monsoon (Jun-Sep), summer heat (Apr-Jun), winter (Nov-Feb), festival seasons
- Mention local transport hacks (auto-rickshaw, metro, local trains, shared taxis)
- NO visa information needed for domestic trips`
    : "";

  const selectedCitiesInstruction = selectedCities && selectedCities.length > 0
    ? `\nCRITICAL — USER-SELECTED CITIES:\nThe traveler has specifically chosen to visit these ${selectedCities.length} cities within ${destination}: ${selectedCities.join(", ")}.\nYou MUST create city entries for EXACTLY these cities: ${selectedCities.map((c: string, i: number) => `${i + 1}. ${c}`).join(", ")}.\nAllocate days intelligently based on how much there is to see in each city. The first city should be the arrival city${preferredArrivalCity ? ` (${preferredArrivalCity})` : ""}. Include specific transport between these cities (trains, flights, buses with real operator names).`
    : "";

  return `You are an expert travel planner AI. Generate an optimal multi-city travel itinerary.

TRAVELER DETAILS:
- From: ${origin}${isDomestic ? "" : " (India)"}
- Destination/Region: ${destination}
- Duration: ${duration} days
- Budget: ₹${budgetINR} total for ${travelers} traveler(s) (${adults} adults, ${children} children)
- Food preference: ${foodPreference}
- Trip type: ${isDomestic ? "Domestic (within India)" : "International"}
${arrivalCityInstruction}
${multiCountryInstruction}
${domesticInstruction}
${selectedCitiesInstruction}

INSTRUCTIONS:
0. If the destination contains MULTIPLE COUNTRIES separated by commas (e.g., "Netherlands, France, Germany"), then EACH country MUST have its own city entry. Pick the most popular tourist city in each country. The "city" field must be the city name, NOT the country name.
1. If the destination is a COUNTRY (e.g., "Japan", "Italy", "France", "Thailand"):
   - Plan a multi-city route visiting 2-4 cities within that country.
   - If a preferred arrival city is specified, START from that city.
   - Otherwise, choose the most logical arrival city (usually the one with the biggest international airport).
   - For Japan: if arriving Tokyo → do Tokyo → Kyoto → Osaka, if arriving Osaka → do Osaka → Kyoto → Tokyo.
   - For Italy: if arriving Rome → do Rome → Florence → Venice, if arriving Milan → do Milan → Venice → Florence → Rome.
   - Use LOCAL transport between cities: bullet trains (Shinkansen for Japan, TGV for France, Frecce for Italy), buses, ferries etc.
   - The FIRST city should be the international arrival city. The LAST city should be the departure city.

2. If the destination is a REGION (e.g., "Europe", "Southeast Asia"):
   - Pick 2-4 countries/cities to visit based on duration and budget.
   - Use flights or trains between cities across borders.

3. If the destination is a SINGLE CITY (e.g., "Paris", "Dubai", "Bali"):
   - Create a focused single-city plan with that city only.

4. Allocate days intelligently — major cities get 3-4 days, smaller ones get 1-2 days. Day trips count.
5. For transport between cities within same country, ALWAYS prefer trains/bullet trains over flights.
6. Include 3-5 specific REAL highlight attractions per city (use actual names like "Fushimi Inari Shrine", not generic "Temple Visit").
7. Estimate realistic costs in INR.
8. For Japan specifically: recommend JR Pass if visiting 2+ cities via Shinkansen.

RESPOND WITH ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "cities": [
    {
      "city": "Osaka",
      "country": "Japan",
      "days": 3,
      "highlights": ["Dotonbori Street Food", "Osaka Castle", "Kuromon Market", "Shinsekai District"],
      "transportFromPrev": null
    },
    {
      "city": "Kyoto",
      "country": "Japan",
      "days": 2,
      "highlights": ["Fushimi Inari Shrine", "Kinkaku-ji", "Arashiyama Bamboo Grove"],
      "transportFromPrev": {
        "mode": "train",
        "operator": "JR Shinkansen",
        "duration": "15m",
        "estimatedCost": 1200
      }
    },
    {
      "city": "Tokyo",
      "country": "Japan",
      "days": 3,
      "highlights": ["Senso-ji Temple", "Shibuya Crossing", "Tsukiji Market", "Akihabara"],
      "transportFromPrev": {
        "mode": "train",
        "operator": "JR Shinkansen (Nozomi)",
        "duration": "2h 15m",
        "estimatedCost": 9500
      }
    }
  ],
  "totalDays": ${duration},
  "theme": "A short theme description",
  "summary": "A 2-3 sentence summary of the trip including transport recommendations",
  "estimatedBudget": {
    "flights": 50000,
    "hotels": 40000,
    "activities": 20000,
    "transport": 15000,
    "total": 125000
  }
}

IMPORTANT:
- The first city should NOT have transportFromPrev (traveler flies from ${origin})
- All costs must be in INR (Indian Rupees)
- Keep total within ₹${budgetINR} ± 15%
- Highlights must be REAL attraction names, not generic descriptions
- For within-country travel, prefer trains/buses with real operator names
- Return ONLY the JSON, no markdown code fences`;
}

// ─── Gemini API Call ──────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("[Gemini] API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (error) {
    console.error("[Gemini] Request failed:", error);
    return null;
  }
}

// ─── OpenAI API Call ──────────────────────────────────────────────────────

async function callOpenAI(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert travel planner. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("[OpenAI] API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("[OpenAI] Request failed:", error);
    return null;
  }
}

// ─── Intelligent Fallback (no API key) ────────────────────────────────────

const regionCities: Record<string, AICity[]> = {
  europe: [
    { city: "Paris", country: "France", days: 3, highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Montmartre"] },
    { city: "Amsterdam", country: "Netherlands", days: 2, highlights: ["Anne Frank House", "Rijksmuseum", "Canal Cruise"], transportFromPrev: { mode: "train", operator: "Thalys", duration: "3h 20m", estimatedCost: 8500 } },
    { city: "Prague", country: "Czech Republic", days: 2, highlights: ["Charles Bridge", "Prague Castle", "Old Town Square"], transportFromPrev: { mode: "flight", operator: "EasyJet", duration: "1h 45m", estimatedCost: 6000 } },
  ],
  japan: [
    { city: "Osaka", country: "Japan", days: 3, highlights: ["Dotonbori Street Food Walk", "Osaka Castle & Park", "Kuromon Market", "Shinsekai & Tsutenkaku Tower"] },
    { city: "Kyoto", country: "Japan", days: 3, highlights: ["Fushimi Inari Shrine", "Kinkaku-ji (Golden Pavilion)", "Arashiyama Bamboo Grove", "Gion Geisha District"], transportFromPrev: { mode: "train", operator: "JR Special Rapid (covered by JR Pass)", duration: "30m", estimatedCost: 600 } },
    { city: "Tokyo", country: "Japan", days: 4, highlights: ["Senso-ji Temple", "Shibuya Crossing", "Tsukiji Market", "Akihabara Electric Town", "TeamLab Borderless"], transportFromPrev: { mode: "train", operator: "JR Shinkansen Nozomi", duration: "2h 15m", estimatedCost: 9500 } },
  ],
  "southeast asia": [
    { city: "Bangkok", country: "Thailand", days: 3, highlights: ["Grand Palace", "Chatuchak Market", "Wat Pho", "Street Food Tour"] },
    { city: "Siem Reap", country: "Cambodia", days: 2, highlights: ["Angkor Wat", "Ta Prohm", "Phare Circus"], transportFromPrev: { mode: "flight", operator: "AirAsia", duration: "1h 10m", estimatedCost: 5000 } },
    { city: "Singapore", country: "Singapore", days: 2, highlights: ["Marina Bay Sands", "Gardens by the Bay", "Hawker Centers"], transportFromPrev: { mode: "flight", operator: "Scoot", duration: "2h 30m", estimatedCost: 7500 } },
  ],
  dubai: [
    { city: "Dubai", country: "UAE", days: 5, highlights: ["Burj Khalifa", "Dubai Mall", "Desert Safari", "Palm Jumeirah", "Dubai Marina"] },
  ],
  bali: [
    { city: "Bali", country: "Indonesia", days: 6, highlights: ["Ubud Rice Terraces", "Tanah Lot", "Seminyak Beach", "Sacred Monkey Forest", "Uluwatu Temple"] },
  ],
  paris: [
    { city: "Paris", country: "France", days: 7, highlights: ["Eiffel Tower", "Louvre Museum", "Versailles", "Montmartre", "Seine River Cruise"] },
  ],
  london: [
    { city: "London", country: "United Kingdom", days: 7, highlights: ["Big Ben", "Tower of London", "British Museum", "Buckingham Palace", "Camden Market"] },
  ],
  singapore: [
    { city: "Singapore", country: "Singapore", days: 5, highlights: ["Marina Bay Sands", "Sentosa Island", "Gardens by the Bay", "Chinatown", "Little India"] },
  ],
  maldives: [
    { city: "Maldives", country: "Maldives", days: 5, highlights: ["Overwater Villa", "Snorkeling", "Sunset Cruise", "Spa & Wellness", "Local Island Visit"] },
  ],
  bangkok: [
    { city: "Bangkok", country: "Thailand", days: 5, highlights: ["Grand Palace", "Chatuchak Market", "Wat Pho", "Khao San Road", "Street Food Tour"] },
  ],
  rome: [
    { city: "Rome", country: "Italy", days: 5, highlights: ["Colosseum", "Vatican Museums", "Trevi Fountain", "Roman Forum", "Trastevere"] },
  ],
  switzerland: [
    { city: "Zurich", country: "Switzerland", days: 2, highlights: ["Old Town", "Lake Zurich", "Bahnhofstrasse"] },
    { city: "Interlaken", country: "Switzerland", days: 3, highlights: ["Jungfraujoch", "Paragliding", "Lake Thun"], transportFromPrev: { mode: "train", operator: "Swiss Rail", duration: "2h", estimatedCost: 5000 } },
  ],
};

function generateFallbackPlan(params: {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  adults: number;
  children: number;
  preferredArrivalCity?: string;
  tripType?: string;
  selectedCities?: string[];
}): AIRoutePlan {
  const { destination, duration, budget, preferredArrivalCity, tripType, selectedCities } = params;
  const key = destination.toLowerCase().trim();
  const isDomestic = tripType === "domestic";

  // Handle multi-country destinations (e.g., "Netherlands, France, Germany")
  const isMultiCountry = destination.includes(",");
  const selectedCountries = isMultiCountry
    ? destination.split(",").map(c => c.trim()).filter(Boolean)
    : [];

  // Map country names to their primary tourist city
  const countryToCityMap: Record<string, { city: string; highlights: string[] }> = {
    france: { city: "Paris", highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Montmartre"] },
    netherlands: { city: "Amsterdam", highlights: ["Anne Frank House", "Rijksmuseum", "Canal Cruise", "Vondelpark"] },
    germany: { city: "Berlin", highlights: ["Brandenburg Gate", "Berlin Wall Memorial", "Museum Island", "Reichstag"] },
    italy: { city: "Rome", highlights: ["Colosseum", "Vatican Museums", "Trevi Fountain", "Roman Forum"] },
    spain: { city: "Barcelona", highlights: ["Sagrada Familia", "Park Güell", "La Rambla", "Gothic Quarter"] },
    switzerland: { city: "Zurich", highlights: ["Old Town", "Lake Zurich", "Bahnhofstrasse", "Grossmünster"] },
    "czech republic": { city: "Prague", highlights: ["Charles Bridge", "Prague Castle", "Old Town Square", "Astronomical Clock"] },
    austria: { city: "Vienna", highlights: ["Schönbrunn Palace", "St. Stephen's Cathedral", "Belvedere", "Naschmarkt"] },
    greece: { city: "Athens", highlights: ["Acropolis", "Parthenon", "Ancient Agora", "Plaka District"] },
    portugal: { city: "Lisbon", highlights: ["Belém Tower", "Alfama District", "Pastéis de Belém", "Jeronimos Monastery"] },
    "united kingdom": { city: "London", highlights: ["Big Ben", "Tower of London", "British Museum", "Buckingham Palace"] },
    uk: { city: "London", highlights: ["Big Ben", "Tower of London", "British Museum", "Buckingham Palace"] },
    turkey: { city: "Istanbul", highlights: ["Hagia Sophia", "Blue Mosque", "Grand Bazaar", "Bosphorus Cruise"] },
    thailand: { city: "Bangkok", highlights: ["Grand Palace", "Wat Pho", "Chatuchak Market", "Khao San Road"] },
    vietnam: { city: "Hanoi", highlights: ["Ha Long Bay", "Hoan Kiem Lake", "Old Quarter", "Temple of Literature"] },
    indonesia: { city: "Bali", highlights: ["Ubud Rice Terraces", "Tanah Lot", "Seminyak Beach", "Sacred Monkey Forest"] },
    malaysia: { city: "Kuala Lumpur", highlights: ["Petronas Towers", "Batu Caves", "Central Market", "KL Tower"] },
    singapore: { city: "Singapore", highlights: ["Marina Bay Sands", "Gardens by the Bay", "Sentosa Island", "Chinatown"] },
    cambodia: { city: "Siem Reap", highlights: ["Angkor Wat", "Ta Prohm", "Bayon Temple", "Phare Circus"] },
    japan: { city: "Tokyo", highlights: ["Senso-ji Temple", "Shibuya Crossing", "Tsukiji Market", "Akihabara"] },
    "south korea": { city: "Seoul", highlights: ["Gyeongbokgung Palace", "Bukchon Hanok Village", "Myeongdong", "N Seoul Tower"] },
    taiwan: { city: "Taipei", highlights: ["Taipei 101", "Jiufen Old Street", "Shilin Night Market", "Longshan Temple"] },
    "dubai": { city: "Dubai", highlights: ["Burj Khalifa", "Dubai Mall", "Desert Safari", "Palm Jumeirah"] },
    uae: { city: "Dubai", highlights: ["Burj Khalifa", "Dubai Mall", "Desert Safari", "Palm Jumeirah"] },
    egypt: { city: "Cairo", highlights: ["Pyramids of Giza", "Egyptian Museum", "Khan el-Khalili", "Nile Cruise"] },
    jordan: { city: "Amman", highlights: ["Petra", "Wadi Rum", "Dead Sea", "Roman Amphitheatre"] },
  };

  // Find matching cities template
  let cities: AICity[];

  if (isMultiCountry && selectedCountries.length > 0) {
    // Build one city per selected country
    const daysPerCountry = Math.max(1, Math.floor(duration / selectedCountries.length));
    let remainingDays = duration;

    cities = selectedCountries.map((country, idx) => {
      const countryKey = country.toLowerCase().trim();
      const mapping = countryToCityMap[countryKey];
      const cityName = mapping?.city || country;
      const highlights = mapping?.highlights || ["Local sightseeing", "Cultural exploration", "Food tour"];
      const isLast = idx === selectedCountries.length - 1;
      const days = isLast ? remainingDays : daysPerCountry;
      remainingDays -= daysPerCountry;

      return {
        city: cityName,
        country: country,
        days,
        highlights,
        transportFromPrev: idx === 0 ? undefined : {
          mode: "flight" as const,
          operator: "Budget airline / EuroRail",
          duration: "1h 30m",
          estimatedCost: 7000,
        },
      };
    });
  } else if (selectedCities && selectedCities.length > 0) {
    // User selected specific cities within a country (e.g., Vietnam → Hanoi, Da Nang, Ho Chi Minh City)
    const daysPerCity = Math.max(1, Math.floor(duration / selectedCities.length));
    let remainingDays = duration;

    cities = selectedCities.map((cityName, idx) => {
      const countryKey = destination.toLowerCase().trim();
      const mapping = countryToCityMap[countryKey];
      const isLast = idx === selectedCities.length - 1;
      const days = isLast ? remainingDays : daysPerCity;
      remainingDays -= daysPerCity;

      // Try to find highlights for this city from the regionCities data
      const regionKey = Object.keys(regionCities).find(k =>
        regionCities[k].some(c => c.city.toLowerCase() === cityName.toLowerCase())
      );
      const matchedCity = regionKey
        ? regionCities[regionKey].find(c => c.city.toLowerCase() === cityName.toLowerCase())
        : null;

      return {
        city: cityName,
        country: destination,
        days,
        highlights: matchedCity?.highlights || mapping?.highlights || ["Local sightseeing", "Cultural exploration", "Food tour"],
        transportFromPrev: idx === 0 ? undefined : {
          mode: "train" as const,
          operator: "Local Express / Budget Airline",
          duration: "2-4h",
          estimatedCost: 5000,
        },
      };
    });
  } else {
    cities = regionCities[key] || [
      {
        city: destination,
        country: destination,
        days: duration,
        highlights: ["Local sightseeing", "Cultural exploration", "Food tour", "Shopping"],
      },
    ];
  }

  // If user chose a preferred arrival city, reorder so that city is first
  if (preferredArrivalCity && cities.length > 1) {
    const arrivalIdx = cities.findIndex(
      (c) => c.city.toLowerCase() === preferredArrivalCity.toLowerCase()
    );
    if (arrivalIdx > 0) {
      // Move arrival city to front, reverse the rest for a logical route
      const arrivalCity = { ...cities[arrivalIdx], transportFromPrev: undefined };
      const remaining = cities.filter((_, i) => i !== arrivalIdx);
      // Rebuild transport — the old first city now needs transport from arrival city
      const reordered = [arrivalCity, ...remaining.map((c, i) => {
        if (i === 0 && c.transportFromPrev) {
          // First remaining city: transport from arrivalCity (reverse direction)
          return { ...c };
        }
        return c;
      })];
      cities = reordered;
    }
  }

  // Adjust days to match duration
  const totalTemplateDays = cities.reduce((s, c) => s + c.days, 0);
  if (totalTemplateDays !== duration) {
    const ratio = duration / totalTemplateDays;
    cities = cities.map((c) => ({
      ...c,
      days: Math.max(1, Math.round(c.days * ratio)),
    }));
    // Adjust last city to match exact duration
    const currentTotal = cities.reduce((s, c) => s + c.days, 0);
    if (currentTotal !== duration) {
      cities[cities.length - 1].days += duration - currentTotal;
    }
  }

  return {
    cities,
    totalDays: duration,
    theme: isDomestic ? `${duration}-Day ${destination} Getaway` : `${duration}-Day ${destination} Adventure`,
    summary: `An AI-curated ${duration}-day journey through ${cities.length > 1 ? cities.map((c) => c.city).join(", ") : destination} covering the best sights, food, and experiences within your budget.`,
    estimatedBudget: isDomestic
      ? {
        flights: 0,
        hotels: Math.round(budget * 0.45),
        activities: Math.round(budget * 0.3),
        transport: Math.round(budget * 0.25),
        total: budget,
      }
      : {
        flights: Math.round(budget * 0.35),
        hotels: Math.round(budget * 0.3),
        activities: Math.round(budget * 0.2),
        transport: Math.round(budget * 0.15),
        total: budget,
      },
  };
}

// ─── Main export: generate AI route plan ──────────────────────────────────

export async function generateAIRoutePlan(params: {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  adults: number;
  children: number;
  foodPreference: string;
  preferredArrivalCity?: string;
  tripType?: string;
  selectedCities?: string[];
}): Promise<{ plan: AIRoutePlan; source: "gemini" | "openai" | "fallback" }> {
  const prompt = buildPrompt(params);

  // Try Gemini first (free tier)
  const geminiResult = await callGemini(prompt);
  if (geminiResult) {
    try {
      const plan = JSON.parse(geminiResult) as AIRoutePlan;
      if (plan.cities && plan.cities.length > 0) {
        return { plan, source: "gemini" };
      }
    } catch (e) {
      console.error("[AI Planner] Gemini JSON parse error:", e);
    }
  }

  // Try OpenAI (paid fallback)
  const openaiResult = await callOpenAI(prompt);
  if (openaiResult) {
    try {
      const plan = JSON.parse(openaiResult) as AIRoutePlan;
      if (plan.cities && plan.cities.length > 0) {
        return { plan, source: "openai" };
      }
    } catch (e) {
      console.error("[AI Planner] OpenAI JSON parse error:", e);
    }
  }

  // Intelligent algorithmic fallback
  console.log("[AI Planner] Using algorithmic fallback");
  return {
    plan: generateFallbackPlan(params),
    source: "fallback",
  };
}

// ─── Generate multiple route alternatives ─────────────────────────────────

export async function generateRouteAlternatives(params: {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  adults: number;
  children: number;
  foodPreference: string;
  preferredArrivalCity?: string;
  tripType?: string;
  selectedCities?: string[];
}): Promise<AIRoutePlan[]> {
  const { plan, source } = await generateAIRoutePlan(params);

  if (source === "fallback") {
    // For fallback, generate 2-3 variations
    const variations: AIRoutePlan[] = [plan];

    // Budget variation
    const budgetPlan = { ...plan, theme: `Budget-Friendly ${plan.theme}` };
    budgetPlan.estimatedBudget = {
      ...plan.estimatedBudget,
      flights: Math.round(plan.estimatedBudget.flights * 0.8),
      hotels: Math.round(plan.estimatedBudget.hotels * 0.7),
      total: Math.round(plan.estimatedBudget.total * 0.75),
    };
    variations.push(budgetPlan);

    // If multi-city, offer a shorter version  
    if (plan.cities.length > 2) {
      const shortPlan: AIRoutePlan = {
        ...plan,
        cities: plan.cities.slice(0, 2).map((c, i) => ({
          ...c,
          days: i === 0 ? Math.ceil(params.duration * 0.6) : Math.floor(params.duration * 0.4),
        })),
        theme: `Focused ${plan.cities[0].city} & ${plan.cities[1].city}`,
        totalDays: params.duration,
      };
      variations.push(shortPlan);
    }

    return variations;
  }

  // If we got AI response, return it as the primary option
  // plus generate a fallback as alternative
  return [
    plan,
    generateFallbackPlan(params),
  ];
}
