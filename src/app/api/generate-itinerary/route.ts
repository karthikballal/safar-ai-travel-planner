import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const generateItinerarySchema = z.object({
    destination: z.string(),
    duration: z.number(),
    budget: z.number(),
    travelers: z.number(),
    foodPreference: z.string(),
    travelStyle: z.string().optional(),
    interests: z.array(z.string()).optional(),
    startDate: z.string().optional(),
    tripType: z.string().optional(),
    cities: z.array(z.object({
        city: z.string(),
        days: z.number()
    }))
});

// Define the output schema matching DayPlan[]
const itineraryOutputSchema = z.object({
    itinerary: z.array(z.object({
        day: z.number(),
        date: z.string(),
        title: z.string(),
        city: z.string().optional(),
        country: z.string().optional(),
        activities: z.object({
            morning: z.array(z.object({
                time: z.string(),
                title: z.string(),
                description: z.string(),
                type: z.enum(["sightseeing", "dining", "transport", "leisure", "culture"]),
                cost: z.number(),
                isVeg: z.boolean().optional(),
                transitFromPrev: z.string().optional(),
                bookingRequired: z.boolean().optional(),
            })),
            afternoon: z.array(z.object({
                time: z.string(),
                title: z.string(),
                description: z.string(),
                type: z.enum(["sightseeing", "dining", "transport", "leisure", "culture"]),
                cost: z.number(),
                isVeg: z.boolean().optional(),
                transitFromPrev: z.string().optional(),
                bookingRequired: z.boolean().optional(),
            })),
            evening: z.array(z.object({
                time: z.string(),
                title: z.string(),
                description: z.string(),
                type: z.enum(["sightseeing", "dining", "transport", "leisure", "culture"]),
                cost: z.number(),
                isVeg: z.boolean().optional(),
                transitFromPrev: z.string().optional(),
                bookingRequired: z.boolean().optional(),
            })),
        })
    }))
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = generateItinerarySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
        }

        const { destination, duration, budget, travelers, foodPreference, cities, travelStyle, interests, startDate, tripType } = parsed.data;
        const isDomestic = tripType === "domestic";

        // Calculate the actual month of travel for seasonal awareness
        const travelDate = startDate ? new Date(startDate) : new Date();
        const monthName = travelDate.toLocaleString("en-US", { month: "long" });
        const dayOfWeek = travelDate.toLocaleString("en-US", { weekday: "long" });

        // Build personalization context
        const styleContext = travelStyle
            ? `Travel Style: ${travelStyle} — ${
                travelStyle === "backpacker" ? "max 2-3 budget activities/day, street food, free attractions, hostels" :
                travelStyle === "luxury" ? "5-star dining, private tours, skip-the-line, rooftop bars, spa" :
                travelStyle === "adventure" ? "hiking, water sports, outdoor activities, off-beaten-path" :
                travelStyle === "cultural" ? "deep-dive museums (3+ hours), local workshops, historical tours" :
                travelStyle === "romantic" ? "sunset spots, couples activities, fine dining, scenic walks" :
                travelStyle === "family" ? "kid-friendly attractions, no activities after 8 PM, stroller-accessible" :
                "balanced mix of sightseeing, dining, and relaxation"
            }`
            : "Travel Style: Comfort (balanced)";

        const interestsContext = interests?.length
            ? `Key Interests: ${interests.join(", ")} — prioritize activities matching these interests`
            : "";

        const domesticContext = isDomestic
            ? `\nINDIA-SPECIFIC RULES:
- Use REAL Indian restaurant/dhaba names (e.g., "Bademiya", "Karim's", "Saravanaa Bhavan")
- Include specific local markets, temples, beaches, forts by EXACT names
- Mention specific trains (Vande Bharat, Rajdhani, Shatabdi) for intercity travel
- Include auto-rickshaw, metro, local train details for local transport
- Consider monsoon (Jun-Sep), extreme heat (Apr-Jun), winter chill (Nov-Feb)
- Mention UPI payments, local apps (Ola, Uber, Rapido)
- NO visa information — this is a domestic trip`
            : "";

        const prompt = `You are an elite local travel expert who has lived in ${destination} for 20 years. Generate a MINUTE-LEVEL optimized day-by-day itinerary.

CONTEXT:
- Route: ${cities.map(c => `${c.city} (${c.days} days)`).join(" -> ")}
- ${travelers} travelers, Budget: ₹${budget.toLocaleString("en-IN")} total
- Food: ${foodPreference}
- ${styleContext}
- ${interestsContext}
- Start date: ${startDate || "upcoming"} (${dayOfWeek}), Month: ${monthName}
- Trip type: ${isDomestic ? "Domestic (India)" : "International"}
${domesticContext}

CRITICAL INTELLIGENCE RULES:
1. TRAVEL TIME BETWEEN STOPS: Every activity MUST account for realistic transit time FROM the previous location. If Museum ends at 1:00 PM and lunch is 30 min away, lunch starts at 1:45 PM (including walking + transit wait), NOT 1:00 PM.

2. OPENING HOURS AWARENESS: Never schedule a museum/attraction on its closing day.
   - Most European museums: closed Mondays
   - Markets: specific days only (e.g., Chatuchak = weekends)
   - Temples: may close 12-4 PM

3. GEOGRAPHICAL CLUSTERING: Group activities by neighborhood to minimize transit. Never zigzag across the city. Morning in area A, afternoon in adjacent area B.

4. ENERGY CURVE: High-energy activities (walks, hikes) in the morning. Indoor/seated (museums, cafes) in early afternoon. Evening for dining and lighter exploration.

5. WEATHER AWARENESS for ${monthName}:
   - If monsoon/rainy season: have indoor backup plans
   - If extreme heat: avoid outdoor activities between 12-3 PM
   - Schedule outdoor photography at golden hour

6. EVERY place must be REAL and currently operating. NO generic names like "Local Restaurant" or "City Tour". Use EXACT names: "Cafe Lomi", "Tsukiji Outer Market", "Baga Beach".

7. Include transit info in descriptions: "Take Metro Line 1 from X to Y (15 min)" or "10 min walk from previous stop".

8. All costs in INR. Dining costs must respect the food preference.

9. For each activity, note if advance booking is required (true/false).`;

        // Use Gemini 2.0 Flash (free tier, faster) instead of 1.5 Pro
        const { object } = await generateObject({
            model: google("gemini-2.0-flash"),
            schema: itineraryOutputSchema,
            prompt,
            temperature: 0.3,
        });

        return NextResponse.json({ success: true, itinerary: object.itinerary });
    } catch (error) {
        console.error("[generate-itinerary API] Error:", error);
        return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 });
    }
}
