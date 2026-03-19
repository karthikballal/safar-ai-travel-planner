"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrainFront,
  Plane,
  Bus,
  Ship,
  Car,
  ArrowRight,
  Clock,
  Ticket,
} from "lucide-react";
import type { TransportSegment } from "@/data/mockTrip";

interface Props {
  segments: TransportSegment[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

const modeIcon: Record<string, React.ReactNode> = {
  train: <TrainFront className="h-5 w-5" />,
  flight: <Plane className="h-5 w-5" />,
  bus: <Bus className="h-5 w-5" />,
  ferry: <Ship className="h-5 w-5" />,
  car: <Car className="h-5 w-5" />,
};

const modeColor: Record<string, string> = {
  train: "text-sky-400 bg-sky-500/10",
  flight: "text-indigo-400 bg-indigo-500/10",
  bus: "text-emerald-400 bg-emerald-500/10",
  ferry: "text-cyan-400 bg-cyan-500/10",
  car: "text-amber-400 bg-amber-500/10",
};

const modeLabel: Record<string, string> = {
  train: "Train",
  flight: "Internal Flight",
  bus: "Bus",
  ferry: "Ferry",
  car: "Car Transfer",
};

export default function TransportCard({ segments }: Props) {
  if (!segments.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
          <TrainFront className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Getting Around</h2>
          <p className="text-xs text-white/40">
            {segments.length} internal transfer{segments.length > 1 ? "s" : ""} • Trains, flights & more
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((seg) => (
          <div key={seg.id} className="glass-card rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    modeColor[seg.mode] || "text-white/40 bg-white/5"
                  }`}
                >
                  {modeIcon[seg.mode]}
                </span>
                <div>
                  <span className="text-xs font-semibold text-white/60">
                    {modeLabel[seg.mode] || seg.mode}
                  </span>
                  <p className="text-[11px] text-white/30">{seg.operator}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-white">
                {formatCurrency(seg.price)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* From */}
              <div className="flex-1">
                <p className="text-lg font-bold text-white">{seg.from.city}</p>
                <p className="text-xs text-white/30">{seg.departureTime}</p>
              </div>

              {/* Arrow & duration */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] text-white/30">{seg.duration}</span>
                <div className="flex items-center gap-1">
                  <div className="h-px w-8 bg-white/15" />
                  <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                  <div className="h-px w-8 bg-white/15" />
                </div>
              </div>

              {/* To */}
              <div className="flex-1 text-right">
                <p className="text-lg font-bold text-white">{seg.to.city}</p>
                <p className="text-xs text-white/30">{seg.arrivalTime}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 border-t border-white/6 pt-3">
              <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                <Clock className="h-3 w-3" />
                {seg.date}
              </div>
              {seg.notes && (
                <>
                  <span className="text-white/10">•</span>
                  <span className="text-[11px] text-white/25">{seg.notes}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/3 px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Ticket className="h-3.5 w-3.5" />
          Total internal transport
        </div>
        <span className="text-sm font-bold text-white">
          {formatCurrency(segments.reduce((s, seg) => s + seg.price, 0))}
        </span>
      </div>
    </motion.section>
  );
}
