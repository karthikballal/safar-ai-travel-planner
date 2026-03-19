// ─── Trips API: List + Create ──────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getUserTrips, createTrip } from "@/lib/firebase/firestore";
import { z } from "zod";

const CreateTripSchema = z.object({
  origin: z.string().min(1),
  destinations: z.any(),
  startDate: z.string(),
  endDate: z.string(),
  travelers: z.number().optional(),
  rooms: z.number().optional(),
  budget: z.any().optional(),
  currency: z.string().optional(),
  preferences: z.any().optional(),
  routePlan: z.any().optional(),
  itinerary: z.any().optional(),
  selectedFlights: z.any().optional(),
  selectedHotels: z.any().optional(),
  selectedActivities: z.any().optional(),
  title: z.string().optional(),
});

// GET /api/trips — list user's trips
export async function GET(req: NextRequest) {
  const auth = await verifyAuthToken(req);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trips = await getUserTrips(auth.uid);
  return NextResponse.json({ trips });
}

// POST /api/trips — create a new trip
export async function POST(req: NextRequest) {
  const auth = await verifyAuthToken(req);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const newTrip = await createTrip(auth.uid, parsed.data);
  return NextResponse.json({ trip: newTrip }, { status: 201 });
}
