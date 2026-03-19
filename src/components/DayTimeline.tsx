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
  sightseeing: <MapPin className="h-3.5 w-3.5" />,
  dining: <UtensilsCrossed className="h-3.5 w-3.5" />,
  transport: <Bus className="h-3.5 w-3.5" />,
  leisure: <Coffee className="h-3.5 w-3.5" />,
  culture: <Palette className="h-3.5 w-3.5" />,
};

const typeColors: Record<string, string> = {
  sightseeing: "text-teal-600 bg-teal-50",
  dining: "text-amber-600 bg-amber-50",
  transport: "text-blue-600 bg-blue-50",
  leisure: "text-emerald-600 bg-emerald-50",
  culture: "text-primary-600 bg-primary-50",
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
    <div className="flex gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-gray-50">
      <div className="mt-0.5 flex flex-col items-center gap-1">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            typeColors[activity.type] || "text-text-muted bg-gray-50"
          }`}
        >
          {typeIcons[activity.type]}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-text-muted">
              {activity.time}
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {activity.title}
              {showVegBadge && (
                <span className="ml-2 inline-flex items-center gap-0.5 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  <Leaf className="h-2.5 w-2.5" />
                  Veg
                </span>
              )}
            </p>
          </div>
          {activity.cost > 0 && (
            <span className="shrink-0 text-xs font-semibold text-text-muted">
              {formatCurrency(activity.cost)}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
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
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-2 px-4">
        {icon}
        <span className="text-[11px] font-semibold tracking-wider uppercase text-text-muted">
          {label}
        </span>
      </div>
      <div className="space-y-1">
        {filtered.map((a, i) => (
          <ActivityRow key={i} activity={a} foodPreference={foodPreference} />
        ))}
      </div>
    </div>
  );
}

export default function DayTimeline({ itinerary, foodPreference }: Props) {
  const [expandedDay, setExpandedDay] = useState<number>(1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
          <MapPin className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">Day-by-Day Itinerary</h2>
          <p className="text-xs text-text-muted">
            {itinerary.length} days • Tap to expand
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {itinerary.map((day) => {
          const isExpanded = expandedDay === day.day;
          return (
            <div key={day.day} className="card overflow-hidden rounded-2xl">
              {/* Day header */}
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => setExpandedDay(isExpanded ? -1 : day.day)}
                className="flex w-full min-h-14 items-center gap-4 px-6 py-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                  <span className="text-sm font-bold text-primary-600">
                    {day.day}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary">{day.title}</p>
                    {day.city && (
                      <span className="rounded-lg bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-600">
                        {day.city}
                      </span>
                    )}
                    {day.isTransitDay && (
                      <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-600">
                        Transit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">{day.date}</p>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-text-muted" />
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
                        icon={<Sun className="h-3 w-3 text-amber-400" />}
                        activities={day.activities.morning}
                        foodPreference={foodPreference}
                      />
                      <TimeBlock
                        label="Afternoon"
                        icon={<Sunset className="h-3 w-3 text-orange-400" />}
                        activities={day.activities.afternoon}
                        foodPreference={foodPreference}
                      />
                      <TimeBlock
                        label="Evening"
                        icon={<Moon className="h-3 w-3 text-primary-400" />}
                        activities={day.activities.evening}
                        foodPreference={foodPreference}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
