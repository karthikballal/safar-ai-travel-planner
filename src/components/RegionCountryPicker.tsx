"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Check, Globe } from "lucide-react";
import SafarLogo from "./SafarLogo";
import type { RegionCountry } from "@/lib/countryData";

interface RegionCountryPickerProps {
  region: string;
  countries: RegionCountry[];
  maxSelectable?: number;
  onConfirm: (selectedCountries: string[]) => void;
  onBack: () => void;
}

export default function RegionCountryPicker({
  region,
  countries,
  maxSelectable = 4,
  onConfirm,
  onBack,
}: RegionCountryPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleCountry = (country: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(country)) {
        next.delete(country);
      } else if (next.size < maxSelectable) {
        next.add(country);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size > 0) {
      onConfirm(Array.from(selected));
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Top Nav */}
      <nav className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Change region
          </motion.button>
          <SafarLogo variant="full" size={28} />
          <div className="w-20" />
        </div>
      </nav>

      {/* Header */}
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-6 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-4 py-1.5 mb-4"
        >
          <Globe className="h-3.5 w-3.5 text-primary-600" />
          <span className="text-xs font-semibold text-primary-700">Exploring {region}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2"
        >
          Which countries would you like to cover?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-text-muted"
        >
          Select up to {maxSelectable} countries · Our AI will plan your optimal route
        </motion.p>
      </div>

      {/* Country Grid */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 flex-1 pb-32">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c, i) => {
            const isSelected = selected.has(c.country);
            return (
              <motion.button
                key={c.country}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleCountry(c.country)}
                className={`group relative text-left rounded-2xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-primary-500/40 bg-primary-50 ring-1 ring-primary-200"
                    : "border-border bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-primary-500 bg-primary-500"
                      : "border-gray-300 bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </div>

                {/* Country info */}
                <div className="flex items-start gap-3 pr-8">
                  <span className="text-2xl">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-text-primary">{c.country}</h3>
                    <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{c.description}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-text-muted">
                      <MapPin className="h-2.5 w-2.5" />
                      <span>{c.cities.join(" · ")}</span>
                    </div>
                    <p className="text-[10px] text-primary-500 mt-1 font-medium">
                      {c.budgetPerDay}/day
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs text-text-muted">
              {selected.size === 0
                ? "No countries selected"
                : `${selected.size} ${selected.size === 1 ? "country" : "countries"} selected`}
            </p>
            {selected.size > 0 && (
              <p className="text-[10px] text-text-muted mt-0.5">
                {Array.from(selected).join(" → ")}
              </p>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={selected.size > 0 ? { scale: 1.02 } : {}}
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
              selected.size > 0
                ? "btn-primary text-white cursor-pointer"
                : "bg-gray-100 text-text-muted cursor-not-allowed"
            }`}
          >
            Plan My Route
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
