"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Globe, Luggage } from "lucide-react";

/**
 * Semi-dynamic stats counter for social proof.
 * Uses a base number + calculated increment based on the current date
 * so it grows naturally over time without needing a database.
 */
function getTripsThisWeek(): number {
  const now = new Date();
  // Base trips per week
  const base = 120;
  // Day of week adds variance (Mon=1 .. Sun=7 mapped to 0..6)
  const dayOfWeek = now.getDay();
  // Week number in year for gradual growth
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7
  );
  // Hour adds intraday variance
  const hour = now.getHours();
  const hourBoost = Math.floor(hour / 3) * 2;

  return base + weekNumber * 3 + dayOfWeek * 4 + hourBoost;
}

export default function SocialProof() {
  const [trips, setTrips] = useState<number | null>(null);

  useEffect(() => {
    setTrips(getTripsThisWeek());
  }, []);

  // Avoid hydration mismatch by rendering placeholder on server
  const displayTrips = trips !== null ? trips : 142;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border bg-gradient-to-r from-primary-50/80 to-primary-100/40 px-5 py-3 text-xs text-text-secondary sm:gap-5 sm:text-sm">
        <span className="flex items-center gap-1.5">
          <Luggage size={14} className="text-primary-600" />
          <span className="font-semibold text-text-primary">{displayTrips}</span>{" "}
          trips planned this week
        </span>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <span className="flex items-center gap-1.5">
          <Globe size={14} className="text-primary-600" />
          <span className="font-semibold text-text-primary">14</span> destinations
        </span>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <span className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary-600" />
          AI-powered intelligence
        </span>
      </div>
    </div>
  );
}
