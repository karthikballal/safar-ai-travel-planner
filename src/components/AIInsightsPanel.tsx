"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ChevronDown,
  Plane,
  Hotel,
  UtensilsCrossed,
  Map,
  FileText,
  Wallet,
  Train,
  Lightbulb,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useTripStore } from "@/store/useTripStore";

interface InsightSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  content: React.ReactNode;
}

export default function AIInsightsPanel() {
  const { agentIntelligence } = useTripStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!agentIntelligence) return null;

  const hasAnyData = Object.values(agentIntelligence).some(v => v != null);
  if (!hasAnyData) return null;

  const sections: InsightSection[] = [];

  // Budget Intelligence
  if (agentIntelligence.budgetIntel) {
    const budget = agentIntelligence.budgetIntel as Record<string, unknown>;
    const allocation = budget.allocation as Record<string, { percentage: number; amount: number; reasoning: string }> | undefined;
    const savingTips = (budget.saving_tips || budget.savingTips) as string[] | undefined;
    const creditCardTips = (budget.credit_card_tips || budget.creditCardTips) as string[] | undefined;
    const warnings = budget.warnings as string[] | undefined;
    const verdict = (budget.budget_verdict || budget.budgetVerdict) as string | undefined;

    sections.push({
      id: "budget",
      title: `Budget Analysis${verdict ? ` — ${verdict.charAt(0).toUpperCase() + verdict.slice(1)}` : ""}`,
      icon: <Wallet className="h-4 w-4" />,
      color: "text-emerald-600",
      content: (
        <div className="space-y-4">
          {warnings && warnings.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="text-xs text-amber-800">
                {warnings.map((w, i) => <p key={i}>{w}</p>)}
              </div>
            </div>
          )}
          {allocation && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(allocation).map(([key, val]) => (
                <div key={key} className="rounded-lg bg-gray-50 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-secondary capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-xs font-bold text-primary-600">{val.percentage}%</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">₹{val.amount?.toLocaleString("en-IN")}</p>
                  <p className="mt-0.5 text-[10px] text-text-muted">{val.reasoning}</p>
                </div>
              ))}
            </div>
          )}
          {savingTips && savingTips.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-text-secondary flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> Saving Tips
              </p>
              <ul className="space-y-1">
                {savingTips.map((tip, i) => (
                  <li key={i} className="text-xs text-text-muted flex items-start gap-1.5">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {creditCardTips && creditCardTips.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-text-secondary flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Credit Card Offers
              </p>
              <ul className="space-y-1">
                {creditCardTips.map((tip, i) => (
                  <li key={i} className="text-xs text-text-muted flex items-start gap-1.5">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    });
  }

  // Flight Intelligence
  if (agentIntelligence.flightIntel) {
    const flight = agentIntelligence.flightIntel as Record<string, unknown>;
    const airlines = flight.airlines as Array<{ name: string; price_per_person?: number; stops?: number; duration?: string }> | undefined;
    const bookingTip = (flight.booking_tip || flight.bookingTip) as string | undefined;
    const bestPlatform = (flight.best_platform || flight.bestPlatform) as string | undefined;

    sections.push({
      id: "flights",
      title: "Flight Intelligence",
      icon: <Plane className="h-4 w-4" />,
      color: "text-blue-600",
      content: (
        <div className="space-y-3">
          {airlines && airlines.length > 0 && (
            <div className="space-y-2">
              {airlines.slice(0, 5).map((airline, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{airline.name}</p>
                    <p className="text-[10px] text-text-muted">
                      {airline.stops != null && `${airline.stops === 0 ? "Direct" : `${airline.stops} stop`}`}
                      {airline.duration && ` · ${airline.duration}`}
                    </p>
                  </div>
                  {airline.price_per_person && (
                    <p className="text-sm font-bold text-primary-600">₹{airline.price_per_person.toLocaleString("en-IN")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {bestPlatform && (
            <p className="text-xs text-text-muted">
              <span className="font-medium text-text-secondary">Best platform:</span> {bestPlatform}
            </p>
          )}
          {bookingTip && (
            <div className="flex items-start gap-1.5 rounded-lg bg-blue-50 px-3 py-2">
              <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
              <p className="text-xs text-blue-800">{bookingTip}</p>
            </div>
          )}
        </div>
      ),
    });
  }

  // Hotel Intelligence
  if (agentIntelligence.hotelIntel) {
    const hotel = agentIntelligence.hotelIntel as Record<string, unknown>;
    const hotelCities = hotel.cities as Array<{
      city: string;
      best_neighborhood?: string;
      hotels?: Array<{ name: string; price_per_night?: number; rating?: number; best_platform?: string }>;
      insider_tip?: string;
    }> | undefined;

    if (hotelCities && hotelCities.length > 0) {
      sections.push({
        id: "hotels",
        title: "Hotel Intelligence",
        icon: <Hotel className="h-4 w-4" />,
        color: "text-purple-600",
        content: (
          <div className="space-y-4">
            {hotelCities.map((city, ci) => (
              <div key={ci}>
                <p className="text-xs font-bold text-text-primary mb-1">{city.city}</p>
                {city.best_neighborhood && (
                  <p className="text-[10px] text-text-muted mb-2">Best area: {city.best_neighborhood}</p>
                )}
                {city.hotels && (
                  <div className="space-y-1.5">
                    {city.hotels.slice(0, 3).map((h, hi) => (
                      <div key={hi} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                        <div>
                          <p className="text-xs font-medium text-text-primary">{h.name}</p>
                          <p className="text-[10px] text-text-muted">
                            {h.rating && `★ ${h.rating}`}{h.best_platform && ` · ${h.best_platform}`}
                          </p>
                        </div>
                        {h.price_per_night && (
                          <p className="text-xs font-bold text-primary-600">₹{h.price_per_night.toLocaleString("en-IN")}/night</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {city.insider_tip && (
                  <p className="mt-1.5 text-[10px] text-text-muted italic">💡 {city.insider_tip}</p>
                )}
              </div>
            ))}
          </div>
        ),
      });
    }
  }

  // Dining Intelligence
  if (agentIntelligence.diningIntel) {
    const dining = agentIntelligence.diningIntel as Record<string, unknown>;
    const diningCities = dining.cities as Array<{
      city: string;
      must_try_dishes?: string[];
      restaurants?: Array<{ name: string; cuisine?: string; price_per_person?: number; specialty?: string }>;
      food_safety_tip?: string;
    }> | undefined;

    if (diningCities && diningCities.length > 0) {
      sections.push({
        id: "dining",
        title: "Dining Intelligence",
        icon: <UtensilsCrossed className="h-4 w-4" />,
        color: "text-amber-600",
        content: (
          <div className="space-y-4">
            {diningCities.map((city, ci) => (
              <div key={ci}>
                <p className="text-xs font-bold text-text-primary mb-1">{city.city}</p>
                {city.must_try_dishes && city.must_try_dishes.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {city.must_try_dishes.slice(0, 5).map((dish, di) => (
                      <span key={di} className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
                        🍽️ {dish}
                      </span>
                    ))}
                  </div>
                )}
                {city.restaurants && (
                  <div className="space-y-1.5">
                    {city.restaurants.slice(0, 4).map((r, ri) => (
                      <div key={ri} className="rounded-lg bg-gray-50 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-text-primary">{r.name}</p>
                          {r.price_per_person && (
                            <p className="text-[10px] font-bold text-text-secondary">₹{r.price_per_person}/person</p>
                          )}
                        </div>
                        {r.specialty && <p className="text-[10px] text-text-muted">{r.specialty}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ),
      });
    }
  }

  // Visa Intelligence (international only)
  if (agentIntelligence.visaIntel) {
    const visa = agentIntelligence.visaIntel as Record<string, unknown>;
    const countries = visa.countries as Array<{
      country: string;
      visa_type?: string;
      visa_required?: boolean;
      processing_time?: string;
      cost_inr?: number;
      documents?: string[];
      advance_booking?: string;
    }> | undefined;

    if (countries && countries.length > 0) {
      sections.push({
        id: "visa",
        title: "Visa Intelligence",
        icon: <FileText className="h-4 w-4" />,
        color: "text-red-600",
        content: (
          <div className="space-y-3">
            {countries.map((c, ci) => (
              <div key={ci} className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-text-primary">{c.country}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    c.visa_required === false ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {c.visa_required === false ? "Visa Free" : c.visa_type || "Visa Required"}
                  </span>
                </div>
                {c.processing_time && <p className="text-[10px] text-text-muted">Processing: {c.processing_time}</p>}
                {c.cost_inr && <p className="text-[10px] text-text-muted">Cost: ₹{c.cost_inr.toLocaleString("en-IN")}</p>}
                {c.advance_booking && <p className="text-[10px] text-text-muted">Apply: {c.advance_booking}</p>}
                {c.documents && c.documents.length > 0 && (
                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-[10px] font-medium text-primary-600">View document checklist</summary>
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {c.documents.map((doc, di) => (
                        <li key={di} className="text-[10px] text-text-muted list-disc">{doc}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        ),
      });
    }
  }

  // Transport Intelligence
  if (agentIntelligence.transportIntel) {
    const transport = agentIntelligence.transportIntel as Record<string, unknown>;
    const transportCities = transport.cities as Array<{
      city: string;
      best_option?: string;
      airport_transfer?: { cheapest?: string; fastest?: string };
      daily_transport_budget?: number;
      daily_transport_budget_inr?: number;
      tip?: string;
    }> | undefined;

    if (transportCities && transportCities.length > 0) {
      sections.push({
        id: "transport",
        title: "Transport Intelligence",
        icon: <Train className="h-4 w-4" />,
        color: "text-cyan-600",
        content: (
          <div className="space-y-3">
            {transportCities.map((city, ci) => (
              <div key={ci} className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-bold text-text-primary mb-1">{city.city}</p>
                {city.best_option && <p className="text-[10px] text-text-muted">Best option: {city.best_option}</p>}
                {city.airport_transfer && (
                  <div className="mt-1 text-[10px] text-text-muted">
                    {city.airport_transfer.cheapest && <p>💰 Cheapest: {city.airport_transfer.cheapest}</p>}
                    {city.airport_transfer.fastest && <p>⚡ Fastest: {city.airport_transfer.fastest}</p>}
                  </div>
                )}
                {(city.daily_transport_budget || city.daily_transport_budget_inr) && (
                  <p className="text-[10px] text-text-muted">
                    Daily budget: ₹{(city.daily_transport_budget || city.daily_transport_budget_inr || 0).toLocaleString("en-IN")}
                  </p>
                )}
                {city.tip && <p className="mt-1 text-[10px] text-primary-600 italic">💡 {city.tip}</p>}
              </div>
            ))}
          </div>
        ),
      });
    }
  }

  if (sections.length === 0) return null;

  return (
    <div className="mx-auto mt-8 max-w-4xl px-4">
      <div className="rounded-3xl border border-primary-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">AI Agent Intelligence</h3>
            <p className="text-xs text-text-muted">
              Real insights from {sections.length} specialized Gemini AI agents
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.id} className="overflow-hidden rounded-xl border border-gray-100">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-2.5">
                  <span className={section.color}>{section.icon}</span>
                  <span className="text-sm font-semibold text-text-primary">{section.title}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-text-muted transition-transform ${
                    expandedSection === section.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 px-4 py-3">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
