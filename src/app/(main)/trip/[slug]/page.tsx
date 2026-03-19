import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plane, MapPin, Calendar, Clock, IndianRupee } from "lucide-react";
import AffiliateDisclosure from "@/components/affiliate/AffiliateDisclosure";
import TripShareButtons from "@/components/TripShareButtons";

interface TripData {
  id: string;
  origin: string;
  destinations: { name: string }[];
  startDate: string | null;
  endDate: string | null;
  budget: { total: number; currency: string } | null;
  itinerary: Record<string, unknown> | null;
  viewCount: number;
}

async function getTrip(slug: string): Promise<TripData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/trips/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.trip ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) return { title: "Trip Not Found" };

  const destinations = trip.destinations.map((d) => d.name).join(", ");
  return {
    title: `Trip to ${destinations}`,
    description: `${trip.origin} to ${destinations} — planned with Safar AI`,
  };
}

export default async function TripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) notFound();

  const destinations = trip.destinations.map((d) => d.name).join(", ");

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="card p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
            <Plane size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">
              {trip.origin} &rarr; {destinations}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-secondary">
              {trip.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(trip.startDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {trip.endDate && (
                    <>
                      {" — "}
                      {new Date(trip.endDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                      })}
                    </>
                  )}
                </span>
              )}
              {trip.budget && (
                <span className="flex items-center gap-1">
                  <IndianRupee size={14} />
                  {trip.budget.total.toLocaleString("en-IN")} {trip.budget.currency}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Destinations */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-text-primary">Destinations</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {trip.destinations.map((d) => (
              <span
                key={d.name}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
              >
                <MapPin size={12} />
                {d.name}
              </span>
            ))}
          </div>
        </div>

        {/* Itinerary summary */}
        {trip.itinerary && (
          <div className="mt-6 rounded-xl bg-primary-50/50 p-4">
            <h2 className="text-sm font-semibold text-text-primary">Trip Itinerary</h2>
            <p className="mt-2 text-xs text-text-secondary">
              This trip was planned with Safar AI — 7 AI agents researched flights, hotels, and activities to build this itinerary.
            </p>
            <Link
              href="/plan"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              <Plane size={12} />
              Plan a similar trip
            </Link>
          </div>
        )}

        {/* Share buttons */}
        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold text-text-secondary">Share this trip</p>
          <TripShareButtons destination={destinations} slug={slug} />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {trip.viewCount} views
          </span>
        </div>
      </div>

      <div className="mt-4">
        <AffiliateDisclosure />
      </div>
    </div>
  );
}
