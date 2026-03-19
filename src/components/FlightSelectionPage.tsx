"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  ArrowRight,
  ArrowLeft,
  Clock,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Home,
  Check,
} from "lucide-react";
import type { Flight } from "@/data/mockTrip";
import SafarLogo from "./SafarLogo";
import { buildAffiliateRedirectPath, buildGoogleFlightsUrl, buildSkyscannerSearchUrl } from "@/lib/affiliate";
import {
  getFlightPriceLabel,
  getFlightSourceLabel,
  getFlightTotalLabel,
  hasCompositeFlightPricingConflict,
  sumVerifiedFlightPrices,
} from "@/lib/travelDisplay";

// ─── Aggregator Booking Links ─────────────────────────────────────────────
interface Aggregator {
  name: string;
  logo: string;
  color: string;
  getUrl: (flight: Flight) => string;
}

const aggregators: Aggregator[] = [
  {
    name: "Google Flights",
    logo: "✈️",
    color: "from-blue-50 to-blue-100 border-blue-200",
    getUrl: (f) =>
      buildAffiliateRedirectPath({
        provider: "google-flights",
        target: buildGoogleFlightsUrl({
          originCode: f.departure.code,
          destinationCode: f.arrival.code,
        }),
        category: "flight",
        label: "Google Flights",
        destination: f.arrival.city,
      }),
  },
  {
    name: "Skyscanner",
    logo: "🔍",
    color: "from-cyan-50 to-cyan-100 border-cyan-200",
    getUrl: (f) =>
      buildAffiliateRedirectPath({
        provider: "skyscanner",
        target: buildSkyscannerSearchUrl({
          originCode: f.departure.code,
          destinationCode: f.arrival.code,
        }),
        category: "flight",
        label: "Skyscanner",
        destination: f.arrival.city,
      }),
  },
];

// ─── Sort Options ──────────────────────────────────────────────────────────
type SortBy = "price" | "duration" | "departure";

interface FlightSelectionPageProps {
  outboundOptions: Flight[];
  inboundOptions: Flight[];
  destination: string;
  origin: string;
  initialSelectedOutbound?: Flight | null;
  initialSelectedInbound?: Flight | null;
  onConfirm: (outbound: Flight, inbound: Flight) => void;
  onBack: () => void;
  onHome: () => void;
  loading?: boolean;
  source?: string;
}

