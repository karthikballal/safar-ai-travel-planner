import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchHotels } from "@/lib/travelProviders";
import { buildCacheControlHeader } from "@/lib/cache/redis";

const hotelSearchSchema = z.object({
  cities: z.array(
    z.object({
      city: z.string().min(1),
      checkIn: z.string().min(1),
      checkOut: z.string().min(1),
    })
  ).min(1),
  rooms: z.coerce.number().min(1).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = hotelSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await searchHotels(parsed.data);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": buildCacheControlHeader(21600),
      },
    });
  } catch (error) {
    console.error("[Hotels API] Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch hotel availability right now. Please try again shortly." },
      { status: 502 }
    );
  }
}
