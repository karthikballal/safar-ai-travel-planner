"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plane, ArrowRight, Sparkles, Home, Check, Clock, ChevronRight } from "lucide-react";
import SafarLogo from "./SafarLogo";
import type { ArrivalCityOption } from "@/lib/countryData";

interface Props {
    country: string;
    cities: ArrivalCityOption[];
    duration: number;
    onConfirm: (selectedCities: string[], arrivalCity: string) => void;
    onBack: () => void;
}

export default function CountryCityPicker({ country, cities, duration, onConfirm, onBack }: Props) {
    const [selectedCities, setSelectedCities] = useState<Set<string>>(
        () => new Set(cities.filter((c) => c.isRecommended).map((c) => c.city))
    );

    const maxCities = Math.min(cities.length, Math.max(2, Math.floor(duration / 2)));

    const toggleCity = (city: string) => {
        setSelectedCities((prev) => {
            const next = new Set(prev);
            if (next.has(city)) {
                // Don't allow deselecting below 1
                if (next.size <= 1) return prev;
                next.delete(city);
            } else {
                // Enforce max selection
                if (next.size >= maxCities) return prev;
                next.add(city);
            }
            return next;
        });
    };

    const selectedArray = useMemo(() => Array.from(selectedCities), [selectedCities]);

    // The arrival city defaults to the recommended one, or the first selected
    const arrivalCity = useMemo(() => {
        const recommended = cities.find((c) => c.isRecommended && selectedCities.has(c.city));
        if (recommended) return recommended.city;
        return selectedArray[0] || cities[0]?.city || "";
    }, [selectedCities, selectedArray, cities]);

    const daysPerCity = useMemo(() => {
        const count = selectedCities.size;
        if (count === 0) return 0;
        return Math.floor(duration / count);
    }, [selectedCities, duration]);

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
                    <Sparkles className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium tracking-widest uppercase text-primary-600">
                        AI Travel Agent
                    </span>
                </div>
                <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
                    Which cities in{" "}
                    <span className="bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                        {country}
                    </span>
                    ?
                </h1>
                <p className="mx-auto max-w-md text-base text-text-muted">
                    Select up to {maxCities} cities you&apos;d like to explore. Our AI will plan the optimal route, transport, and day allocation.
                </p>
            </motion.div>

            {/* City Options */}
            <div className="w-full max-w-2xl space-y-3">
                {cities.map((city, index) => {
                    const isSelected = selectedCities.has(city.city);
                    return (
                        <motion.button
                            key={city.city}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleCity(city.city)}
                            className={`group relative flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all ${isSelected
                                    ? "border-primary-500/40 bg-primary-50 ring-1 ring-primary-200"
                                    : "border-border bg-white hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {/* Checkbox */}
                            <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${isSelected
                                        ? "border-primary-500 bg-primary-500"
                                        : "border-gray-300"
                                    }`}
                            >
                                {isSelected && <Check className="h-4 w-4 text-white" />}
                            </div>

                            {/* Airport Code Badge */}
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${isSelected
                                        ? "bg-primary-100 text-primary-700"
                                        : "bg-gray-100 text-text-secondary"
                                    }`}
                            >
                                {city.airport}
                            </div>

                            {/* City Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-text-primary">{city.city}</h3>
                                    {city.isRecommended && (
                                        <span className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                            <Sparkles className="h-2.5 w-2.5" />
                                            Must Visit
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-sm text-text-muted truncate">
                                    {city.description}
                                </p>
                            </div>

                            {/* Days estimate */}
                            {isSelected && (
                                <div className="shrink-0 text-right">
                                    <span className="flex items-center justify-end gap-1 text-xs font-semibold text-primary-600">
                                        <Clock className="h-3 w-3" />
                                        ~{daysPerCity} days
                                    </span>
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Selection Summary */}
            <AnimatePresence>
                {selectedArray.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8 w-full max-w-2xl"
                    >
                        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                    Your AI-Optimized Route
                                </p>
                                <span className="text-xs text-text-muted">
                                    {selectedArray.length} of {maxCities} cities · {duration} days total
                                </span>
                            </div>
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-600">
                                    <Plane className="h-3 w-3" />
                                    Arrive
                                </span>
                                {selectedArray.map((city, i) => (
                                    <React.Fragment key={city}>
                                        <span className="flex items-center gap-1.5 rounded-xl bg-primary-100 border border-primary-200 px-3 py-1.5 text-sm font-semibold text-text-primary">
                                            <MapPin className="h-3 w-3 text-primary-600" />
                                            {city}
                                            <span className="text-[10px] text-text-muted ml-1">~{daysPerCity}d</span>
                                        </span>
                                        {i < selectedArray.length - 1 && (
                                            <ChevronRight className="h-3 w-3 text-text-muted" />
                                        )}
                                    </React.Fragment>
                                ))}
                                <span className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-600">
                                    <Plane className="h-3 w-3 rotate-45" />
                                    Depart
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                disabled={selectedArray.length === 0}
                onClick={() => onConfirm(selectedArray, arrivalCity)}
                className="btn-primary mt-8 flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <Sparkles className="h-5 w-5" />
                Plan My {country} Trip
                <ArrowRight className="h-5 w-5" />
            </motion.button>

            {/* Back button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={onBack}
                className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text-secondary"
            >
                <Home className="h-4 w-4" />
                Change destination
            </motion.button>

            {/* Hint */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 text-center text-[11px] text-text-muted"
            >
                Our AI agent will research real attractions, restaurants, and transport for each city you select
            </motion.p>
        </div>
    );
}
