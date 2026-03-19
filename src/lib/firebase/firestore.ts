// ─── Firestore Data Layer ─────────────────────────────────────────────────
// CRUD helpers for all collections. Used by API routes (server-side via Admin SDK)
// and client components (via client SDK).
//
// Collections:
//   users/{uid}                    → user profiles
//   users/{uid}/trips/{tripId}     → user's trips (subcollection)
//   shared-trips/{shareSlug}       → public trip index (pointers)
//   affiliate-clicks/{autoId}      → click tracking
//   feedback/{autoId}              → user feedback

import { getAdminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

// ─── Types ────────────────────────────────────────────────────────────────

export interface Profile {
  email: string;
  name: string | null;
  currency: string;
  country: string;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  tripsCreated: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Trip {
  id: string;
  userId: string;
  status: "draft" | "planned" | "shared" | "archived";
  title: string | null;
  origin: string;
  destinations: unknown;
  startDate: string;
  endDate: string;
  travelers: number;
  rooms: number;
  budget: unknown;
  currency: string;
  preferences: unknown;
  routePlan: unknown;
  itinerary: unknown;
  selectedFlights: unknown;
  selectedHotels: unknown;
  selectedActivities: unknown;
  shareSlug: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface NewTrip {
  origin: string;
  destinations: unknown;
  startDate: string;
  endDate: string;
  travelers?: number;
  rooms?: number;
  budget?: unknown;
  currency?: string;
  preferences?: unknown;
  routePlan?: unknown;
  itinerary?: unknown;
  selectedFlights?: unknown;
  selectedHotels?: unknown;
  selectedActivities?: unknown;
  title?: string;
}

export interface AffiliateClick {
  tripId: string;
  userId: string;
  provider: string;
  category: "flight" | "hotel" | "activity" | "insurance" | "train";
  label?: string;
  destinationUrl: string;
  referrerPage?: string;
  clickedAt: FirebaseFirestore.Timestamp;
}

export interface FeedbackEntry {
  tripId: string;
  userId: string;
  rating: number;
  feedbackText?: string;
  issues?: string[];
  createdAt: FirebaseFirestore.Timestamp;
}

// ─── Profiles ─────────────────────────────────────────────────────────────

export async function getProfile(uid: string): Promise<Profile | null> {
  const db = getAdminDb();
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? (snap.data() as Profile) : null;
}

export async function createProfile(uid: string, data: Partial<Profile>) {
  const db = getAdminDb();
  await db.collection("users").doc(uid).set(
    {
      email: data.email || "",
      name: data.name || null,
      currency: data.currency || "INR",
      country: data.country || "IN",
      isPremium: false,
      premiumExpiresAt: null,
      tripsCreated: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ...data,
    },
    { merge: true }
  );
}

// ─── Trips ────────────────────────────────────────────────────────────────

export async function getUserTrips(uid: string): Promise<Trip[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("users")
    .doc(uid)
    .collection("trips")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    userId: uid,
    ...(doc.data() as Omit<Trip, "id" | "userId">),
  }));
}

export async function createTrip(uid: string, data: NewTrip): Promise<Trip> {
  const db = getAdminDb();
  const slug = `${data.origin.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

  const tripData = {
    userId: uid,
    status: "planned" as const,
    title: data.title || null,
    origin: data.origin,
    destinations: data.destinations,
    startDate: data.startDate,
    endDate: data.endDate,
    travelers: data.travelers || 1,
    rooms: data.rooms || 1,
    budget: data.budget || null,
    currency: data.currency || "INR",
    preferences: data.preferences || null,
    routePlan: data.routePlan || null,
    itinerary: data.itinerary || null,
    selectedFlights: data.selectedFlights || null,
    selectedHotels: data.selectedHotels || null,
    selectedActivities: data.selectedActivities || null,
    shareSlug: slug,
    isPublic: false,
    viewCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("users").doc(uid).collection("trips").add(tripData);

  // Create shared-trips index doc for slug lookup
  await db.collection("shared-trips").doc(slug).set({
    userId: uid,
    tripId: ref.id,
  });

  return {
    id: ref.id,
    ...tripData,
    createdAt: null as unknown as FirebaseFirestore.Timestamp,
    updatedAt: null as unknown as FirebaseFirestore.Timestamp,
  };
}

export async function getTrip(uid: string, tripId: string): Promise<Trip | null> {
  const db = getAdminDb();
  const snap = await db
    .collection("users")
    .doc(uid)
    .collection("trips")
    .doc(tripId)
    .get();

  if (!snap.exists) return null;

  return {
    id: snap.id,
    userId: uid,
    ...(snap.data() as Omit<Trip, "id" | "userId">),
  };
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  const db = getAdminDb();

  // Look up the index doc
  const indexSnap = await db.collection("shared-trips").doc(slug).get();
  if (!indexSnap.exists) return null;

  const { userId, tripId } = indexSnap.data() as { userId: string; tripId: string };

  // Fetch the actual trip
  const tripSnap = await db
    .collection("users")
    .doc(userId)
    .collection("trips")
    .doc(tripId)
    .get();

  if (!tripSnap.exists) return null;

  return {
    id: tripSnap.id,
    userId,
    ...(tripSnap.data() as Omit<Trip, "id" | "userId">),
  };
}

export async function updateTrip(
  uid: string,
  tripId: string,
  data: Partial<Omit<Trip, "id" | "userId" | "createdAt">>
): Promise<Trip | null> {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid).collection("trips").doc(tripId);

  const snap = await ref.get();
  if (!snap.exists) return null;

  await ref.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  return {
    id: updated.id,
    userId: uid,
    ...(updated.data() as Omit<Trip, "id" | "userId">),
  };
}

export async function deleteTrip(uid: string, tripId: string): Promise<boolean> {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid).collection("trips").doc(tripId);

  const snap = await ref.get();
  if (!snap.exists) return false;

  // Clean up shared-trips index
  const tripData = snap.data();
  if (tripData?.shareSlug) {
    await db.collection("shared-trips").doc(tripData.shareSlug).delete();
  }

  await ref.delete();
  return true;
}

export async function incrementViewCount(uid: string, tripId: string) {
  const db = getAdminDb();
  await db
    .collection("users")
    .doc(uid)
    .collection("trips")
    .doc(tripId)
    .update({
      viewCount: FieldValue.increment(1),
    });
}

// ─── Affiliate Clicks ─────────────────────────────────────────────────────

export async function logAffiliateClick(data: Omit<AffiliateClick, "clickedAt">) {
  const db = getAdminDb();
  await db.collection("affiliate-clicks").add({
    ...data,
    clickedAt: FieldValue.serverTimestamp(),
  });
}

// ─── Feedback ─────────────────────────────────────────────────────────────

export async function createFeedback(data: Omit<FeedbackEntry, "createdAt">) {
  const db = getAdminDb();
  await db.collection("feedback").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
}
