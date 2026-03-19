"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  MapPin,
  ExternalLink,
  Sparkles,
  Wifi,
  Coffee,
  Dumbbell,
  Car,
  UtensilsCrossed,
  Waves,
  Home,
} from "lucide-react";
import type { Hotel } from "@/data/mockTrip";
import SafarLogo from "./SafarLogo";
import { buildAffiliateRedirectPath, buildBookingSearchUrl } from "@/lib/affiliate";
import { formatCurrency, getHotelNightlyLabel, getHotelTotalLabel, hasVerifiedHotelPrice, sumVerifiedHotelPrices } from "@/lib/travelDisplay";

// ─── Hotel Aggregator Links ────────────────────────────────────────────────
interface HotelAggregator {
  name: string;
  logo: string;
  color: string;
  getUrl: (hotel: Hotel) => string;
}

const hotelAggregators: HotelAggregator[] = [
  {
    name: "Booking.com",
    logo: "🏨",
    color: "from-blue-50 to-blue-100 border-blue-200",
    getUrl: (h) =>
      buildAffiliateRedirectPath({
        provider: "booking",
        target: h.bookingUrl || buildBookingSearchUrl({ hotelName: h.name }),
        category: "hotel",
        label: "Booking.com",
        destination: h.address,
      }),
  },
];

// ─── Amenity Icon Map ──────────────────────────────────────────────────────
const amenityIconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-3 w-3" />,
  "free wifi": <Wifi className="h-3 w-3" />,
  pool: <Waves className="h-3 w-3" />,
  "swimming pool": <Waves className="h-3 w-3" />,
  "infinity pool": <Waves className="h-3 w-3" />,
  gym: <Dumbbell className="h-3 w-3" />,
  fitness: <Dumbbell className="h-3 w-3" />,
  parking: <Car className="h-3 w-3" />,
  restaurant: <UtensilsCrossed className="h-3 w-3" />,
  breakfast: <Coffee className="h-3 w-3" />,
  "free breakfast": <Coffee className="h-3 w-3" />,
};

function getAmenityIcon(amenity: string): React.ReactNode {
  const lower = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(amenityIconMap)) {
    if (lower.includes(key)) return icon;
  }
  return <Star className="h-3 w-3" />;
}

interface HotelSelectionPageProps {
  /** Per-city hotel options: hotelOptions[cityIndex] = Hotel[] */
  hotelOptions: Hotel[][];
  /** City labels for multi-city trips */
  cityLabels: string[];
  /** Number of nights per city */
  nightsPerCity: number[];
  initialSelectedHotels?: Hotel[];
  onConfirm: (selectedHotels: Hotel[]) => void;
  onBack: () => void;
  onHome: () => void;
  /** Total flight cost (to show running total) */
  flightTotal: number;
  flightTotalLabel?: string;
  loading?: boolean;
  source?: string;
}

