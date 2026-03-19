"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Check,
  ChevronDown,
  ChevronUp,
  Luggage,
} from "lucide-react";
import type { Flight } from "@/data/mockTrip";

interface Props {
  outbound: Flight;
  inbound: Flight;
  isOpenJaw?: boolean;
  outboundOptions?: Flight[];
  inboundOptions?: Flight[];
  onFlightSelect?: (direction: "outbound" | "inbound", flight: Flight) => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

function FlightOptionRow({
  flight,
  isSelected,
  onSelect,
  isCheapest,
}: {
  flight: Flight;
  isSelected: boolean;
  onSelect: () => void;
  isCheapest: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        isSelected
          ? "border-primary-500/40 bg-primary-50 shadow-lg shadow-primary-500/5"
          : "border-border bg-white hover:border-primary-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Selection indicator */}
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            isSelected
              ? "border-primary-500 bg-primary-500"
              : "border-gray-300 bg-transparent"
          }`}
        >
          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
        </div>

        {/* Departure */}
        <div className="w-16 shrink-0">
          <p className="text-lg font-bold text-text-primary">{flight.departure.time}</p>
          <p className="text-[11px] text-text-muted">{flight.departure.code}</p>
        </div>

        {/* Route line */}
        <div className="flex flex-1 flex-col items-center gap-0.5">
          <span className="text-[10px] text-text-muted">{flight.duration}</span>
          <div className="flex w-full items-center gap-1">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-200 to-gray-200" />
            <Plane className="h-3 w-3 text-primary-400/60" />
            <div className="h-px flex-1 bg-linear-to-r from-gray-200 via-gray-200 to-transparent" />
          </div>
          {flight.layover ? (
            <span className="text-[10px] text-amber-500/60">
              via {flight.layover.city} ({flight.layover.duration})
            </span>
          ) : (
            <span className="text-[10px] text-emerald-500/60">Non-stop</span>
          )}
        </div>

        {/* Arrival */}
        <div className="w-16 shrink-0 text-right">
          <p className="text-lg font-bold text-text-primary">{flight.arrival.time}</p>
          <p className="text-[11px] text-text-muted">{flight.arrival.code}</p>
        </div>

        {/* Airline & price */}
        <div className="w-40 shrink-0 text-right">
          <p className="text-lg font-bold text-text-primary">
            {flight.price > 0 ? formatCurrency(flight.price) : (
              <span className="text-sm font-semibold text-primary-600">Live fare on partner</span>
            )}
          </p>
          <div className="flex items-center justify-end gap-2">
            <span className="text-[11px] text-text-muted">{flight.airline}</span>
            {isCheapest && (
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500">
                Cheapest
              </span>
            )}
          </div>
          <span className="text-[10px] text-text-muted">{flight.class}</span>
        </div>
      </div>
    </motion.button>
  );
}

function FlightSection({
  label,
  selectedFlight,
  options,
  onSelect,
}: {
  label: string;
  selectedFlight: Flight;
  options: Flight[];
  onSelect: (flight: Flight) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const cheapestPrice = options.length > 0 ? Math.min(...options.map((f) => f.price)) : selectedFlight.price;

  return (
    <div className="card overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
            {label}
          </span>
          <span className="text-xs text-text-muted">
            {selectedFlight.departure.city} → {selectedFlight.arrival.city}
          </span>
          <span className="text-[11px] text-text-muted">
            {selectedFlight.departure.date}
          </span>
        </div>
        {options.length > 1 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-primary-600/70 hover:bg-primary-50 transition-colors"
          >
            {isExpanded ? "Hide" : "Show"} {options.length} options
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && options.length > 0 ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 p-4"
          >
            {options.map((flight) => (
              <FlightOptionRow
                key={flight.id}
                flight={flight}
                isSelected={flight.id === selectedFlight.id}
                onSelect={() => onSelect(flight)}
                isCheapest={flight.price === cheapestPrice}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
            <FlightOptionRow
              flight={selectedFlight}
              isSelected={true}
              onSelect={() => {}}
              isCheapest={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FlightCard({
  outbound,
  inbound,
  isOpenJaw,
  outboundOptions = [],
  inboundOptions = [],
  onFlightSelect,
}: Props) {
  const [selectedOutbound, setSelectedOutbound] = useState(outbound);
  const [selectedInbound, setSelectedInbound] = useState(inbound);

  const handleOutboundSelect = (flight: Flight) => {
    setSelectedOutbound(flight);
    onFlightSelect?.("outbound", flight);
  };

  const handleInboundSelect = (flight: Flight) => {
    setSelectedInbound(flight);
    onFlightSelect?.("inbound", flight);
  };

  const totalPrice = selectedOutbound.price + selectedInbound.price;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <Plane className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {isOpenJaw ? "Flights (Open-Jaw)" : "Flights"}
            </h2>
            <p className="text-xs text-text-muted">
              {outboundOptions.length > 0
                ? `Choose from ${outboundOptions.length} options per direction`
                : `Round-trip • ${outbound.airline}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-text-muted">Flight total</p>
          <p className="text-lg font-bold text-text-primary">{formatCurrency(totalPrice)}</p>
        </div>
      </div>

      {isOpenJaw && (
        <div className="mb-4 rounded-xl border border-sky-500/15 bg-sky-50 px-4 py-3">
          <p className="text-xs text-sky-700">
            <span className="font-semibold">✈ Open-jaw routing:</span> Fly into{" "}
            {outbound.arrival.city} ({outbound.arrival.code}), depart from{" "}
            {inbound.departure.city} ({inbound.departure.code}). No backtracking needed.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <FlightSection
          label="Outbound"
          selectedFlight={selectedOutbound}
          options={outboundOptions}
          onSelect={handleOutboundSelect}
        />
        <FlightSection
          label="Return"
          selectedFlight={selectedInbound}
          options={inboundOptions}
          onSelect={handleInboundSelect}
        />
      </div>
    </motion.section>
  );
}
