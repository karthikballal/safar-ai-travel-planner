"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plane,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  Calendar,
  Info,
} from "lucide-react";

interface PriceInfo {
  price: number;
  tier: "cheap" | "average" | "expensive";
  source: "live" | "cached";
}

interface PriceCalendarProps {
  origin: string;
  destination: string;
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatPrice = (v: number) => {
  if (v >= 100000) return `₹${(v / 1000).toFixed(0)}K`;
  if (v >= 10000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
};

const formatFullPrice = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

export default function PriceCalendar({
  origin,
  destination,
  selectedDate,
  onDateSelect,
}: PriceCalendarProps) {
  const initialDate = useMemo(() => {
    const d = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [year, setYear] = useState(initialDate.year);
  const [month, setMonth] = useState(initialDate.month);
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({});
  const [loading, setLoading] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const cache = useRef<Record<string, Record<string, PriceInfo>>>({});

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Fetch prices when month/origin/destination changes
  const fetchPrices = useCallback(async () => {
    if (!origin.trim() || !destination.trim()) return;

    const cacheKey = `${origin}-${destination}-${year}-${month}`;
    if (cache.current[cacheKey]) {
      setPrices(cache.current[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/flight-prices?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&year=${year}&month=${month}`
      );
      if (res.ok) {
        const data = await res.json();
        cache.current[cacheKey] = data.prices;
        setPrices(data.prices);
      }
    } catch {
      // Silently fail — calendar still works without prices
    } finally {
      setLoading(false);
    }
  }, [origin, destination, year, month]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Calendar grid calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  const navigateMonth = (direction: -1 | 1) => {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
  };

  // Stats
  const priceValues = Object.values(prices).map((p) => p.price).filter(Boolean);
  const cheapestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const cheapestDate = Object.entries(prices).find(([, p]) => p.price === cheapestPrice)?.[0];
  const expensivePrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;

  // Format cheapest date for display
  const cheapestDateFormatted = cheapestDate
    ? new Date(cheapestDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
    : "";

  const hoveredInfo = hoveredDate ? prices[hoveredDate] : null;
  const selectedInfo = prices[selectedDate];

  return (
    <div className="space-y-3">
      {/* Calendar container */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-text-secondary transition-colors hover:bg-gray-200 hover:text-text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">
              {isMounted ? `${MONTH_NAMES[month]} ${year}` : ""}
            </span>
            {loading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-text-secondary transition-colors hover:bg-gray-200 hover:text-text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 px-2 py-2">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold uppercase tracking-wider text-text-muted"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-50 p-1">
          {Array.from({ length: totalCells }).map((_, idx) => {
            const dayNum = idx - firstDayOfWeek + 1;
            const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
            const dateStr = isValidDay
              ? `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
              : "";
            const isPast = dateStr && dateStr < today;
            const isSelected = dateStr === selectedDate;
            const isHovered = dateStr === hoveredDate;
            const isCheapest = dateStr === cheapestDate;
            const priceInfo = dateStr ? prices[dateStr] : null;
            const isWeekend = idx % 7 === 0 || idx % 7 === 6;

            if (!isValidDay) {
              return <div key={idx} className="h-14 sm:h-16" />;
            }

            return (
              <motion.button
                key={idx}
                disabled={!!isPast}
                onClick={() => !isPast && onDateSelect(dateStr)}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                whileTap={!isPast ? { scale: 0.95 } : undefined}
                className={`relative flex h-14 sm:h-16 flex-col items-center justify-center rounded-xl transition-all duration-150 ${isPast
                    ? "cursor-not-allowed opacity-25"
                    : isSelected
                      ? "bg-primary-50 border border-primary-500 shadow-sm"
                      : isHovered
                        ? "bg-gray-100 border border-gray-200"
                        : isCheapest
                          ? "bg-emerald-50 border border-emerald-200"
                          : "border border-transparent hover:bg-gray-50"
                  }`}
              >
                {/* Day number */}
                <span
                  className={`text-xs font-semibold ${isSelected
                      ? "text-primary-700"
                      : isWeekend
                        ? "text-text-muted"
                        : "text-text-secondary"
                    }`}
                >
                  {dayNum}
                </span>

                {/* Price tag */}
                {priceInfo && !isPast && (
                  <span
                    className={`mt-0.5 text-[9px] font-bold leading-none ${priceInfo.tier === "cheap"
                        ? "text-emerald-600"
                        : priceInfo.tier === "expensive"
                          ? "text-red-500"
                          : "text-text-muted"
                      }`}
                  >
                    {formatPrice(priceInfo.price)}
                  </span>
                )}

                {/* Cheapest badge */}
                {isCheapest && !isPast && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[7px] font-black text-white">
                    ★
                  </span>
                )}

                {/* Tier indicator dot */}
                {priceInfo && !isPast && (
                  <div
                    className={`mt-0.5 h-1 w-1 rounded-full ${priceInfo.tier === "cheap"
                        ? "bg-emerald-500"
                        : priceInfo.tier === "expensive"
                          ? "bg-red-400"
                          : "bg-gray-300"
                      }`}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Hover/selected tooltip bar */}
        <AnimatePresence mode="wait">
          {(hoveredInfo || selectedInfo) && (
            <motion.div
              key={hoveredDate || selectedDate}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-gray-50">
                <div className="flex items-center gap-2 text-xs">
                  <Plane className="h-3 w-3 text-primary-500" />
                  <span className="text-text-muted">
                    {isMounted ? (
                      hoveredDate
                        ? new Date(hoveredDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
                        : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
                    ) : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${(hoveredInfo || selectedInfo)!.tier === "cheap"
                        ? "bg-emerald-50 text-emerald-600"
                        : (hoveredInfo || selectedInfo)!.tier === "expensive"
                          ? "bg-red-50 text-red-500"
                          : "bg-gray-100 text-text-muted"
                      }`}
                  >
                    {(hoveredInfo || selectedInfo)!.tier === "cheap"
                      ? "Low fare"
                      : (hoveredInfo || selectedInfo)!.tier === "expensive"
                        ? "High fare"
                        : "Average"}
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {formatFullPrice((hoveredInfo || selectedInfo)!.price)}
                  </span>
                  <span className="text-[10px] text-text-muted">/person</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend and insights */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Cheap
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-300" />
            Average
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Expensive
          </span>
        </div>

        {/* Cheapest insight */}
        {cheapestDate && (
          <motion.button
            onClick={() => onDateSelect(cheapestDate)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
          >
            <TrendingDown className="h-3 w-3" />
            Cheapest: {isMounted ? cheapestDateFormatted : ""} — {formatFullPrice(cheapestPrice)}
          </motion.button>
        )}
      </div>

      {/* Data source note */}
      <div className="flex items-center gap-1.5 text-[9px] text-text-muted">
        <Info className="h-2.5 w-2.5" />
        {Object.values(prices).some((p) => p.source === "live")
          ? "Prices from Google Flights — updated in real-time"
          : Object.values(prices).some((p) => p.source === "cached")
            ? "Prices calibrated with Skyscanner data"
            : origin.trim() && destination.trim()
              ? "Live price data unavailable for this route right now — use flight search results for partner redirects"
              : "Enter origin & destination to see flight prices"
        }
      </div>
    </div>
  );
}