export default function HotelSelectionPage({
  hotelOptions,
  cityLabels,
  nightsPerCity,
  initialSelectedHotels,
  onConfirm,
  onBack,
  onHome,
  flightTotal,
  flightTotalLabel,
  loading = false,
  source,
}: HotelSelectionPageProps) {
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [selectedHotels, setSelectedHotels] = useState<Hotel[]>(() => {
    if (initialSelectedHotels && initialSelectedHotels.length > 0) {
      return initialSelectedHotels;
    }
    return hotelOptions.map((opts) => opts[0]);
  });
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);

  const currentOptions = hotelOptions[activeCityIndex] || [];
  const currentSelected = selectedHotels[activeCityIndex];
  const hotelTotal = sumVerifiedHotelPrices(selectedHotels);
  const flightTotalDisplay = flightTotalLabel || formatCurrency(flightTotal);
  const combinedTotalLabel =
    flightTotal > 0 && hotelTotal > 0
      ? formatCurrency(flightTotal + hotelTotal)
      : hotelTotal > 0
        ? `${formatCurrency(hotelTotal)} + live flights`
        : "Hotels priced on partner";

  const handleSelectHotel = (hotel: Hotel) => {
    setSelectedHotels((prev) => {
      const next = [...prev];
      next[activeCityIndex] = hotel;
      return next;
    });
  };

  const hasPartnerOnlyPricing = selectedHotels.some((hotel) => hotel && !hasVerifiedHotelPrice(hotel));

  const allCitiesSelected = selectedHotels.every((h) => h != null);

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
            Flights
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
              Step 2 of 4
            </p>
            <p className="text-xs font-bold text-primary-600">Hotels</p>
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
                  className={`h-px flex-1 ${i <= 1 ? "bg-primary-400" : "bg-gray-200"
                    }`}
                />
              )}
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${i === 1
                    ? "bg-primary-50 border border-primary-200 text-primary-700"
                    : i < 1
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                      : "bg-gray-50 border border-border text-text-muted"
                  }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 1
                      ? "bg-primary-600 text-white"
                      : i < 1
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-text-muted"
                    }`}
                >
                  {i < 1 ? "✓" : i + 1}
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
          Choose your hotels
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {loading ? "Searching real-time hotel availability..." : "Compare hotels across booking platforms — like Trivago"}
        </p>
        {source && (
          <span className="mt-2 inline-block rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
            Source: {source === "google-places" ? "Google Places + Booking.com" : "AI-curated hotels • Book on Booking.com for exact rates"}
          </span>
        )}
      </div>

      {/* City Tabs (for multi-city trips) */}
      {cityLabels.length > 1 && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cityLabels.map((city, i) => {
              const isActive = activeCityIndex === i;
              const hasSelection = selectedHotels[i] != null;
              return (
                <motion.button
                  key={city}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveCityIndex(i)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${isActive
                      ? "bg-primary-50 border border-primary-200 text-primary-700"
                      : hasSelection
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                        : "bg-gray-50 border border-border text-text-muted hover:bg-gray-100"
                    }`}
                >
                  <MapPin className="h-3 w-3" />
                  {city}
                  <span className="text-text-muted font-normal">
                    {nightsPerCity[i]}n
                  </span>
                  {hasSelection && !isActive && (
                    <span className="text-[10px]">✓</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hotel Cards */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-40 space-y-4">
        {currentOptions.map((hotel, idx) => {
          const isSelected = hotel.id === currentSelected?.id;
          const isExpanded = expandedHotel === hotel.id;
          const isBestValue = idx === 0;

          return (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className={`card rounded-2xl border overflow-hidden transition-all ${isSelected
                  ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                  : "border-border bg-white hover:bg-gray-50"
                }`}
            >
              <div
                className="flex flex-col sm:flex-row gap-4 p-4 cursor-pointer"
                onClick={() => handleSelectHotel(hotel)}
              >
                {/* Hotel Image */}
                <div className="relative w-full sm:w-48 h-36 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-gray-50">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    🏨
                  </div>
                  {isBestValue && (
                    <span className="absolute top-2 left-2 rounded-lg bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                      Best Value
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-0.5 shadow-sm">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Hotel Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-text-primary">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hotel.address}
                      </p>
                    </div>

                    {/* Rating Badge */}
                    <div className="shrink-0 text-center">
                      <div className="rounded-xl bg-primary-50 border border-primary-200 px-2.5 py-1.5">
                        <span className="text-lg font-bold text-primary-700">
                          {hotel.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">
                        {hotel.reviews.toLocaleString()} reviews
                      </p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hotel.amenities.slice(0, 6).map((a) => (
                      <span
                        key={a}
                        className="flex items-center gap-1 rounded-lg bg-gray-50 border border-border px-2 py-1 text-[10px] font-medium text-text-muted"
                      >
                        {getAmenityIcon(a)}
                        {a}
                      </span>
                    ))}
                  </div>
                    {hotel.amenities.length === 0 && (
                      <p className="mt-3 text-[11px] text-text-muted">
                        Live hotel listing from partner data. Open Booking.com for current room types and inclusions.
                      </p>
                    )}

                  {/* Price */}
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-[10px] text-text-muted">
                        {hotel.nights} night{hotel.nights > 1 ? "s" : ""} ·{" "}
                        {getHotelNightlyLabel(hotel)}
                      </p>
                      <p className="text-xl font-bold text-text-primary mt-0.5">
                        {getHotelTotalLabel(hotel)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
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
                </div>
              </div>

              {/* Aggregator Price Comparison / Book toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedHotel(isExpanded ? null : hotel.id);
                }}
                className="w-full flex items-center justify-center gap-1 py-2 border-t border-border text-[10px] font-semibold text-text-muted hover:text-text-secondary hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? "Hide booking options" : hotel.aggregatorPrices && hotel.aggregatorPrices.length > 0 ? `Compare live partner options ↓` : "Open Booking.com listing"}
              </button>

              {/* Aggregator Price Comparison */}
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
                      {hotel.aggregatorPrices && hotel.aggregatorPrices.length > 0 ? (
                        <>
                          <p className="text-[10px] font-medium text-text-muted mb-3">
                            Verified partner prices for {hotel.nights} night{hotel.nights > 1 ? "s" : ""}:
                          </p>
                          <div className="space-y-2">
                            {[...hotel.aggregatorPrices]
                              .sort((a, b) => a.totalPrice - b.totalPrice)
                              .map((ap, apIdx) => {
                                const isCheapest = apIdx === 0;
                                return (
                                  <a
                                    key={ap.aggregator}
                                    href={ap.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:scale-[1.01] ${isCheapest
                                        ? "border-emerald-300 bg-emerald-50"
                                        : "border-border bg-white hover:bg-gray-50"
                                      }`}
                                  >
                                    <span className="text-lg">{ap.logo}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-text-primary">{ap.aggregator}</span>
                                        {isCheapest && (
                                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                                            CHEAPEST
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-text-muted mt-0.5">
                                        {formatCurrency(ap.pricePerNight)}/night
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className={`text-sm font-bold ${isCheapest ? "text-emerald-600" : "text-text-primary"}`}>
                                        {formatCurrency(ap.totalPrice)}
                                      </p>
                                      <p className="text-[9px] text-text-muted">total</p>
                                    </div>
                                    <ExternalLink className="h-3.5 w-3.5 text-text-muted shrink-0" />
                                  </a>
                                );
                              })}
                          </div>
                          <p className="text-[9px] text-text-muted mt-2 text-center">
                            Partner prices are shown when available. Booking.com remains the primary affiliate checkout path.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] font-medium text-text-muted mb-3">
                            Open the live Booking.com search for this stay:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {hotelAggregators.map((agg) => (
                              <a
                                key={agg.name}
                                href={agg.getUrl(hotel)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 rounded-xl border bg-linear-to-br ${agg.color} px-3 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all hover:scale-[1.02]`}
                              >
                                <span>{agg.logo}</span>
                                <span className="truncate">{agg.name}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 ml-auto text-text-muted" />
                              </a>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs text-text-muted">
              Flights + Hotels
            </p>
            <p className="text-xl font-bold text-text-primary">
              {combinedTotalLabel}
            </p>
            <p className="text-[10px] text-text-muted">
              Flights {flightTotalDisplay} + Hotels {hotelTotal > 0 ? formatCurrency(hotelTotal) : "live rates on Booking.com"}
            </p>
            {hasPartnerOnlyPricing && (
              <p className="mt-1 text-[10px] text-text-muted">
                Final room pricing is confirmed on the Booking.com partner page.
              </p>
            )}
          </div>

          {cityLabels.length > 1 &&
            activeCityIndex < cityLabels.length - 1 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCityIndex((i) => i + 1)}
                className="flex items-center gap-2 rounded-xl border border-border bg-gray-50 px-5 py-3 text-sm font-semibold text-text-secondary hover:bg-gray-100 transition-colors"
              >
                Next: {cityLabels[activeCityIndex + 1]}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onConfirm(selectedHotels)}
            className="btn-primary flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white"
          >
            <Sparkles className="h-4 w-4" />
            Continue to Activities
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
