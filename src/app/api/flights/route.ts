// ─── Amadeus Flight Search API ─────────────────────────────────────────────
// Real flight search via Amadeus Self-Service API.
// Returns structured flight offers for outbound + inbound.
// Falls back gracefully when Amadeus is not configured.

import { NextRequest, NextResponse } from "next/server";
import { searchFlights, isAmadeusConfigured, resolveIATA } from "@/lib/amadeus";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin") || "bengaluru";
  const destination = searchParams.get("destination") || "paris";
  const departDate = searchParams.get("depart");     // YYYY-MM-DD
  const returnDate = searchParams.get("return");      // YYYY-MM-DD
  const adults = parseInt(searchParams.get("adults") || "1");

  if (!departDate) {
    return NextResponse.json(
      { error: "Missing required 'depart' parameter (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departDate)) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD" },
      { status: 400 }
    );
  }

  if (returnDate && !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
    return NextResponse.json(
      { error: "Invalid return date format. Use YYYY-MM-DD" },
      { status: 400 }
    );
  }

  if (isNaN(adults) || adults < 1 || adults > 9) {
    return NextResponse.json(
      { error: "Adults must be between 1 and 9" },
      { status: 400 }
    );
  }

  const result = await searchFlights(
    origin,
    destination,
    departDate,
    returnDate || undefined,
    adults
  );

  return NextResponse.json({
    origin: resolveIATA(origin),
    destination: resolveIATA(destination),
    departDate,
    returnDate,
    adults,
    configured: isAmadeusConfigured(),
    ...result,
  });
}
