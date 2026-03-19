// ─── Real AI Agent Runner ────────────────────────────────────────────────────
// Orchestrates sequential/parallel Gemini AI calls for each travel agent.
// Each agent makes a REAL Gemini API call with a specialized prompt.
// Results are cached to save Gemini quota.

export interface AgentResult {
  agentId: string;
  data: Record<string, unknown>;
  source: "gemini" | "fallback";
}

export interface AgentRunnerInput {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  adults: number;
  children: number;
  foodPreference: string;
  tripType: "domestic" | "international";
  travelStyle?: string;
  interests?: string[];
  startDate?: string;
  cities?: { city: string; days: number }[];
}

export interface AllAgentResults {
  flightIntel?: Record<string, unknown>;
  hotelIntel?: Record<string, unknown>;
  diningIntel?: Record<string, unknown>;
  activityIntel?: Record<string, unknown>;
  visaIntel?: Record<string, unknown>;
  budgetIntel?: Record<string, unknown>;
  transportIntel?: Record<string, unknown>;
}

// ─── In-memory cache (server-side) ────────────────────────────────────────
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
  // Limit cache size
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

// ─── Gemini Call Helper ───────────────────────────────────────────────────
async function callGeminiAgent(prompt: string, temperature = 0.5): Promise<Record<string, unknown> | null> {
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
            temperature,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(`[AgentRunner] Gemini error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("[AgentRunner] Gemini call failed:", error);
    return null;
  }
}

// ─── Agent Prompts ────────────────────────────────────────────────────────

function buildFlightIntelPrompt(input: AgentRunnerInput): string {
  const { origin, destination, duration, budget, adults, children, tripType, startDate } = input;
  const travelers = adults + children;
  const month = startDate ? new Date(startDate).toLocaleString("en-US", { month: "long", year: "numeric" }) : "upcoming months";

  if (tripType === "domestic") {
    return `You are an Indian domestic transport expert. For a trip from ${origin} to ${destination} (${duration} days, ${travelers} travelers, budget ₹${budget.toLocaleString("en-IN")}):

Analyze ALL transport options:
1. FLIGHTS: Which budget airlines fly this route? (IndiGo, SpiceJet, Air India Express, Akasa Air, Vistara). Typical fare range for ${month}. Best booking platform (MakeMyTrip, Goibibo, Google Flights).
2. TRAINS: Best trains on this route (Rajdhani, Shatabdi, Vande Bharat, Duronto, Garib Rath). Typical fare for AC 2-Tier/3-Tier/Chair Car. IRCTC booking tips — book exactly 120 days ahead. Tatkal timing (10 AM for AC, 11 AM for sleeper).
3. BUS: Volvo sleeper/AC options (KSRTC, RSRTC, RedBus operators). Overnight bus viability.
4. RECOMMENDATION: For ${Math.round(getDistance(origin, destination))}+ km, which mode offers the best value?

Return JSON:
{
  "recommended_mode": "train" or "flight" or "bus",
  "flights": { "airlines": ["IndiGo", "SpiceJet"], "price_range": [3500, 6000], "best_platform": "MakeMyTrip", "booking_tip": "Book 3-4 weeks ahead for best prices" },
  "trains": { "best_trains": [{"name": "Rajdhani Express", "number": "12951", "duration": "16h", "fare_ac2": 2200, "fare_ac3": 1500}], "booking_tip": "Book on IRCTC 120 days before" },
  "buses": { "operators": ["VRL Travels", "SRS Travels"], "price_range": [800, 2000], "duration": "10-12h" },
  "money_saving_tip": "specific actionable tip"
}`;
  }

  return `You are a flight pricing expert for Indian travelers. For a trip from ${origin} (India) to ${destination} in ${month}, ${travelers} travelers, budget ₹${budget.toLocaleString("en-IN")}:

Provide:
1. Top 3-5 airlines that fly this route with realistic price estimates per person for ${month}
2. Whether round-trip or two one-ways is typically cheaper for this route
3. Best day-of-week to fly (Tuesday/Wednesday cheapest?)
4. How many weeks ahead to book for best price
5. Which aggregator typically has the best price: MakeMyTrip, Skyscanner, Google Flights, or Kayak
6. Direct vs 1-stop analysis: is the direct flight worth the premium?
7. If budget is tight, suggest alternative airports or dates

Return JSON:
{
  "airlines": [{"name": "Emirates", "price_per_person": 35000, "stops": 1, "duration": "10h 30m", "hub": "Dubai"}],
  "best_booking_strategy": "Book round-trip 6-8 weeks ahead on Skyscanner",
  "price_estimate": { "economy_low": 32000, "economy_avg": 42000, "premium": 85000 },
  "best_platform": "Skyscanner",
  "booking_tip": "specific tip for this route",
  "budget_warning": null or "Your budget may be tight for flights to this destination"
}`;
}

function buildHotelIntelPrompt(input: AgentRunnerInput): string {
  const { destination, duration, budget, adults, tripType, foodPreference, cities, travelStyle } = input;
  const travelers = adults + (input.children || 0);
  const budgetPerNight = Math.round((budget * (tripType === "domestic" ? 0.4 : 0.3)) / duration);
  const budgetTier = budgetPerNight < 4000 ? "budget" : budgetPerNight < 12000 ? "mid-range" : "luxury";
  const citiesStr = cities?.map(c => `${c.city} (${c.days} nights)`).join(", ") || destination;

  return `You are a hotel expert for Indian travelers. For accommodation in ${citiesStr}:

Budget tier: ${budgetTier} (~₹${budgetPerNight}/night)
Travelers: ${travelers} | Style: ${travelStyle || "comfort"} | Food: ${foodPreference}

For each city, recommend:
1. Best neighborhood to stay (walkable to attractions, safe, well-connected)
2. 3 specific REAL hotel names at the right budget tier with approximate price per night in INR
3. Which booking platform typically has the cheapest rate (Booking.com, Agoda, MakeMyTrip, Goibibo)
4. Whether to pick breakfast-included (worth it in expensive cities, skip in street-food cities)
5. ${tripType === "domestic" ? "Government tourism hotels (MTDC, KTDC etc) if good value. OYO vs Treebo quality in this area." : "Apartment vs hotel recommendation if staying 3+ nights"}

Return JSON:
{
  "cities": [
    {
      "city": "city name",
      "best_neighborhood": "neighborhood name — why it's best",
      "hotels": [
        { "name": "Real Hotel Name", "price_per_night": 5000, "rating": 4.2, "best_platform": "Booking.com", "tip": "Book directly for 10% off" }
      ],
      "breakfast_advice": "Include breakfast — street food isn't great here" or "Skip — amazing street food nearby",
      "insider_tip": "specific local knowledge"
    }
  ]
}`;
}

function buildDiningIntelPrompt(input: AgentRunnerInput): string {
  const { destination, foodPreference, cities, tripType, budget, duration } = input;
  const dailyFoodBudget = Math.round((budget * 0.15) / duration / (input.adults + input.children));
  const citiesStr = cities?.map(c => c.city).join(", ") || destination;

  const vegInstruction = foodPreference === "veg"
    ? "CRITICAL: Traveler is VEGETARIAN. Every restaurant must have substantial vegetarian options. Include at least 1 pure-veg Indian restaurant per day (Saravanaa Bhavan, Sagar, Govinda etc. if they exist in this city). For non-Indian meals, specify which dishes are vegetarian."
    : foodPreference === "nonveg"
    ? "Traveler enjoys non-vegetarian food. Prioritize local meat/seafood specialties."
    : "Traveler eats everything. Mix local specialties with familiar options.";

  return `You are a culinary expert for Indian travelers visiting ${citiesStr}. Daily food budget: ~₹${dailyFoodBudget}/person.

${vegInstruction}

For each city, provide:
1. 5-8 REAL, currently-operating restaurant names
2. Must-try local dishes (specific dish names, not generic categories)
3. Budget eating spots (street food, local markets)
4. ${tripType === "domestic" ? "Famous local dhabas, sweet shops, and street food stalls by name" : "Where to find Indian food if homesick"}
5. Food safety tips specific to this destination

Return JSON:
{
  "cities": [
    {
      "city": "city name",
      "must_try_dishes": ["Dish 1 — what it is", "Dish 2 — what it is"],
      "restaurants": [
        { "name": "Real Restaurant Name", "cuisine": "Local", "price_per_person": 800, "specialty": "Famous for X", "veg_friendly": true, "maps_query": "Restaurant Name city" }
      ],
      "street_food": { "area": "Market/Street name", "highlights": ["Snack 1", "Snack 2"], "budget_per_meal": 200 },
      "indian_food_option": "Restaurant name — serves North/South Indian food",
      "food_safety_tip": "Specific tip for this city"
    }
  ]
}`;
}

function buildActivityIntelPrompt(input: AgentRunnerInput): string {
  const { destination, duration, budget, cities, tripType, interests, travelStyle } = input;
  const activityBudget = Math.round(budget * 0.2);
  const citiesStr = cities?.map(c => `${c.city} (${c.days} days)`).join(", ") || destination;
  const interestsStr = interests?.length ? `Key interests: ${interests.join(", ")}` : "General sightseeing";
  const month = input.startDate ? new Date(input.startDate).toLocaleString("en-US", { month: "long" }) : "any month";

  return `You are a local experiences expert. Plan activities for ${citiesStr} (total budget for activities: ₹${activityBudget.toLocaleString("en-IN")}).

Travel style: ${travelStyle || "comfort"} | ${interestsStr}
Month of visit: ${month}

For each city, provide:
1. Top 5-8 MUST-DO activities/attractions with REAL names and locations
2. Entry fees in INR (convert from local currency)
3. Best time of day to visit each (avoid crowds, best light)
4. Which need advance booking
5. ${tripType === "domestic" ? "Include local experiences: temple visits, market walks, sunrise points, street food tours" : "Include both tourist highlights and off-the-beaten-path experiences"}
6. Group by day with a logical geographical flow (don't zigzag across the city)
7. Opening hours awareness — don't schedule closed attractions

Return JSON:
{
  "cities": [
    {
      "city": "city name",
      "activities": [
        {
          "name": "Real Attraction Name",
          "description": "What to do there, insider tip",
          "duration_hours": 2,
          "entry_fee_inr": 500,
          "best_time": "Morning 8-10 AM to avoid crowds",
          "booking_required": true,
          "booking_url_query": "attraction name tickets official",
          "neighborhood": "Area Name",
          "type": "cultural" | "adventure" | "food" | "shopping" | "nature" | "nightlife"
        }
      ],
      "day_plans": [
        { "day": 1, "theme": "Historic Center", "activity_names": ["Attraction 1", "Attraction 2", "Attraction 3"] }
      ],
      "free_activities": ["Park name — great for evening walks", "Market name — free to explore"],
      "hidden_gem": "A lesser-known spot that's amazing"
    }
  ]
}`;
}

function buildVisaIntelPrompt(input: AgentRunnerInput): string {
  const { destination, startDate } = input;
  const month = startDate ? new Date(startDate).toLocaleString("en-US", { month: "long", year: "numeric" }) : "upcoming";

  // Extract countries from destination
  const countries = destination.includes(",")
    ? destination.split(",").map(c => c.trim())
    : [destination];

  return `You are an Indian passport visa expert. For travel to ${countries.join(", ")} in ${month}:

Provide CURRENT, ACCURATE information:
1. Visa type needed for Indian passport holders (tourist visa, e-visa, visa-on-arrival, visa-free)
2. Current processing time
3. Complete document checklist specific to Indian applicants
4. Where to apply: VFS center cities in India, or online portal URL
5. Approximate visa cost in INR
6. Common rejection reasons to avoid
7. ${countries.length > 1 ? "Do they need separate visas or does one cover all? (e.g., Schengen)" : "Any special conditions or restrictions"}
8. Travel insurance requirement
9. How far in advance to apply

Return JSON:
{
  "countries": [
    {
      "country": "country name",
      "visa_type": "Tourist e-Visa",
      "visa_required": true,
      "visa_on_arrival": false,
      "processing_time": "5-7 business days",
      "cost_inr": 5500,
      "apply_at": "VFS Global — Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad",
      "online_portal": "https://example.com",
      "documents": ["Valid passport (6+ months validity)", "Passport photos", "Bank statements (3 months)", "ITR", "Cover letter", "Hotel booking", "Flight tickets"],
      "common_rejections": ["Insufficient bank balance", "Incomplete documents"],
      "advance_booking": "Apply 3-4 weeks before travel",
      "insurance_required": true,
      "insurance_min_coverage": "€30,000 / $50,000",
      "special_notes": "Schengen visa covers all 27 countries — apply at the embassy of the country where you'll spend most nights"
    }
  ],
  "multi_country_note": "explanation if applicable"
}`;
}

function buildBudgetIntelPrompt(input: AgentRunnerInput): string {
  const { origin, destination, duration, budget, adults, children, tripType, travelStyle, startDate } = input;
  const travelers = adults + children;
  const month = startDate ? new Date(startDate).toLocaleString("en-US", { month: "long" }) : "upcoming months";

  return `You are a travel budget analyst for Indian travelers. Analyze and allocate this budget:

Destination: ${destination} | Duration: ${duration} days | Travelers: ${travelers}
Total budget: ₹${budget.toLocaleString("en-IN")} | From: ${origin} | Style: ${travelStyle || "comfort"}
Trip type: ${tripType} | Month: ${month}

FACTORS TO CONSIDER:
1. Real flight costs from India to ${destination} in ${month}
2. Real hotel costs for ${travelStyle || "mid-range"} accommodation
3. Is this a "flight-heavy" (Maldives) or "activity-heavy" (Japan) destination?
4. ${tripType === "domestic" ? "No flights needed — reallocate to experiences and accommodation" : "International flights are usually the biggest expense"}
5. Currency strength: is INR strong (Southeast Asia) or weak (Europe, US)?
6. Is ${month} peak, shoulder, or off-season for ${destination}?
7. Indian credit card offers currently active for travel bookings

Return JSON:
{
  "allocation": {
    "flights": { "percentage": 30, "amount": 90000, "reasoning": "Why this amount for flights" },
    "hotels": { "percentage": 25, "amount": 75000, "reasoning": "Why this amount for hotels" },
    "food": { "percentage": 15, "amount": 45000, "reasoning": "Why this amount for food" },
    "activities": { "percentage": 15, "amount": 45000, "reasoning": "Why this amount for activities" },
    "local_transport": { "percentage": 10, "amount": 30000, "reasoning": "Why this for local transport" },
    "misc": { "percentage": 5, "amount": 15000, "reasoning": "SIM, forex, tips, emergencies" }
  },
  "season": "peak" | "shoulder" | "off-season",
  "budget_verdict": "comfortable" | "tight" | "generous",
  "warnings": ["Any warnings about budget being too low for this destination"],
  "saving_tips": [
    "Book flights on Tuesday via Skyscanner — typically 10-15% cheaper",
    "Use HDFC SmartBuy for additional 5x reward points",
    "specific actionable tips"
  ],
  "credit_card_tips": [
    "HDFC Infinia: 10x points on SmartBuy travel bookings",
    "specific card offers"
  ]
}`;
}

function buildTransportIntelPrompt(input: AgentRunnerInput): string {
  const { destination, cities, tripType } = input;
  const citiesStr = cities?.map(c => c.city).join(", ") || destination;

  if (tripType === "domestic") {
    return `You are an Indian local transport expert. For getting around ${citiesStr}:

Provide:
1. Ride-hailing: Ola/Uber availability. Other apps (Rapido, Namma Yatri in Bangalore, Meru).
2. Public transit: Metro/local train/bus availability and quality
3. Auto-rickshaws: typical fare structure, negotiation tips
4. Rental: self-drive options (Zoomcar, Revv), bike rentals
5. Inter-city transport if multi-city trip
6. Airport/station transfers: cheapest and fastest options

Return JSON:
{
  "cities": [
    {
      "city": "city name",
      "ride_hailing": { "apps": ["Ola", "Uber"], "available": true, "typical_fare": "₹15-20/km" },
      "public_transit": { "metro": true, "quality": "Excellent — covers most tourist areas", "day_pass": "₹200" },
      "auto_rickshaw": { "typical_fare": "₹30 base + ₹15/km", "tip": "Insist on meter or use Ola Auto" },
      "best_option": "Metro + Ola Auto for last mile",
      "airport_transfer": { "cheapest": "Metro — ₹60, 45 min", "fastest": "Uber — ₹400, 25 min" },
      "daily_transport_budget": 500
    }
  ],
  "inter_city": [
    { "from": "City A", "to": "City B", "best_mode": "Train", "operator": "Vande Bharat Express", "duration": "5h", "cost": 1500 }
  ]
}`;
  }

  return `You are a local transport expert. For getting around ${citiesStr}:

Provide practical transport intelligence for Indian travelers:
1. Airport to city center: cheapest option and fastest option with costs
2. Best transit pass/card to buy and where to buy it
3. Uber/local ride-hailing app name and availability
4. Daily transport budget estimate in INR
5. Inter-city transport if visiting multiple cities
6. Essential transport apps to download

Return JSON:
{
  "cities": [
    {
      "city": "city name",
      "airport_transfer": { "cheapest": "Bus/Metro — cost and time", "fastest": "Taxi/Express — cost and time", "recommended": "which one" },
      "transit_pass": { "name": "Pass name", "cost_inr": 2000, "where_to_buy": "At airport/station", "covers": "Metro + buses for 3 days" },
      "ride_hailing": { "app": "Uber/Grab/Bolt", "available": true, "typical_fare_per_km_inr": 25 },
      "daily_transport_budget_inr": 1500,
      "tip": "specific transport hack for this city"
    }
  ],
  "inter_city": [
    { "from": "City A", "to": "City B", "best_mode": "High-speed train", "operator": "Operator name", "duration": "2h 30m", "cost_inr": 4000, "booking": "Where to book" }
  ],
  "essential_apps": ["App 1 — what it's for", "App 2 — what it's for"]
}`;
}

// Simple distance heuristic for domestic trips
function getDistance(origin: string, destination: string): number {
  // Rough distances between major Indian cities (km)
  const distances: Record<string, Record<string, number>> = {
    mumbai: { delhi: 1400, goa: 590, bangalore: 980, chennai: 1330, kolkata: 2050, jaipur: 1150, manali: 1950, kerala: 1300 },
    delhi: { mumbai: 1400, goa: 1880, bangalore: 2150, chennai: 2180, kolkata: 1500, jaipur: 280, manali: 530, agra: 230 },
    bangalore: { mumbai: 980, delhi: 2150, goa: 560, chennai: 350, kolkata: 1870, kerala: 550, mysore: 150 },
  };
  const o = origin.toLowerCase();
  const d = destination.toLowerCase();
  return distances[o]?.[d] || distances[d]?.[o] || 800;
}

// ─── Main Runner ──────────────────────────────────────────────────────────

export type AgentProgressCallback = (agentId: string, status: "running" | "done", step: string) => void;

export async function runAllAgents(
  input: AgentRunnerInput,
  onProgress?: AgentProgressCallback
): Promise<AllAgentResults> {
  const results: AllAgentResults = {};
  const isDomestic = input.tripType === "domestic";

  // Helper to run an agent with caching and progress updates
  const runAgent = async (
    agentId: string,
    prompt: string,
    temperature: number,
    cacheKey: string
  ): Promise<Record<string, unknown> | null> => {
    onProgress?.(agentId, "running", `Analyzing ${input.destination}...`);

    // Check cache
    const cached = getCached(cacheKey);
    if (cached) {
      onProgress?.(agentId, "done", "Retrieved from cache ✓");
      return cached as Record<string, unknown>;
    }

    const result = await callGeminiAgent(prompt, temperature);
    if (result) {
      setCache(cacheKey, result);
      onProgress?.(agentId, "done", "Analysis complete ✓");
    }
    return result;
  };

  // Wave 1: Budget allocation + Flight/Transport + Visa (parallel)
  const wave1Promises: Promise<void>[] = [];

  // Budget Intelligence (runs first to inform others)
  wave1Promises.push(
    runAgent(
      "deal-agent",
      buildBudgetIntelPrompt(input),
      0.5,
      `budget:${input.destination}:${input.budget}:${input.duration}:${input.tripType}`
    ).then(data => { if (data) results.budgetIntel = data; })
  );

  // Flight Intelligence
  wave1Promises.push(
    runAgent(
      "flight-agent",
      buildFlightIntelPrompt(input),
      0.5,
      `flight:${input.origin}:${input.destination}:${input.startDate || "any"}`
    ).then(data => { if (data) results.flightIntel = data; })
  );

  // Visa Intelligence (skip for domestic)
  if (!isDomestic) {
    wave1Promises.push(
      runAgent(
        "visa-agent",
        buildVisaIntelPrompt(input),
        0.3,
        `visa:${input.destination}`
      ).then(data => { if (data) results.visaIntel = data; })
    );
  }

  await Promise.all(wave1Promises);

  // Wave 2: Hotels + Dining + Activities (depend on destination intel)
  const wave2Promises: Promise<void>[] = [];

  wave2Promises.push(
    runAgent(
      "hotel-agent",
      buildHotelIntelPrompt(input),
      0.5,
      `hotel:${input.destination}:${input.budget}:${input.travelStyle || "comfort"}`
    ).then(data => { if (data) results.hotelIntel = data; })
  );

  wave2Promises.push(
    runAgent(
      "dining-agent",
      buildDiningIntelPrompt(input),
      0.6,
      `dining:${input.destination}:${input.foodPreference}`
    ).then(data => { if (data) results.diningIntel = data; })
  );

  wave2Promises.push(
    runAgent(
      "activity-agent",
      buildActivityIntelPrompt(input),
      0.6,
      `activity:${input.destination}:${input.interests?.join(",") || "general"}`
    ).then(data => { if (data) results.activityIntel = data; })
  );

  await Promise.all(wave2Promises);

  // Wave 3: Transport (depends on hotel locations)
  results.transportIntel = await runAgent(
    "transport-agent",
    buildTransportIntelPrompt(input),
    0.5,
    `transport:${input.destination}:${input.tripType}`
  ) || undefined;

  return results;
}
