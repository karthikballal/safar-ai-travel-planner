import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchActivities } from "@/lib/travelProviders";
import { buildCacheControlHeader } from "@/lib/cache/redis";

const activitiesSearchSchema = z.object({
  cities: z.array(
    z.object({
      city: z.string().min(1),
      days: z.coerce.number().min(1),
    })
  ).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = activitiesSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await searchActivities(parsed.data);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": buildCacheControlHeader(21600),
      },
    });
  } catch (error) {
    console.error("[Activities API] Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch attraction data right now. Please try again shortly." },
      { status: 502 }
    );
  }
}
