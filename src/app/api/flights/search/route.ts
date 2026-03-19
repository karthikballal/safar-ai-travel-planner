import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchFlights } from "@/lib/travelProviders";
import { buildCacheControlHeader } from "@/lib/cache/redis";

const flightSearchSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  departDate: z.string().min(1),
  returnDate: z.string().min(1),
  adults: z.coerce.number().min(1).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = flightSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await searchFlights(parsed.data);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": buildCacheControlHeader(900),
      },
    });
  } catch (error) {
    console.error("[Flights API] Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch live flight options right now. Please try again shortly." },
      { status: 502 }
    );
  }
}