// ─── PYT-style step indicator ──────────────────────────────────────────
function StepProgress({ current }: { current: number }) {
  const steps = ["Flights", "Hotels", "Activities", "Summary"];
  return (
    <div className="flex items-center gap-0 w-full max-w-md mx-auto">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          {i > 0 && (
            <div
              className={`step-line ${i <= current ? "step-line-active" : "step-line-pending"}`}
            />
          )}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`step-dot ${
                i < current
                  ? "step-dot-completed"
                  : i === current
                  ? "step-dot-active"
                  : "step-dot-pending"
              }`}
            >
              {i < current ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-bold ${
                i <= current ? "text-primary-600" : "text-text-muted"
              }`}
            >
              {step}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function FlightSelectionPage({
  outboundOptions,
  inboundOptions,
  destination,
  origin,
  initialSelectedOutbound,
  initialSelectedInbound,
  onConfirm,
  onBack,
  onHome,
  loading = false,
  source,
}: FlightSelectionPageProps) {
  const [selectedOutbound, setSelectedOutbound] = useState<Flight>(
    initialSelectedOutbound || outboundOptions[0]
  );
  const [selectedInbound, setSelectedInbound] = useState<Flight>(
    initialSelectedInbound || inboundOptions[0]
  );
  const [activeTab, setActiveTab] = useState<"outbound" | "inbound">(
    "outbound"
  );
  const [sortBy, setSortBy] = useState<SortBy>("price");
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stopFilter, setStopFilter] = useState<"all" | "direct" | "1stop">(
    "all"
  );

  const sortFlights = (flights: Flight[]) => {
    return [...flights].sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "departure")
        return a.departure.time.localeCompare(b.departure.time);
      const parseDuration = (d: string) => {
        const h = parseInt(d.match(/(\d+)h/)?.[1] || "0");
        const m = parseInt(d.match(/(\d+)m/)?.[1] || "0");
        return h * 60 + m;
      };
      return parseDuration(a.duration) - parseDuration(b.duration);
    });
  };

  const filterFlights = (flights: Flight[]) => {
    if (stopFilter === "direct")
      return flights.filter((f) => !f.layover);
    if (stopFilter === "1stop")
      return flights.filter((f) => f.layover);
    return flights;
  };

  const currentList =
    activeTab === "outbound" ? outboundOptions : inboundOptions;
  const currentSelected =
    activeTab === "outbound" ? selectedOutbound : selectedInbound;
  const displayFlights = sortFlights(filterFlights(currentList));

  const totalPrice = sumVerifiedFlightPrices([
    selectedOutbound,
    selectedInbound,
  ]);
  const totalPriceLabel = getFlightTotalLabel(
    [selectedOutbound, selectedInbound],
    "Live fares on partner"
  );
  const hasPartnerPricingOnly =
    !selectedOutbound.priceVerified || !selectedInbound.priceVerified;
  const hasCompositePricingConflict = hasCompositeFlightPricingConflict([
    selectedOutbound,
    selectedInbound,
  ]);

  return (
    <div className="relative z-10 min-h-screen bg-surface-elevated">
      {/* Top Nav */}
      <nav className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          <div className="flex items-center gap-3">
            <SafarLogo variant="full" size={28} />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onHome}
            className="flex items-center justify-center rounded-lg p-2 text-text-muted hover:bg-gray-100 hover:text-text-secondary transition-colors"
            title="Go to Home"
          >
            <Home className="h-5 w-5" />
          </motion.button>
        </div>
      </nav>

      {/* Progress Steps (PYT-style) */}
      <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6">
        <StepProgress current={0} />
      </div>

      {/* Route Header */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 mt-8 mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl">
          Select your flights
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {loading
            ? "Searching real-time flight data..."
            : `Compare ${outboundOptions.length + inboundOptions.length} flight options across top booking platforms`}
        </p>
        {source && (
          <span className="mt-2 inline-block rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-[10px] font-bold text-primary-700">
            Source: {getFlightSourceLabel(source)}
          </span>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-40 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-white p-5 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-48 rounded bg-gray-100" />
                </div>
                <div className="h-6 w-20 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* Tab Toggle */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 mb-6">
            <div className="flex gap-3">
              {(["outbound", "inbound"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const flight =
                  tab === "outbound" ? selectedOutbound : selectedInbound;
                return (
                  <motion.button
                    key={tab}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-xl border p-4 text-left transition-all ${
                      isActive
                        ? "border-primary-300 bg-primary-50 ring-1 ring-primary-200"
                        : "border-border bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isActive ? "text-primary-600" : "text-text-muted"
                        }`}
                      >
                        {tab === "outbound" ? "Departure" : "Return"}
                      </span>
                      {isActive && (
                        <span className="rounded-full bg-primary-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                          Selecting
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                      <span>{flight.departure.code}</span>
                      <ArrowRight className="h-3 w-3 text-text-muted" />
                      <span>{flight.arrival.code}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 capitalize">
                      {flight.airline} · {getFlightPriceLabel(flight)}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Sort & Filter */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-text-muted" />
                {(
                  [
                    { v: "price", l: "Price" },
                    { v: "duration", l: "Duration" },
                    { v: "departure", l: "Time" },
                  ] as { v: SortBy; l: string }[]
                ).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setSortBy(o.v)}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                      sortBy === o.v
                        ? "bg-primary-50 text-primary-700"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                <Filter className="h-3.5 w-3.5 text-text-muted" />
                {(
                  [
                    { v: "all", l: "All" },
                    { v: "direct", l: "Direct" },
                    { v: "1stop", l: "1 Stop" },
                  ] as { v: typeof stopFilter; l: string }[]
                ).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setStopFilter(o.v)}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                      stopFilter === o.v
                        ? "bg-primary-50 text-primary-700"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flight List */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-40 space-y-3">
            <AnimatePresence mode="popLayout">
              {displayFlights.map((flight, idx) => {
                const isSelected = flight.id === currentSelected.id;
                const isExpanded = expandedFlight === flight.id;
                const isCheapest =
                  idx === 0 && sortBy === "price" && stopFilter === "all";

                return (
                  <motion.div
                    key={flight.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isSelected
                        ? "border-primary-300 bg-primary-50 ring-1 ring-primary-200"
                        : "border-border bg-white hover:bg-gray-50"
                    }`}
                  >
                    {/* Main Row */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer"
                      onClick={() => {
                        if (activeTab === "outbound")
                          setSelectedOutbound(flight);
                        else setSelectedInbound(flight);
                      }}
                    >
                      {/* Airline */}
                      <div className="flex flex-col items-center gap-1 w-20 shrink-0">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                          ✈️
                        </div>
                        <span className="text-[10px] font-bold text-text-muted text-center leading-tight">
                          {flight.airline}
                        </span>
                      </div>

                      {/* Route Timeline */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-lg font-extrabold text-text-primary">
                              {flight.departure.time}
                            </p>
                            <p className="text-xs font-bold text-text-muted">
                              {flight.departure.code}
                            </p>
                          </div>

                          <div className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-text-muted">
                              {flight.duration}
                            </span>
                            <div className="w-full flex items-center gap-1">
                              <div className="h-px flex-1 bg-gray-200" />
                              {flight.layover ? (
                                <>
                                  <div className="h-2 w-2 rounded-full border border-amber-400 bg-amber-100" />
                                  <div className="h-px flex-1 bg-gray-200" />
                                </>
                              ) : (
                                <Plane className="h-3 w-3 text-primary-500 rotate-45" />
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-text-muted">
                              {flight.layover
                                ? `1 stop · ${flight.layover.city}`
                                : "Direct"}
                            </span>
                          </div>

                          <div className="text-center">
                            <p className="text-lg font-extrabold text-text-primary">
                              {flight.arrival.time}
                            </p>
                            <p className="text-xs font-bold text-text-muted">
                              {flight.arrival.code}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Price & Select */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          {isCheapest && (
                            <span className="mb-1 inline-block rounded-full bg-primary-50 border border-primary-200 px-2 py-0.5 text-[9px] font-bold text-primary-600">
                              Cheapest
                            </span>
                          )}
                          <p className="text-lg font-extrabold text-text-primary">
                            {getFlightPriceLabel(flight)}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {flight.class}
                          </p>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-primary-500 bg-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedFlight(isExpanded ? null : flight.id);
                      }}
                      className="w-full flex items-center justify-center gap-1 py-2 border-t border-border text-[10px] font-bold text-text-muted hover:text-text-secondary hover:bg-gray-50 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Hide booking options{" "}
                          <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          Book on aggregator sites{" "}
                          <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>

                    {/* Aggregator Links */}
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
                            <p className="text-[10px] font-bold text-text-muted mb-3">
                              Compare prices & book on these platforms:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                              {aggregators.map((agg) => (
                                <a
                                  key={agg.name}
                                  href={agg.getUrl(flight)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 rounded-lg border bg-linear-to-br ${agg.color} px-3 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-all hover:scale-[1.02]`}
                                >
                                  <span>{agg.logo}</span>
                                  <span className="truncate">{agg.name}</span>
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

            {displayFlights.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-text-muted text-sm">
                  No flights match your filters. Try adjusting the stop filter.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Sticky Bottom Bar (PYT-style) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/97 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Total flight cost
            </p>
            <p className="price-text">{totalPriceLabel}</p>
            <p className="text-[10px] text-text-muted">
              {selectedOutbound.airline} + {selectedInbound.airline}
            </p>
            {hasCompositePricingConflict && (
              <p className="mt-0.5 text-[10px] text-text-muted max-w-xs">
                Match outbound and return from the same option to keep the live total.
              </p>
            )}
            {hasPartnerPricingOnly && (
              <p className="mt-0.5 text-[10px] text-text-muted">
                Final pricing confirmed on booking partner.
              </p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onConfirm(selectedOutbound, selectedInbound)}
            className="btn-primary flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white"
          >
            Continue to Hotels
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
