"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────

interface CostCategory {
  label: string;
  amount: number;
  color: string;
  bgColor: string;
}

interface TripCostSummaryProps {
  destination: string;
  totalBudget: number;
  travelers: number;
  duration: number;
  flightCost: number;
  hotelCost: number;
  foodCost: number;
  activityCost: number;
  transportCost: number;
  onShareClick?: () => void;
  slug?: string;
}

// ─── Format helpers ───────────────────────────────────────────────────────

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Component ────────────────────────────────────────────────────────────

export default function TripCostSummary({
  destination,
  totalBudget,
  travelers,
  duration,
  flightCost,
  hotelCost,
  foodCost,
  activityCost,
  transportCost,
  onShareClick,
  slug,
}: TripCostSummaryProps) {
  const [copied, setCopied] = useState(false);

  const grandTotal = flightCost + hotelCost + foodCost + activityCost + transportCost;
  const perPerson = travelers > 0 ? grandTotal / travelers : grandTotal;
  const perDay = duration > 0 ? grandTotal / duration : grandTotal;

  const categories: CostCategory[] = [
    { label: "Flights", amount: flightCost, color: "bg-indigo-500", bgColor: "bg-indigo-500/20" },
    { label: "Hotels", amount: hotelCost, color: "bg-violet-500", bgColor: "bg-violet-500/20" },
    { label: "Food", amount: foodCost, color: "bg-amber-500", bgColor: "bg-amber-500/20" },
    { label: "Activities", amount: activityCost, color: "bg-emerald-500", bgColor: "bg-emerald-500/20" },
    { label: "Transport", amount: transportCost, color: "bg-sky-500", bgColor: "bg-sky-500/20" },
  ].filter((c) => c.amount > 0);

  const maxAmount = Math.max(...categories.map((c) => c.amount), 1);

  const shareUrl = slug
    ? `https://safar-ai-travel-planner.vercel.app/trip/${slug}`
    : typeof window !== "undefined"
      ? window.location.href
      : "";

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [shareUrl]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-extrabold text-white sm:text-xl">
          How much does a trip to {destination} cost?
        </h2>
        <p className="mt-1 text-xs text-white/40">
          AI-estimated cost breakdown for {duration} days, {travelers} traveler{travelers !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Total budget + per-person/day */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-white/10 backdrop-blur-xl p-4 text-center sm:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
              Total Cost
            </p>
            <p className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent sm:text-3xl">
              {formatINR(grandTotal)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
              Per Person
            </p>
            <p className="text-xl font-bold text-white">
              {formatINR(perPerson)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
              Per Day
            </p>
            <p className="text-xl font-bold text-white">
              {formatINR(perDay)}
            </p>
          </div>
        </div>

        {/* Horizontal bar chart */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Cost Breakdown
          </p>
          {categories.map((cat, i) => {
            const pct = grandTotal > 0 ? (cat.amount / grandTotal) * 100 : 0;
            const barWidth = (cat.amount / maxAmount) * 100;

            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                    <span className="text-sm font-medium text-white/80">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{formatINR(cat.amount)}</span>
                    <span className="text-[10px] font-medium text-white/40 w-10 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ delay: 0.2 + 0.1 * i, duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${cat.color}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pie-style visual (CSS-only conic gradient) */}
        {grandTotal > 0 && (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div
              className="relative h-28 w-28 shrink-0 rounded-full sm:h-32 sm:w-32"
              style={{
                background: `conic-gradient(${categories
                  .reduce<{ segments: string[]; offset: number }>(
                    (acc, cat) => {
                      const pct = (cat.amount / grandTotal) * 100;
                      const colorMap: Record<string, string> = {
                        "bg-indigo-500": "#6366f1",
                        "bg-violet-500": "#8b5cf6",
                        "bg-amber-500": "#f59e0b",
                        "bg-emerald-500": "#10b981",
                        "bg-sky-500": "#0ea5e9",
                      };
                      const hex = colorMap[cat.color] || "#6366f1";
                      acc.segments.push(
                        `${hex} ${acc.offset}% ${acc.offset + pct}%`
                      );
                      acc.offset += pct;
                      return acc;
                    },
                    { segments: [], offset: 0 }
                  )
                  .segments.join(", ")})`,
              }}
            >
              <div className="absolute inset-3 rounded-full bg-[#050510] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/60">
                  {categories.length} items
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-y-2.5">
              {categories.map((cat) => {
                const pct = grandTotal > 0 ? (cat.amount / grandTotal) * 100 : 0;
                return (
                  <div key={cat.label} className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cat.color}`} />
                    <span className="text-xs text-white/60">
                      {cat.label}{" "}
                      <span className="font-semibold text-white/80">{pct.toFixed(0)}%</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Share button */}
        <div className="flex items-center gap-3 pt-2">
          {onShareClick && (
            <button
              onClick={onShareClick}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.02] active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              Share Cost Summary
            </button>
          )}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xl px-4 py-2.5 text-sm font-medium text-white/70 transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
