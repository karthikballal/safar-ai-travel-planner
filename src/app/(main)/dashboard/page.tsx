"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { authFetch } from "@/lib/firebase/api";
import { Plane, MapPin, Calendar, ChevronRight, Loader2 } from "lucide-react";

interface TripSummary {
  id: string;
  origin: string;
  destinations: { name: string }[];
  startDate: string | null;
  endDate: string | null;
  status: string;
  shareSlug: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    authFetch("/api/trips")
      .then((r) => r.json())
      .then((data) => setTrips(data.trips ?? []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <Plane size={40} className="mx-auto text-primary-400" />
        <h2 className="mt-4 text-xl font-bold text-text-primary">Sign in to see your trips</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Create an account to save and manage your travel plans.
        </p>
        <Link
          href="/plan"
          className="btn-primary mt-6 inline-flex items-center gap-2"
        >
          Start Planning
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <h1 className="font-display text-2xl font-bold text-text-primary">My Trips</h1>
      <p className="mt-1 text-sm text-text-secondary">Your saved travel plans</p>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : trips.length === 0 ? (
        <div className="mt-12 text-center">
          <MapPin size={36} className="mx-auto text-text-muted" />
          <p className="mt-3 text-sm text-text-secondary">No trips yet. Plan your first adventure!</p>
          <Link href="/plan" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
            Plan a Trip
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={trip.shareSlug ? `/trip/${trip.shareSlug}` : `/plan`}
              className="card flex items-center gap-4 p-4 transition-transform hover:scale-[1.005]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
                <Plane size={18} className="text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {trip.origin} &rarr; {trip.destinations.map((d) => d.name).join(", ")}
                </p>
                {trip.startDate && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                    <Calendar size={12} />
                    {new Date(trip.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
