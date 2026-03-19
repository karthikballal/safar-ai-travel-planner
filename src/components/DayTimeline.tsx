"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  UtensilsCrossed,
  Bus,
  Palette,
  Coffee,
  ChevronDown,
  Sun,
  Sunset,
  Moon,
  Leaf,
  Camera,
  Clock,
} from "lucide-react";
import { DayPlan, Activity } from "@/data/mockTrip";

interface Props {
  itinerary: DayPlan[];
  foodPreference: "any" | "veg" | "nonveg";
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

const typeIcons: Record<string, React.ReactNode> = {
  sightseeing: <Camera className="h-3.5 w-3.5" />,
  dining: <UtensilsCrossed className="h-3.5 w-3.5" />,
  transport: <Bus className="h-3.5 w-3.5" />,
  leisure: <Coffee className="h-3.5 w-3.5" />,
  culture: <Palette className="h-3.5 w-3.5" />,
};

const typeColors: Record<string, string> = {
  sightseeing: "text-primary-600 bg-primary-50 border-primary-200",
  dining: "text-amber-600 bg-amber-50 border-amber-200",
  transport: "text-blue-600 bg-blue-50 border-blue-200",
  leisure: "text-emerald-600 bg-emerald-50 border-emerald-200",
  culture: "text-purple-600 bg-purple-50 border-purple-200",
};

function ActivityRow({
  activity,
  foodPreference,
}: {
  activity: Activity;
  foodPreference: "any" | "veg" | "nonveg";
}) {
  const showVegBadge =
    activity.type === "dining" && foodPreference === "veg" && activity.isVeg;

  return (
    <div className="group flex gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-gray-50">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            typeColors[activity.type] || "text-text-muted bg-gray-50 border-gray-200"
          }`}
        >
          {typeIcons[activity.type]}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-text-primary">
                {activity.title}
              </p>
              {showVegBadge && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  <Leaf className="h-2.5 w-2.5" />
                  Veg
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="h-3 w-3 text-text-muted" />
              <p className="text-xs text-text-muted">{activity.time}</p>
            </div>
          </div>
          {activity.cost > 0 && (
            <span className="shrink-0 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-bold text-text-primary">
              {formatCurrency(activity.cost)}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-text-secondary line-clamp-2">
          {activity.description}
        </p>
      </div>
    </div>
  );
}

function TimeBlock({
  label,
  icon,
  activities,
  foodPreference,
}: {
  label: string;
  icon: React.ReactNode;
  activities: Activity[];
  foodPreference: "any" | "veg" | "nonveg";
}) {
  if (!activities.length) return null;

  const filtered =
    foodPreference === "veg"
      ? activities.filter((a) => a.type !== "dining" || a.isVeg !== false)
      : activities;

  if (!filtered.length) return null;

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2 px-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100">
          {icon}
        </div>
        <span className="text-[11px] font-bold tracking-wider uppercase text-text-muted">
          {label}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-0.5">
        {filtered.map((a, i) => (
          <ActivityRow key={i} activity={a} foodPreference={foodPreference} />
        ))}
      </div>
    </div>
  );
}

export default function DayTimeline({ itinerary, foodPreference }: Props) {
  const [expandedDay, setExpandedDay] = useState<number>(1);

  const getDayCost = (day: DayPlan): number => {
    const all = [
      ...day.activities.morning,
      ...day.activities.afternoon,
      ...day.activities.evening,
    ];
    return all.reduce((sum, a) => sum + (a.cost || 0), 0);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 border border-primary-200">
            <MapPin className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">
              Day-by-Day Itinerary
            </h2>
            <p className="text-xs text-text-muted">
              {itinerary.length} days planned • Tap to expand
            </p>
          </div>
        </div>
      </div>

      {/* Timeline with vertical connecting line (PYT-style) */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary-500 via-primary-300 to-border hidden sm:block" />

        <div className="space-y-3">
          {itinerary.map((day, dayIdx) => {
            const isExpanded = expandedDay === day.day;
            const dayCost = getDayCost(day);

            return (
              <div key={day.day} className="relative">
                {/* Timeline circle marker */}
                <div className="absolute left-[14px] top-[22px] z-10 hidden sm:flex">
                  <div
                    className={`h-[18px] w-[18px] rounded-full border-2 transition-all ${
                      isExpanded
                        ? "border-primary-500 bg-primary-500"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isExpanded && (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`sm:ml-12 card overflow-hidden transition-all ${
                    isExpanded ? "ring-1 ring-primary-200 border-primary-200" : ""
                  }`}
                >
                  {/* Day header */}
                  <motion.button
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setExpandedDay(isExpanded ? -1 : day.day)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold transition-colors ${
                        isExpanded
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-text-muted"
                      }`}
                    >
                      <span className="text-sm">D{day.day}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-text-primary truncate">
                          {day.title}
                        </p>
                        {day.city && (
                          <span className="rounded-full bg-primary-50 border border-primary-200 px-2.5 py-0.5 text-[10px] font-bold text-primary-700">
                            {day.city}
                          </span>
                        )}
                        {day.isTransitDay && (
                          <span className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[10px] font-bold text-sky-600">
                            ✈️ Transit
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {day.date}
                        {dayCost > 0 && (
                          <span className="ml-2 font-semibold text-text-secondary">
                            • est. {formatCurrency(dayCost)}
                          </span>
                        )}
                      </p>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`shrink-0 rounded-lg p-1 ${isExpanded ? "bg-primary-50" : ""}`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 ${isExpanded ? "text-primary-600" : "text-text-muted"}`}
                      />
                    </motion.div>
                  </motion.button>

                  {/* Day content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-2 py-4">
                          <TimeBlock
                            label="Morning"
                            icon={<Sun className="h-3.5 w-3.5 text-amber-500" />}
                            activities={day.activities.morning}
                            foodPreference={foodPreference}
                          />
                          <TimeBlock
                            label="Afternoon"
                            icon={<Sunset className="h-3.5 w-3.5 text-orange-500" />}
                            activities={day.activities.afternoon}
                            foodPreference={foodPreference}
                          />
                          <TimeBlock
                            label="Evening"
                            icon={<Moon className="h-3.5 w-3.5 text-indigo-500" />}
                            activities={day.activities.evening}
                            foodPreference={foodPreference}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
