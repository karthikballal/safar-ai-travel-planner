"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plane,
  BedDouble,
  MapPin,
  ExternalLink,
  Sparkles,
  Check,
  Clock,
  Star,
  ArrowRight,
  Home,
  Download,
} from "lucide-react";
import type { Flight, Hotel } from "@/data/mockTrip";
import type { ActivityOption } from "./ActivitiesSelectionPage";
import SafarLogo from "./SafarLogo";
import { buildAffiliateRedirectPath, buildBookingSearchUrl, buildGoogleFlightsUrl, buildSkyscannerSearchUrl } from "@/lib/affiliate";
import {
  formatCurrency,
  getFlightPriceLabel,
  getFlightTotalLabel,
  getHotelTotalLabel,
  hasCompositeFlightPricingConflict,
  hasPartnerOnlyPricing,
  sumVerifiedFlightPrices,
  sumVerifiedHotelPrices,
} from "@/lib/travelDisplay";

// ─── Aggregator Links ────────────────────────────────────────────────────

const flightAggregators = [
  {
    name: "Google Flights",
    getUrl: (f: Flight) =>
      buildAffiliateRedirectPath({
        provider: "google-flights",
        target: buildGoogleFlightsUrl({ originCode: f.departure.code, destinationCode: f.arrival.code }),
        category: "flight",
        label: "Google Flights",
        destination: f.arrival.city,
      }),
  },
  {
    name: "Skyscanner",
    getUrl: (f: Flight) =>
      buildAffiliateRedirectPath({
        provider: "skyscanner",
        target: buildSkyscannerSearchUrl({ originCode: f.departure.code, destinationCode: f.arrival.code }),
        category: "flight",
        label: "Skyscanner",
        destination: f.arrival.city,
      }),
  },
];

const hotelAggregators = [
  {
    name: "Booking.com",
    getUrl: (h: Hotel) =>
      buildAffiliateRedirectPath({
        provider: "booking",
        target: h.bookingUrl || buildBookingSearchUrl({ hotelName: h.name, city: h.address }),
        category: "hotel",
        label: "Booking.com",
        destination: h.address,
      }),
  },
];

