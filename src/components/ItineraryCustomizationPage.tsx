"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Camera,
  Utensils,
  Landmark,
  TreePalm,
  Sparkles,
  Check,
  X,
  Eye,
  Home,
} from "lucide-react";
import type { DayPlan, Activity } from "@/data/mockTrip";
import SafarLogo from "./SafarLogo";

// ─── Types ─────────────────────────────────────────────────────────────────

interface CityCustomization {
  city: string;
  country?: string;
  days: number;
  enabled: boolean;
}

interface ItineraryCustomizationPageProps {
  itinerary: DayPlan[];
  cities: CityCustomization[];
  destination: string;
  onConfirm: (
    selectedDays: DayPlan[],
    selectedCities: string[]
  ) => void;
  onBack: () => void;
  onHome: () => void;
  flightTotal: number;
  hotelTotal: number;
}

// ─── Activity Type Icons ──────────────────────────────────────────────────

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "sightseeing":
      return <Camera className="h-3.5 w-3.5 text-primary-500" />;
    case "dining":
      return <Utensils className="h-3.5 w-3.5 text-amber-500" />;
    case "transport":
      return <ArrowRight className="h-3.5 w-3.5 text-cyan-500" />;
    case "culture":
      return <Landmark className="h-3.5 w-3.5 text-primary-600" />;
    case "leisure":
      return <TreePalm className="h-3.5 w-3.5 text-emerald-500" />;
    default:
      return <MapPin className="h-3.5 w-3.5 text-text-muted" />;
  }
}

