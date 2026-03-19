"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  ExternalLink,
  Sparkles,
  Check,
  MapPin,
  Camera,
  Utensils,
  Compass,
  Ticket,
  Home,
} from "lucide-react";
import SafarLogo from "./SafarLogo";

// ─── Types ────────────────────────────────────────────────────────────────

export interface ActivityOption {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  image?: string;
  category: "tour" | "attraction" | "experience" | "food" | "transport";
  bookingUrl?: string;
  googleMapsUrl?: string;
  priceVerified?: boolean;
  source: "viator" | "getyourguide" | "klook" | "estimated" | "gemini-ai" | "google-places";
}

// ─── Aggregator Links ────────────────────────────────────────────────────

interface ActivityAggregator {
  name: string;
  logo: string;
  color: string;
  getUrl: (title: string, city: string) => string;
}

const activityAggregators: ActivityAggregator[] = [
  {
    name: "Viator",
    logo: "🎫",
    color: "from-green-50 to-green-100 border-green-200",
    getUrl: (title, city) =>
      `https://www.viator.com/searchResults/all?text=${encodeURIComponent(title + " " + city)}`,
  },
  {
    name: "GetYourGuide",
    logo: "🏛️",
    color: "from-blue-50 to-blue-100 border-blue-200",
    getUrl: (title, city) =>
      `https://www.getyourguide.com/s/?q=${encodeURIComponent(title + " " + city)}`,
  },
  {
    name: "Klook",
    logo: "🎯",
    color: "from-orange-50 to-orange-100 border-orange-200",
    getUrl: (title, city) =>
      `https://www.klook.com/search/?query=${encodeURIComponent(title + " " + city)}`,
  },
  {
    name: "TripAdvisor",
    logo: "🦉",
    color: "from-emerald-50 to-emerald-100 border-emerald-200",
    getUrl: (title, city) =>
      `https://www.tripadvisor.com/Search?q=${encodeURIComponent(title + " " + city)}`,
  },
];

// ─── Category Icons ───────────────────────────────────────────────────────

function getCategoryIcon(category: ActivityOption["category"]) {
  switch (category) {
    case "tour":
      return <Compass className="h-3.5 w-3.5 text-primary-600" />;
    case "attraction":
      return <Ticket className="h-3.5 w-3.5 text-primary-500" />;
    case "experience":
      return <Camera className="h-3.5 w-3.5 text-cyan-500" />;
    case "food":
      return <Utensils className="h-3.5 w-3.5 text-amber-500" />;
    case "transport":
      return <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />;
    default:
      return <MapPin className="h-3.5 w-3.5 text-text-muted" />;
  }
}

function getCategoryLabel(category: ActivityOption["category"]) {
  const labels: Record<string, string> = {
    tour: "Guided Tour",
    attraction: "Attraction",
    experience: "Experience",
    food: "Food & Drink",
    transport: "Transport",
  };
  return labels[category] || "Activity";
}

// ─── Props ────────────────────────────────────────────────────────────────

interface ActivitiesSelectionPageProps {
  /** Per-city activity options */
  cityActivities: { city: string; activities: ActivityOption[] }[];
  initialSelectedActivities?: ActivityOption[];
  onConfirm: (selectedActivities: ActivityOption[]) => void;
  onBack: () => void;
  onHome: () => void;
  flightTotal: number;
  flightTotalLabel?: string;
  hotelTotal: number;
  loading?: boolean;
  source?: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function ActivitiesSelectionPage({
  cityActivities,
  initialSelectedActivities,
  onConfirm,
  onBack,
  onHome,
  flightTotal,
  flightTotalLabel,
  hotelTotal,
  loading = false,
  source,
}: ActivitiesSelectionPageProps) {
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(() => {
    if (initialSelectedActivities && initialSelectedActivities.length > 0) {
      return new Set(initialSelectedActivities.map((a) => a.id));
    }
    return new Set();
  });
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const currentCity = cityActivities[activeCityIndex];
  const allActivities = cityActivities.flatMap((c) => c.activities);

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredActivities = (currentCity?.activities || []).filter(
    (a) => filterCategory === "all" || a.category === filterCategory
  );

  const selectedList = allActivities.filter((a) =>
    selectedActivities.has(a.id)
  );
  const activityTotal = selectedList.reduce((sum, a) => sum + a.price, 0);
  const grandTotal = flightTotal + hotelTotal + activityTotal;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v);
  const flightTotalDisplay = flightTotalLabel || formatCurrency(flightTotal);
  const grandTotalLabel =
    flightTotal > 0
      ? formatCurrency(grandTotal)
      : `${formatCurrency(hotelTotal + activityTotal)} + live flights`;