const activityAggregators = [
  {
    name: "Viator",
    getUrl: (title: string, city: string) =>
      `https://www.viator.com/searchResults/all?text=${encodeURIComponent(title + " " + city)}`,
  },
  {
    name: "GetYourGuide",
    getUrl: (title: string, city: string) =>
      `https://www.getyourguide.com/s/?q=${encodeURIComponent(title + " " + city)}`,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────

interface SummaryCheckoutPageProps {
  selectedOutbound: Flight | null;
  selectedInbound: Flight | null;
  selectedHotels: Hotel[];
  selectedActivities: ActivityOption[];
  cityLabels: string[];
  destination: string;
  origin: string;
  duration: number;
  tripType?: "domestic" | "international";
  onConfirm: () => void;
  onBack: () => void;
  onHome: () => void;
  onDownload?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function SummaryCheckoutPage({
  selectedOutbound,
  selectedInbound,
  selectedHotels,
  selectedActivities,
  cityLabels,
  destination,
  origin,
  duration,
  tripType = "international",
  onConfirm,
  onBack,
  onHome,
  onDownload,
}: SummaryCheckoutPageProps) {
  const isDomestic = tripType === "domestic";
  const flightTotal = !isDomestic && selectedOutbound && selectedInbound
    ? sumVerifiedFlightPrices([selectedOutbound, selectedInbound])
    : 0;
  const flightTotalLabel = !isDomestic && selectedOutbound && selectedInbound
    ? getFlightTotalLabel([selectedOutbound, selectedInbound], "Live fare on partner")
    : "Live fare on partner";
  const hotelTotal = sumVerifiedHotelPrices(selectedHotels);
  const activityTotal = selectedActivities.reduce(
    (sum, a) => sum + a.price,
    0
  );
  const grandTotal = flightTotal + hotelTotal + activityTotal;
  const hasLivePartnerPricing = hasPartnerOnlyPricing([selectedOutbound, selectedInbound], selectedHotels);
  const hasCompositeFlightPricing = hasCompositeFlightPricingConflict([selectedOutbound, selectedInbound]);

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
            Activities
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
              Step {isDomestic ? "3 of 3" : "4 of 4"}
            </p>
            <p className="text-xs font-bold text-primary-600">Summary</p>
          </div>
        </div>
      </nav>

      {/* Progress Steps — All Complete */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 mb-8">
          {(isDomestic ? ["Hotels", "Activities", "Summary"] : ["Flights", "Hotels", "Activities", "Summary"]).map((step, i, arr) => (
            <React.Fragment key={step}>
              {i > 0 && (
                <div className="h-px flex-1 bg-primary-400" />
              )}
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                  i === arr.length - 1
                    ? "bg-primary-50 border border-primary-200 text-primary-700"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-600"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === arr.length - 1
                      ? "bg-primary-600 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {i < arr.length - 1 ? "✓" : String(arr.length)}
                </span>
                {step}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-8">
        <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl">
          Trip Summary
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {origin} → {destination} · {duration} days · Review and book your selections
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-40 space-y-6">
        {/* ─── Flights Section ──────────────────────────────────────────── */}
        {!isDomestic && selectedOutbound && selectedInbound && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card rounded-2xl border border-border bg-white overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
              <Plane className="h-4 w-4 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-text-primary">Flights</h2>
              <p className="text-xs text-text-muted">{flightTotalLabel}</p>
            </div>
            <Check className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="p-5 space-y-3">
            {[selectedOutbound, selectedInbound].map((flight, i) => (
              <div
                key={flight.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-gray-50 p-3"
              >
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-text-muted uppercase">
                    {i === 0 ? "Depart" : "Return"}
                  </p>
                  <p className="text-sm font-bold text-text-primary">
                    {flight.departure.time}
                  </p>
                  <p className="text-xs text-text-muted">{flight.departure.code}</p>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] text-text-muted">{flight.duration}</span>
                  <div className="w-full h-px bg-gray-200 my-1" />
                  <span className="text-[10px] text-text-muted">{flight.airline}</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-text-primary">
                    {flight.arrival.time}
                  </p>
                  <p className="text-xs text-text-muted">{flight.arrival.code}</p>
                </div>
                <p className="text-sm font-bold text-text-primary shrink-0">
                  {getFlightPriceLabel(flight)}
                </p>
              </div>
            ))}

            {/* Aggregator Deep Links */}
            <div className="flex flex-wrap gap-2 pt-3">
              {flightAggregators.map((agg) => (
                <a
                  key={agg.name}
                  href={agg.getUrl(selectedOutbound)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  Book on {agg.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* ─── Hotels Section ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card rounded-2xl border border-border bg-white overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
              <BedDouble className="h-4 w-4 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-text-primary">Hotels</h2>
              <p className="text-xs text-text-muted">
                {selectedHotels.length} {selectedHotels.length === 1 ? "hotel" : "hotels"} · {hotelTotal > 0 ? formatCurrency(hotelTotal) : "Live rates on Booking.com"}
              </p>
            </div>
            <Check className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="p-5 space-y-3">
            {selectedHotels.map((hotel, i) => (
              <div
                key={hotel.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-gray-50 p-3"
              >
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">
                    {hotel.name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span className="flex items-center gap-0.5">
                      {cityLabels[i] && (
                        <>
                          <MapPin className="h-2.5 w-2.5" />
                          {cityLabels[i]}
                        </>
                      )}
                    </span>
                    <span>{hotel.nights} nights</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 text-amber-400" />
                      {hotel.rating?.toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-bold text-text-primary shrink-0">
                  {getHotelTotalLabel(hotel)}
                </p>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-3">
              {selectedHotels[0] &&
                hotelAggregators.map((agg) => (
                  <a
                    key={agg.name}
                    href={agg.getUrl(selectedHotels[0])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
                  >
                    Book on {agg.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Activities Section ───────────────────────────────────────── */}
        {selectedActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card rounded-2xl border border-border bg-white overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                <MapPin className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-text-primary">
                  Activities & Tours
                </h2>
                <p className="text-xs text-text-muted">
                  {selectedActivities.length} experiences · {formatCurrency(activityTotal)}
                </p>
              </div>
              <Check className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="p-5 space-y-2">
              {selectedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-3"
                >
                  {activity.image && (
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {activity.duration}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 text-amber-400" />
                        {activity.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-text-primary">
                      {formatCurrency(activity.price)}
                    </p>
                    {activity.bookingUrl && (
                      <a
                        href={activity.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-text-secondary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-3">
                {activityAggregators.map((agg) => (
                  <a
                    key={agg.name}
                    href={agg.getUrl(
                      selectedActivities[0]?.title || destination,
                      destination
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    Browse on {agg.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Price Breakdown ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card rounded-2xl border border-border bg-linear-to-br from-primary-50 to-white p-6"
        >
          <h2 className="text-sm font-bold text-text-primary mb-4">Price Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-2">
                <Plane className="h-3.5 w-3.5 text-primary-600" />
                Flights (2)
              </span>
              <span className="font-semibold text-text-primary">{flightTotalLabel}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-2">
                <BedDouble className="h-3.5 w-3.5 text-primary-600" />
                Hotels ({selectedHotels.length})
              </span>
              <span className="font-semibold text-text-primary">{hotelTotal > 0 ? formatCurrency(hotelTotal) : "Live rates on partner"}</span>
            </div>
            {activityTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  Activities ({selectedActivities.length})
                </span>
                <span className="font-semibold text-text-primary">{formatCurrency(activityTotal)}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-base font-bold text-text-primary">Grand Total</span>
              <span className="text-2xl font-extrabold bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                {grandTotal > 0 ? formatCurrency(grandTotal) : "Partner pricing live"}
              </span>
            </div>
            {hasLivePartnerPricing && (
              <p className="text-[11px] text-text-muted">
                Flights or hotels may require partner pricing lookup. Final totals are confirmed on Skyscanner, Google Flights, or Booking.com.
              </p>
            )}
            {hasCompositeFlightPricing && (
              <p className="text-[11px] text-text-muted">
                Your selected outbound and return come from different FlightDataAPI itineraries, so the combined flight total stays live until booking.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs text-text-muted">Total trip cost</p>
            <p className="text-xl font-bold text-text-primary">
              {grandTotal > 0 ? formatCurrency(grandTotal) : "Partner pricing live"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onDownload && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onDownload}
                className="flex items-center gap-2 rounded-xl border border-border bg-gray-50 px-5 py-3 text-sm font-semibold text-text-secondary hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={onConfirm}
              className="btn-primary flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white"
            >
              <Sparkles className="h-4 w-4" />
              View Full Dashboard
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
