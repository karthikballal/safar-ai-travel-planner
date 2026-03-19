// ─── Real AI Agent Intelligence API ─────────────────────────────────────────
// POST /api/agent-intel
// Runs all 7 AI agents with real Gemini calls and returns combined intelligence.
// Called after route planning, runs in parallel waves for speed.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAllAgents, type AgentRunnerInput } from "@/lib/agentRunner";

const schema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  duration: z.coerce.number().min(1),
  budget: z.coerce.number().min(0),
  adults: z.coerce.number().min(1).default(2),
  children: z.coerce.number().min(0).default(0),
  foodPreference: z.enum(["any", "veg", "nonveg"]).default("any"),
  tripType: z.enum(["domestic", "international"]).default("international"),
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  cities: z.array(z.object({
    city: z.string(),
    days: z.coerce.number(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const input: AgentRunnerInput = {
      origin: parsed.data.origin,
      destination: parsed.data.destination,
      duration: parsed.data.duration,
      budget: parsed.data.budget,
      adults: parsed.data.adults,
      children: parsed.data.children,
      foodPreference: parsed.data.foodPreference,
      tripType: parsed.data.tripType,
      travelStyle: parsed.data.travelStyle,
      interests: parsed.data.interests,
      startDate: parsed.data.startDate,
      cities: parsed.data.cities,
    };

    const results = await runAllAgents(input);

    return NextResponse.json({
      success: true,
      intelligence: results,
      agentCount: Object.keys(results).filter(k => results[k as keyof typeof results] != null).length,
    });
  } catch (error) {
    console.error("[Agent Intel API] Error:", error);
    return NextResponse.json(
      { error: "Agent intelligence failed" },
      { status: 500 }
    );
  }
}