export default function ItineraryCustomizationPage({
  itinerary,
  cities,
  destination,
  onConfirm,
  onBack,
  onHome,
  flightTotal,
  hotelTotal,
}: ItineraryCustomizationPageProps) {
  // Track which days are enabled
  const [dayEnabled, setDayEnabled] = useState<Record<number, boolean>>(() => {
    const map: Record<number, boolean> = {};
    itinerary.forEach((day) => {
      map[day.day] = true;
    });
    return map;
  });

  // Track which individual activities are enabled per day
  const [activityEnabled, setActivityEnabled] = useState<
    Record<string, boolean>
  >(() => {
    const map: Record<string, boolean> = {};
    itinerary.forEach((day) => {
      for (const period of ["morning", "afternoon", "evening"] as const) {
        day.activities[period].forEach((act, idx) => {
          map[`${day.day}-${period}-${idx}`] = true;
        });
      }
    });
    return map;
  });

  // City toggle
  const [cityEnabled, setCityEnabled] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    cities.forEach((c) => {
      map[c.city] = true;
    });
    return map;
  });

  // Expanded day
  const [expandedDay, setExpandedDay] = useState<number | null>(
    itinerary.length > 0 ? itinerary[0].day : null
  );

  const toggleDay = (dayNum: number) => {
    setDayEnabled((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const toggleActivity = (key: string) => {
    setActivityEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCity = (cityName: string) => {
    setCityEnabled((prev) => {
      const newState = { ...prev, [cityName]: !prev[cityName] };
      // Also toggle all days for this city
      itinerary.forEach((day) => {
        if (day.city === cityName) {
          setDayEnabled((dp) => ({ ...dp, [day.day]: newState[cityName] }));
        }
      });
      return newState;
    });
  };

  const selectedDayCount = Object.values(dayEnabled).filter(Boolean).length;

  const activitiesTotal = itinerary.reduce((sum, day) => {
    if (!dayEnabled[day.day]) return sum;
    for (const period of ["morning", "afternoon", "evening"] as const) {
      day.activities[period].forEach((act, idx) => {
        const key = `${day.day}-${period}-${idx}`;
        if (activityEnabled[key]) {
          sum += act.cost;
        }
      });
    }
    return sum;
  }, 0);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v);

  const handleConfirm = () => {
    // Build filtered itinerary
    const selectedDays = itinerary
      .filter((day) => dayEnabled[day.day])
      .map((day) => ({
        ...day,
        activities: {
          morning: day.activities.morning.filter((_, idx) =>
            activityEnabled[`${day.day}-morning-${idx}`]
          ),
          afternoon: day.activities.afternoon.filter((_, idx) =>
            activityEnabled[`${day.day}-afternoon-${idx}`]
          ),
          evening: day.activities.evening.filter((_, idx) =>
            activityEnabled[`${day.day}-evening-${idx}`]
          ),
        },
      }));

    const selectedCities = Object.entries(cityEnabled)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    onConfirm(selectedDays, selectedCities);
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* Top Nav */}
      <nav className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Hotels
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onHome}
              className="flex items-center justify-center rounded-xl p-2 text-text-muted hover:bg-gray-100 hover:text-text-secondary transition-colors"
              title="Go to Home"
            >
              <Home className="h-5 w-5" />
            </motion.button>
            <SafarLogo variant="full" size={28} />
          </div>

          <div className="text-right">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Step 3 of 3
            </p>
            <p className="text-xs font-bold text-primary-600">Itinerary</p>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 mb-8">
          {["Flights", "Hotels", "Itinerary"].map((step, i) => (
            <React.Fragment key={step}>
              {i > 0 && (
                <div
                  className={`h-px flex-1 ${
                    i <= 2 ? "bg-primary-300" : "bg-border"
                  }`}
                />
              )}
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                  i === 2
                    ? "bg-primary-50 border border-primary-200 text-primary-700"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-600"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 2
                      ? "bg-primary-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {i < 2 ? "✓" : i + 1}
                </span>
                {step}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl">
          Customize your itinerary
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Toggle cities, days, and activities to personalize your trip to{" "}
          {destination}
        </p>
      </div>

      {/* City Toggles (for multi-city) */}
      {cities.length > 1 && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Cities to include
          </h3>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => {
              const enabled = cityEnabled[c.city] ?? true;
              return (
                <motion.button
                  key={c.city}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleCity(c.city)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                    enabled
                      ? "bg-primary-50 border border-primary-200 text-primary-700"
                      : "bg-gray-50 border border-border text-text-muted line-through"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded flex items-center justify-center transition-colors ${
                      enabled
                        ? "bg-primary-500 text-white"
                        : "bg-gray-200 text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </div>
                  <MapPin className="h-3 w-3" />
                  {c.city}
                  <span className="text-text-muted font-normal">
                    {c.days} day{c.days > 1 ? "s" : ""}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day-by-Day Cards */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-40 space-y-3">
        {itinerary.map((day) => {
          const enabled = dayEnabled[day.day];
          const isExpanded = expandedDay === day.day;

          // Count selected activities
          let totalActs = 0;
          let selectedActs = 0;
          for (const period of ["morning", "afternoon", "evening"] as const) {
            day.activities[period].forEach((_, idx) => {
              totalActs++;
              if (activityEnabled[`${day.day}-${period}-${idx}`])
                selectedActs++;
            });
          }

          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: enabled ? 1 : 0.4, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl border overflow-hidden transition-all ${
                enabled
                  ? "border-border bg-white"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Day Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedDay(isExpanded ? null : day.day)}
              >
                {/* Toggle */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDay(day.day);
                  }}
                  className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    enabled
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 text-text-muted"
                  }`}
                >
                  {enabled ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary-600">
                      Day {day.day}
                    </span>
                    {day.city && (
                      <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {day.city}
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted">
                      {day.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-text-secondary truncate">
                    {day.title}
                  </h4>
                </div>

                <span className="text-[10px] font-medium text-text-muted shrink-0">
                  {selectedActs}/{totalActs} activities
                </span>

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Eye className="h-4 w-4 text-text-muted" />
                </motion.div>
              </div>

              {/* Expanded Activities */}
              <AnimatePresence>
                {isExpanded && enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      {(
                        ["morning", "afternoon", "evening"] as const
                      ).map((period) => {
                        const activities = day.activities[period];
                        if (activities.length === 0) return null;

                        return (
                          <div key={period}>
                            <h5 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                              {period}
                            </h5>
                            <div className="space-y-1.5">
                              {activities.map((act, idx) => {
                                const key = `${day.day}-${period}-${idx}`;
                                const isOn = activityEnabled[key];

                                return (
                                  <motion.div
                                    key={key}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all cursor-pointer ${
                                      isOn
                                        ? "bg-gray-50 border border-border"
                                        : "bg-white border border-gray-100 opacity-40"
                                    }`}
                                    onClick={() => toggleActivity(key)}
                                  >
                                    <div
                                      className={`h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                                        isOn
                                          ? "bg-primary-500 text-white"
                                          : "bg-gray-200 text-transparent"
                                      }`}
                                    >
                                      <Check className="h-2.5 w-2.5" />
                                    </div>

                                    {getActivityIcon(act.type)}

                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-xs font-semibold ${
                                          isOn
                                            ? "text-text-secondary"
                                            : "text-text-muted line-through"
                                        }`}
                                      >
                                        {act.title}
                                      </p>
                                      <p className="text-[10px] text-text-muted truncate">
                                        {act.time} · {act.description}
                                      </p>
                                    </div>

                                    {act.cost > 0 && (
                                      <span className="text-[10px] font-semibold text-text-muted shrink-0">
                                        {formatCurrency(act.cost)}
                                      </span>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs text-text-muted">
              Flights + Hotels + Activities
            </p>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(flightTotal + hotelTotal + activitiesTotal)}
            </p>
            <p className="text-[10px] text-text-muted">
              {selectedDayCount} days selected · {Object.values(activityEnabled).filter(Boolean).length} activities
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleConfirm}
            className="btn-primary flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white"
          >
            <Sparkles className="h-4 w-4" />
            View Final Trip
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
