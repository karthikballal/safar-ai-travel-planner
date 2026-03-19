"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  Clock,
  Plane,
  TrainFront,
  Hotel,
  Ticket,
  Check,
  Sparkles,
  Globe,
  Calendar,
  BadgeIndianRupee,
} from "lucide-react";
import type { RouteOption } from "@/lib/routePlanner";

interface Props {
  options: RouteOption[];
  destination: string;
  duration: number;
  budget: number;
  onSelect: (option: RouteOption) => void;
  onBack: () => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

export default function RouteSelector({
  options,
  destination,
  duration,
  budget,
  onSelect,
  onBack,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (option: RouteOption) => {
    setSelectedId(option.id);
    setTimeout(() => onSelect(option), 600);
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center px-4 pt-12 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-3 text-center"
      >
        <div className="mb-3 flex items-center justify-center gap-2">
          <Globe className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-medium tracking-widest uppercase text-indigo-400/80">
            AI Route Planner
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-extrabold text-white sm:text-4xl">
          How would you like to{" "}
          <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
            explore {destination}?
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-base text-white/40">
          Based on your{" "}
          <span className="font-semibold text-white/60">{duration} nights</span>{" "}
          and{" "}
          <span className="font-semibold text-white/60">
            {formatCurrency(budget)}
          </span>{" "}
          budget, here are your best route options
        </p>
      </motion.div>

      {/* Route Option Cards */}
      <div className="mt-8 w-full max-w-3xl space-y-5">
        <AnimatePresence>
          {options.map((option, idx) => {
            const isSelected = selectedId === option.id;
            const isWithinBudget = option.tag === "Within Budget";
            const isOverBudget = option.tag === "Over Budget";

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                className={`group relative cursor-pointer rounded-3xl border p-6 transition-all duration-300 sm:p-8 ${
                  isSelected
                    ? "border-indigo-500/50 bg-indigo-500/8 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
                    : isOverBudget
                    ? "border-white/5 bg-white/2 opacity-60 hover:opacity-80 hover:border-white/10"
                    : "border-white/8 bg-white/3 hover:border-indigo-500/25 hover:bg-white/5"
                }`}
                onClick={() => !isSelected && handleSelect(option)}
              >
                {/* Tag badge */}
                <div className="absolute -top-3 right-6">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      isWithinBudget
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : isOverBudget
                        ? "bg-red-500/10 text-red-400/70 border border-red-500/15"
                        : "bg-amber-500/10 text-amber-400/80 border border-amber-500/15"
                    }`}
                  >
                    {option.tag}
                  </span>
                  {idx === 0 && options.length > 1 && (
                    <span className="ml-2 rounded-full bg-indigo-500/15 border border-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-400">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Option header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white sm:text-xl">
                      {option.label}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-white/35">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {option.totalNights} nights
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {option.cities.length}{" "}
                        {option.cities.length === 1 ? "city" : "cities"}
                      </span>
                      {option.transport.length > 0 && (
                        <span className="flex items-center gap-1">
                          <TrainFront className="h-3 w-3" />
                          {option.transport.length} transfer
                          {option.transport.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-white">
                      {formatCurrency(option.estimates.total)}
                    </p>
                    <p className="text-[11px] text-white/30">estimated total</p>
                  </div>
                </div>

                {/* City route visualization */}
                <div className="mt-5 flex flex-wrap items-start gap-3">
                  {option.cities.map((city, i) => (
                    <React.Fragment key={city.city}>
                      {i > 0 && (
                        <div className="flex flex-col items-center gap-0.5 pt-2">
                          <ArrowRight className="h-3.5 w-3.5 text-white/15" />
                          {option.transport[i - 1] && (
                            <span className="text-[9px] text-white/20">
                              {option.transport[i - 1].mode === "train"
                                ? "🚄"
                                : option.transport[i - 1].mode === "bus"
                                ? "🚌"
                                : "✈️"}{" "}
                              {option.transport[i - 1].duration}
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className={`rounded-2xl border px-4 py-3 transition-all ${
                          isSelected
                            ? "border-indigo-500/20 bg-indigo-500/8"
                            : "border-white/6 bg-white/3"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {city.city}
                          </span>
                          <span className="rounded-md bg-white/6 px-1.5 py-0.5 text-[10px] font-semibold text-white/30">
                            {city.nights}n
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-white/25">
                          {city.country}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {city.highlights.slice(0, 3).map((h) => (
                            <span
                              key={h}
                              className="rounded-md bg-white/4 px-1.5 py-0.5 text-[9px] text-white/30"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    {
                      icon: <Plane className="h-3 w-3" />,
                      label: "Flights",
                      value: option.estimates.flights,
                      color: "text-indigo-400",
                    },
                    ...(option.estimates.transport > 0
                      ? [
                          {
                            icon: <TrainFront className="h-3 w-3" />,
                            label: "Transport",
                            value: option.estimates.transport,
                            color: "text-sky-400",
                          },
                        ]
                      : []),
                    {
                      icon: <Hotel className="h-3 w-3" />,
                      label: "Hotels",
                      value: option.estimates.hotels,
                      color: "text-purple-400",
                    },
                    {
                      icon: <Ticket className="h-3 w-3" />,
                      label: "Activities",
                      value: option.estimates.activities,
                      color: "text-teal-400",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/4 bg-white/2 px-3 py-2 text-center"
                    >
                      <span className={`${item.color}`}>{item.icon}</span>
                      <p className="mt-1 text-[10px] text-white/25">
                        {item.label}
                      </p>
                      <p className="text-xs font-semibold text-white/60">
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-400"
                  >
                    <Check className="h-4 w-4" />
                    Planning your trip...
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onBack}
        className="mt-8 rounded-xl px-6 py-3 text-sm font-medium text-white/30 transition-colors hover:bg-white/5 hover:text-white/50"
      >
        ← Change destination or dates
      </motion.button>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-white/20"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-indigo-400/40" />
          Routes optimized by AI for best experience per day
        </span>
        <span className="flex items-center gap-1.5">
          <BadgeIndianRupee className="h-3 w-3 text-emerald-400/40" />
          Prices include flights, hotels, transport & activities
        </span>
      </motion.div>
    </div>
  );
}