  return (
    <div className="relative z-10 min-h-screen bg-white">
      {/* Top Nav */}
      <nav className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-muted hover:bg-gray-100 hover:text-text-secondary transition-colors"
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
              Step 3 of 4
            </p>
            <p className="text-xs font-bold text-primary-600">Activities</p>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 mb-8">
          {["Flights", "Hotels", "Activities", "Summary"].map((step, i) => (
            <React.Fragment key={step}>
              {i > 0 && (
                <div
                  className={`h-px flex-1 ${i <= 2 ? "bg-primary-400" : "bg-gray-200"
                    }`}
                />
              )}
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${i === 2
                    ? "bg-primary-50 border border-primary-200 text-primary-700"
                    : i < 2
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                      : "bg-gray-50 border border-border text-text-muted"
                  }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 2
                      ? "bg-primary-600 text-white"
                      : i < 2
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-text-muted"
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
          Choose experiences & tours
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {loading
            ? "Searching for tours and activities..."
            : `Select activities to add to your trip — ${selectedActivities.size} selected`}
        </p>
        {source && (
          <span className="mt-2 inline-block rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
            {source === "google-places" ? "Google Places live discovery" : source === "gemini-ai" ? "🤖 AI-Researched Real Places" : source === "viator" ? "Viator Tours" : source === "getyourguide" ? "GetYourGuide" : "Curated Activities"}
          </span>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-40 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="h-24 w-32 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-gray-100" />
                  <div className="h-3 w-64 rounded bg-gray-50" />
                  <div className="h-3 w-24 rounded bg-gray-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* City Tabs */}
          {cityActivities.length > 1 && (
            <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {cityActivities.map((ca, i) => (
                  <motion.button
                    key={ca.city}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveCityIndex(i)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${i === activeCityIndex
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-border bg-gray-50 text-text-muted hover:bg-gray-100"
                      }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {ca.city}
                    <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px]">
                      {ca.activities.length}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {["all", "tour", "attraction", "experience", "food"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${filterCategory === cat
                        ? "bg-primary-50 text-primary-700 border border-primary-200"
                        : "bg-gray-50 text-text-muted border border-border hover:bg-gray-100"
                      }`}
                  >
                    {cat === "all" ? "All" : getCategoryLabel(cat as ActivityOption["category"])}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Activities Grid */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-40">
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filteredActivities.map((activity, idx) => {
                  const isSelected = selectedActivities.has(activity.id);
                  const isExpanded = expandedActivity === activity.id;

                  return (
                    <motion.div
                      key={activity.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className={`card rounded-2xl border overflow-hidden transition-all ${isSelected
                          ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                          : "border-border bg-white hover:bg-gray-50"
                        }`}
                    >
                      {/* Activity Card */}
                      <div
                        className="cursor-pointer p-4"
                        onClick={() => toggleActivity(activity.id)}
                      >
                        <div className="flex gap-3">
                          {/* Image */}
                          {activity.image && (
                            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl">
                              <img
                                src={activity.image}
                                alt={activity.title}
                                className="h-full w-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-primary-500/40">
                                  <Check className="h-6 w-6 text-white" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  {getCategoryIcon(activity.category)}
                                  <span className="text-[10px] font-semibold text-text-muted uppercase">
                                    {getCategoryLabel(activity.category)}
                                  </span>
                                </div>
                                <h3 className="text-sm font-bold text-text-primary leading-tight line-clamp-2">
                                  {activity.title}
                                </h3>
                              </div>

                              {/* Select checkbox */}
                              <div
                                className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected
                                    ? "border-primary-500 bg-primary-500"
                                    : "border-gray-300"
                                  }`}
                              >
                                {isSelected && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                            </div>

                            <p className="mt-1 text-xs text-text-muted line-clamp-2">
                              {activity.description}
                            </p>

                            <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-400" />
                                {activity.rating.toFixed(1)} ({activity.reviews.toLocaleString()})
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-base font-bold text-text-primary">
                                {activity.price > 0 ? formatCurrency(activity.price) : (
                                  <span className="text-sm font-semibold text-primary-600">Free / Check partner</span>
                                )}
                              </p>
                              {activity.price > 0 && (
                                <span className="text-[9px] text-text-muted">
                                  per person
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expand for aggregator links */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedActivity(
                            isExpanded ? null : activity.id
                          );
                        }}
                        className="w-full flex items-center justify-center gap-1 py-2 border-t border-border text-[10px] font-semibold text-text-muted hover:text-text-secondary hover:bg-gray-50 transition-colors"
                      >
                        {isExpanded
                          ? "Hide booking options"
                          : `📍 Maps & Booking links`}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1">
                              {/* Google Maps link */}
                              {activity.googleMapsUrl && (
                                <a
                                  href={activity.googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 mb-2 rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-green-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-all hover:scale-[1.02]"
                                >
                                  <span>📍</span>
                                  <span>View on Google Maps</span>
                                  <ExternalLink className="h-3 w-3 shrink-0 ml-auto text-emerald-400" />
                                </a>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                {activityAggregators.map((agg) => (
                                  <a
                                    key={agg.name}
                                    href={agg.getUrl(
                                      activity.title,
                                      currentCity?.city || ""
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 rounded-xl border bg-linear-to-br ${agg.color} px-3 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all hover:scale-[1.02]`}
                                  >
                                    <span>{agg.logo}</span>
                                    <span className="truncate">
                                      {agg.name}
                                    </span>
                                    <ExternalLink className="h-3 w-3 shrink-0 ml-auto text-text-muted" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredActivities.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-text-muted text-sm">
                  No activities match this filter. Try a different category.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs text-text-muted">
              {selectedActivities.size} activities selected
            </p>
            <p className="text-xl font-bold text-text-primary">
              {grandTotalLabel}
            </p>
            <p className="text-[10px] text-text-muted">
              Flights {flightTotalDisplay} + Hotels{" "}
              {formatCurrency(hotelTotal)} + Activities{" "}
              {formatCurrency(activityTotal)}
            </p>
          </div>

          {cityActivities.length > 1 &&
            activeCityIndex < cityActivities.length - 1 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCityIndex((i) => i + 1)}
                className="flex items-center gap-2 rounded-xl border border-border bg-gray-50 px-5 py-3 text-sm font-semibold text-text-secondary hover:bg-gray-100 transition-colors"
              >
                Next: {cityActivities[activeCityIndex + 1]?.city}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onConfirm(selectedList)}
            className="btn-primary flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white"
          >
            <Sparkles className="h-4 w-4" />
            {selectedActivities.size > 0
              ? "View Summary"
              : "Skip to Summary"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
