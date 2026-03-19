// ─── AI Route Planner API ──────────────────────────────────────────────────
// POST /api/ai-planner
// Generates intelligent multi-city itineraries using Gemini/OpenAI/fallback.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIRoutePlan, generateRouteAlternatives } from "@/lib/aiPlanner";

const aiPlannerSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
  budget: z.coerce.number().min(0, "Budget cannot be negative"),
  adults: z.coerce.number().min(1).default(2),
  children: z.coerce.number().min(0).default(0),
  foodPreference: z.enum(["any", "veg", "nonveg"]).default("any"),
  mode: z.enum(["single", "alternatives"]).default("single"),
  preferredArrivalCity: z.string().optional(),
  tripType: z.enum(["domestic", "international"]).default("international"),
  selectedCities: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aiPlannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      origin,
      destination,
      duration,
      budget,
      adults,
      children,
      foodPreference,
      mode,
      preferredArrivalCity,
      tripType,
      selectedCities,
    } = parsed.data;

    if (mode === "alternatives") {
      const alternatives = await generateRouteAlternatives({
        origin,
        destination,
        duration: Number(duration),
        budget: Number(budget),
        adults: Number(adults),
        children: Number(children),
        foodPreference,
      });

      return NextResponse.json({
        success: true,
        alternatives,
        count: alternatives.length,
      });
    }

    // Single route generation
    const { plan, source } = await generateAIRoutePlan({
      origin,
      destination,
      duration: Number(duration),
      budget: Number(budget),
      adults: Number(adults),
      children: Number(children),
      foodPreference,
      preferredArrivalCity,
      tripType,
      selectedCities,
    });

    return NextResponse.json({
      success: true,
      plan,
      source,
    });
  } catch (error) {
    console.error("[AI Planner API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate route plan" },
      { status: 500 }
    );
  }
}
