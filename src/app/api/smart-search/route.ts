// ─── AI Smart Search API ────────────────────────────────────────────────────
// Natural language travel query processor using Gemini AI.
// Extracts trip parameters from free-text queries like:
//   "Plan a trip to Bali for 10 days"
//   "I want to go to Goa with family in December"
//   "Budget trip to Thailand under 50000"
// Returns structured trip parameters or a friendly response for non-travel queries.

import { NextRequest, NextResponse } from "next/server";

export interface SmartSearchResult {
  type: "travel" | "non_travel";
  // For travel queries:
  destination?: string;
  duration?: number;
  budget?: number;
  tripType?: "domestic" | "international";
  travelers?: number;
  children?: number;
  foodPreference?: string;
  startDate?: string;
  message: string;
  suggestions?: string[];
}

function buildSmartSearchPrompt(query: string): string {
  return `You are an intelligent travel assistant for Safar AI, an Indian travel planning platform.

A user has typed the following query: "${query}"

TASK: Analyze this query and determine if it's travel-related.

IF TRAVEL-RELATED:
Extract as many trip parameters as possible. Be smart about understanding Indian context:
- "Goa", "Manali", "Kerala", "Jaipur", "Leh", "Andaman" = domestic Indian destinations
- "Bali", "Dubai", "Thailand", "Europe", "Japan" = international destinations
- "family trip" = 2 adults + 2 children typically
- "honeymoon" / "couple" = 2 adults
- "solo" = 1 adult
- "budget trip" = around ₹15,000-25,000 per person
- "luxury" = ₹50,000+ per person
- "mid-range" = ₹25,000-50,000 per person
- If no duration mentioned, suggest 5 days for domestic, 7 days for international
- If budget mentioned in thousands like "50k" or "50000", interpret as INR
- Understand date references: "December", "next month", "summer vacation", "Diwali break", "Christmas"
- "veg" / "vegetarian" / "pure veg" = vegetarian food preference
- "non-veg" = non-vegetarian

IF NOT TRAVEL-RELATED:
Return a friendly, witty response that gently redirects to travel planning. Keep it conversational.

RESPOND WITH ONLY valid JSON:
{
  "type": "travel" or "non_travel",
  "destination": "extracted destination or null",
  "duration": number of days or null,
  "budget": total budget in INR or null,
  "tripType": "domestic" or "international" or null,
  "travelers": number of adults or null,
  "children": number of children or null,
  "foodPreference": "any" or "vegetarian" or "non-veg" or null,
  "startDate": "YYYY-MM-DD" or null,
  "message": "A friendly, helpful message summarizing what you understood. For travel: confirm the extracted params. For non-travel: a witty redirect message.",
  "suggestions": ["2-3 follow-up suggestions if travel-related, like similar destinations or tips"]
}

Return ONLY the JSON, no markdown code fences.`;
}

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
            temperature: 0.5,
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

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({
        type: "non_travel",
        message: "Tell me where you'd like to go! Try something like 'Plan a trip to Bali' or 'Budget trip to Goa for 5 days'.",
        suggestions: ["Plan a trip to Goa", "Family trip to Dubai", "Budget trip to Thailand"],
      } as SmartSearchResult);
    }

    const prompt = buildSmartSearchPrompt(query.trim());
    const result = await callGemini(prompt);

    if (!result) {
      // Fallback: basic keyword extraction
      return NextResponse.json(basicExtraction(query));
    }

    const parsed: SmartSearchResult = JSON.parse(result);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      type: "non_travel",
      message: "I'd love to help you plan a trip! Try something like 'Trip to Manali for 5 days' or 'Honeymoon in Maldives'.",
      suggestions: ["Trip to Goa", "Family vacation in Kerala", "Solo trip to Thailand"],
    } as SmartSearchResult);
  }
}

// Basic fallback extraction without AI
function basicExtraction(query: string): SmartSearchResult {
  const q = query.toLowerCase();
  const destinations = [
    { names: ["goa"], type: "domestic" as const },
    { names: ["manali", "shimla", "himachal"], type: "domestic" as const },
    { names: ["kerala", "munnar", "alleppey"], type: "domestic" as const },
    { names: ["jaipur", "rajasthan", "udaipur", "jodhpur"], type: "domestic" as const },
    { names: ["ladakh", "leh"], type: "domestic" as const },
    { names: ["andaman", "nicobar"], type: "domestic" as const },
    { names: ["rishikesh", "haridwar"], type: "domestic" as const },
    { names: ["bali", "indonesia"], type: "international" as const },
    { names: ["dubai", "abu dhabi", "uae"], type: "international" as const },
    { names: ["thailand", "bangkok", "phuket", "pattaya"], type: "international" as const },
    { names: ["japan", "tokyo", "osaka", "kyoto"], type: "international" as const },
    { names: ["europe", "paris", "london", "rome", "italy", "france"], type: "international" as const },
    { names: ["maldives"], type: "international" as const },
    { names: ["singapore"], type: "international" as const },
    { names: ["sri lanka", "colombo"], type: "international" as const },
    { names: ["vietnam", "hanoi"], type: "international" as const },
  ];

  let destination: string | undefined;
  let tripType: "domestic" | "international" | undefined;

  for (const d of destinations) {
    for (const name of d.names) {
      if (q.includes(name)) {
        destination = name.charAt(0).toUpperCase() + name.slice(1);
        tripType = d.type;
        break;
      }
    }
    if (destination) break;
  }

  // Extract duration
  const durationMatch = q.match(/(\d+)\s*(?:days?|nights?)/);
  const duration = durationMatch ? parseInt(durationMatch[1], 10) : undefined;

  // Extract budget
  const budgetMatch = q.match(/(\d+)\s*(?:k|thousand|lakh|l)/i);
  let budget: number | undefined;
  if (budgetMatch) {
    const num = parseInt(budgetMatch[1], 10);
    if (q.includes("lakh") || q.includes("l")) budget = num * 100000;
    else budget = num * 1000;
  }

  if (destination) {
    return {
      type: "travel",
      destination,
      duration: duration || (tripType === "domestic" ? 5 : 7),
      budget,
      tripType,
      message: `Great choice! Let me help you plan a trip to ${destination}${duration ? ` for ${duration} days` : ""}${budget ? ` within ₹${budget.toLocaleString("en-IN")}` : ""}.`,
      suggestions: [],
    };
  }

  return {
    type: "non_travel",
    message: "I'm your AI travel assistant! Tell me where you'd like to go. Try 'Plan a trip to Goa' or 'Budget vacation in Bali for 7 days'.",
    suggestions: ["Trip to Goa", "Family trip to Dubai", "Solo trip to Thailand"],
  };
}
