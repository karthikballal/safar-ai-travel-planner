"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Globe, Luggage, Star, TrendingUp, Users } from "lucide-react";

/**
 * Semi-dynamic stats counter for social proof.
 * Uses a base number + calculated increment based on the current date
 * so it grows naturally over time without needing a database.
 */
function getTripsThisWeek(): number {
  const now = new Date();
  const base = 120;
  const dayOfWeek = now.getDay();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) +
      startOfYear.getDay() +
      1) /
      7
  );
  const hour = now.getHours();
  const hourBoost = Math.floor(hour / 3) * 2;
  return base + weekNumber * 3 + dayOfWeek * 4 + hourBoost;
}

function getTotalTravelers(): string {
  const now = new Date();
  const base = 4200;
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.ceil(
    (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  const total = base + dayOfYear * 8;
  return total.toLocaleString("en-IN");
}

export default function SocialProof() {
  const [trips, setTrips] = useState<number | null>(null);
  const [travelers, setTravelers] = useState<string>("4,200+");

  useEffect(() => {
    setTrips(getTripsThisWeek());
    setTravelers(getTotalTravelers());
  }, []);

  const displayTrips = trips !== null ? trips : 142;

  return (
    <div className="border-y border-border bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-sm font-bold text-text-primary">4.8</span>
            <span className="text-xs text-text-muted">from 1,200+ reviews</span>
          </div>

          <span className="hidden h-5 w-px bg-border sm:block" />

          {/* Trips this week */}
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp size={14} className="text-primary-600" />
            <span className="font-bold text-text-primary">{displayTrips}</span>
            <span className="text-text-muted">trips planned this week</span>
          </div>

          <span className="hidden h-5 w-px bg-border sm:block" />

          {/* Total travelers */}
          <div className="flex items-center gap-1.5 text-sm">
            <Users size={14} className="text-primary-600" />
            <span className="font-bold text-text-primary">{travelers}+</span>
            <span className="text-text-muted">happy travelers</span>
          </div>

          <span className="hidden h-5 w-px bg-border sm:block" />

          {/* Destinations */}
          <div className="flex items-center gap-1.5 text-sm">
            <Globe size={14} className="text-primary-600" />
            <span className="font-bold text-text-primary">30+</span>
            <span className="text-text-muted">destinations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
