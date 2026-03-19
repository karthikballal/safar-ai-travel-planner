"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Plane, ArrowRight, Sparkles, Home } from "lucide-react";
import SafarLogo from "./SafarLogo";
import type { ArrivalCityOption } from "@/lib/countryData";

interface Props {
  country: string;
  cities: ArrivalCityOption[];
  onSelect: (city: string) => void;
  onBack: () => void;
}

export default function ArrivalCityPicker({ country, cities, onSelect, onBack }: Props) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center px-4 pt-10 pb-20">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <SafarLogo variant="full" size={36} />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <div className="mb-3 flex items-center justify-center gap-2">
          <Plane className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium tracking-widest uppercase text-primary-600">
            Choose Your Gateway
          </span>
        </div>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
          Flying into{" "}
          <span className="bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            {country}
          </span>
        </h1>
        <p className="mx-auto max-w-md text-base text-text-muted">
          Which city would you like to arrive in? We&apos;ll plan the perfect multi-city route from there.
        </p>
      </motion.div>

      {/* City Options */}
      <div className="w-full max-w-2xl space-y-4">
        {cities.map((city, index) => (
          <motion.button
            key={city.city}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(city.city)}
            className={`group relative flex w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all ${
              city.isRecommended
                ? "border-primary-500/25 bg-primary-50 hover:border-primary-500/40 hover:bg-primary-100/50"
                : "border-border bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {/* Airport Code Badge */}
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
              city.isRecommended
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-text-secondary"
            }`}>
              {city.airport}
            </div>

            {/* City Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-text-primary">{city.city}</h3>
                {city.isRecommended && (
                  <span className="flex items-center gap-1 rounded-lg bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                    <Sparkles className="h-2.5 w-2.5" />
                    Recommended
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-text-muted truncate">{city.description}</p>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-text-secondary" />
          </motion.button>
        ))}
      </div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onBack}
        className="mt-8 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text-secondary"
      >
        <Home className="h-4 w-4" />
        Change destination
      </motion.button>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-center text-[11px] text-text-muted"
      >
        Our AI will plan an optimized multi-city route starting from your chosen city
      </motion.p>
    </div>
  );
}
