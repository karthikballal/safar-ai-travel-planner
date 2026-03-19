"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Hotel,
  MapPin,
  Check,
  TrainFront,
  Download,
  FileText,
  Loader2,
  LogIn,
} from "lucide-react";
import type { TripData, Flight, Hotel as HotelType } from "@/data/mockTrip";
import { useAuth } from "@/lib/auth";

interface Props {
  flightTotal: number;
  hotelTotal: number;
  activitiesTotal: number;
  transportTotal?: number;
  budget: number;
  tripData?: TripData;
  selectedOutbound?: Flight;
  selectedInbound?: Flight;
  selectedHotels?: HotelType[];
  travelerName?: string;
  onSignInRequired?: () => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

export default function StickyCart({
  flightTotal,
  hotelTotal,
  activitiesTotal,
  transportTotal = 0,
  budget,
  tripData,
  selectedOutbound,
  selectedInbound,
  selectedHotels,
  travelerName,
  onSignInRequired,
}: Props) {
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState({
    flights: true,
    hotel: true,
    activities: true,
    transport: true,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const total =
    (selectedItems.flights ? flightTotal : 0) +
    (selectedItems.hotel ? hotelTotal : 0) +
    (selectedItems.activities ? activitiesTotal : 0) +
    (selectedItems.transport ? transportTotal : 0);

  const isOverBudget = total > budget;
  const savings = budget - total;

  const toggle = (key: "flights" | "hotel" | "activities" | "transport") => {
    setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    {
      key: "flights" as const,
      icon: <Plane className="h-4 w-4" />,
      label: "Flights",
      price: flightTotal,
      color: "text-indigo-400",
    },
    ...(transportTotal > 0
      ? [
          {
            key: "transport" as const,
            icon: <TrainFront className="h-4 w-4" />,
            label: "Transport",
            price: transportTotal,
            color: "text-sky-400",
          },
        ]
      : []),
    {
      key: "hotel" as const,
      icon: <Hotel className="h-4 w-4" />,
      label: "Hotel",
      price: hotelTotal,
      color: "text-purple-400",
    },
    {
      key: "activities" as const,
      icon: <MapPin className="h-4 w-4" />,
      label: "Activities",
      price: activitiesTotal,
      color: "text-teal-400",
    },
  ];

  const handleDownloadPDF = async () => {
    // Gate download behind sign-in
    if (!user) {
      if (onSignInRequired) onSignInRequired();
      return;
    }

    if (!tripData || isDownloading) return;
    setIsDownloading(true);

    try {
      const { generateItineraryPDF } = await import("@/lib/pdfGenerator");
      generateItineraryPDF({
        tripData,
        selectedOutbound,
        selectedInbound,
        selectedHotels,
        travelerName,
      });
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div className="border-t border-white/6 bg-[#0a0a1a]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          {/* Toggle items */}
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
            {items.map((item) => (
              <motion.button
                key={item.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(item.key)}
                className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 ${
                  selectedItems[item.key]
                    ? "border-white/12 bg-white/6 text-white"
                    : "border-white/4 bg-transparent text-white/25"
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                    selectedItems[item.key]
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {selectedItems[item.key] && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className={selectedItems[item.key] ? item.color : ""}>
                  {item.icon}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="text-white/40">
                  {formatCurrency(item.price)}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Total & Book button */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] font-medium text-white/30">
                {isOverBudget ? "Over budget by" : "Under budget by"}
              </p>
              <p
                className={`text-xs font-bold ${
                  isOverBudget ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {isOverBudget ? "+" : ""}
                {formatCurrency(Math.abs(savings))}
              </p>
              <p className="text-lg font-extrabold text-white">
                {formatCurrency(total)}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleDownloadPDF}
              disabled={isDownloading || !tripData}
              className={`glow-btn flex min-h-13 items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all sm:px-8 ${
                isDownloading ? "opacity-80" : ""
              } ${!tripData ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <AnimatePresence mode="wait">
                {isDownloading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating…
                  </motion.span>
                ) : downloaded ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-5 w-5" />
                    Downloaded!
                  </motion.span>
                ) : (
                  <motion.span
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    {user ? (
                      <>
                        <FileText className="h-5 w-5" />
                        <span className="hidden sm:inline">Download Itinerary</span>
                        <Download className="h-4 w-4 sm:hidden" />
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span className="hidden sm:inline">Sign In to Download</span>
                        <Download className="h-4 w-4 sm:hidden" />
                      </>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
