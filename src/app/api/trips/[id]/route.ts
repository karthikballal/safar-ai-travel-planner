// ─── Single Trip API: Get / Update / Delete ───────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import {
  getTrip,
  getTripBySlug,
  updateTrip,
  deleteTrip,
  incrementViewCount,
} from "@/lib/firebase/firestore";

// GET /api/trips/[id] — get by trip ID or share slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try by UUID first (Firebase doc IDs are alphanumeric, not UUIDs,
  // but we keep the pattern: if it looks like a slug, use slug lookup)
  const isDocId = /^[a-zA-Z0-9]{20}$/.test(id);

  if (isDocId) {
    // Direct doc ID — needs auth to verify ownership
    const auth = await verifyAuthToken(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await getTrip(auth.uid, id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  }

  // Slug lookup — public access
  const trip = await getTripBySlug(id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Increment view count for public trips
  if (trip.isPublic) {
    incrementViewCount(trip.userId, trip.id).catch(() => {});
  }

  return NextResponse.json({ trip });
}

// PUT /api/trips/[id] — update trip
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyAuthToken(req);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updated = await updateTrip(auth.uid, id, body);

  if (!updated) {
    return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json({ trip: updated });
}

// DELETE /api/trips/[id] — delete trip
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyAuthToken(_req);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteTrip(auth.uid, id);

  if (!deleted) {
    return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
