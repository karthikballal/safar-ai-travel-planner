"use client";

import React, { useEffect, useState } from "react";
import {
  Lightbulb,
  CloudSun,
  UtensilsCrossed,
  Train,
  Shield,
  Wallet,
  Backpack,
  Globe,
  Wifi,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
} from "lucide-react";

interface TravelTips {
  destination: string;
  isDomestic: boolean;
  weather: { current: string; bestTime: string; packingAdvice: string };
  localTips: string[];
  foodGuide: { mustTry: string[]; budgetEats: string; vegetarianFriendly: string };
  transport: { fromAirport: string; gettingAround: string; hacks: string[] };
  safety: string[];
  budgetTips: string[];
  packingChecklist: string[];
  culturalNotes: string[];
  connectivity: { simCard: string; wifi: string; currency: string };
}

interface Props {
  destination: string;
  isDomestic: boolean;
  duration: number;
}

type SectionKey = "weather" | "food" | "transport" | "safety" | "budget" | "packing" | "culture" | "connectivity" | "tips";

export default function TravelTipsPanel({ destination, isDomestic, duration }: Props) {
  const [tips, setTips] = useState<TravelTips | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<Set<SectionKey>>(new Set(["weather", "tips"]));

  useEffect(() => {
    if (!destination) return;
    setLoading(true);
    setError(false);

    fetch(`/api/travel-tips?destination=${encodeURIComponent(destination)}&domestic=${isDomestic}&duration=${duration}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tips) setTips(data.tips);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [destination, isDomestic, duration]);

  const toggle = (key: SectionKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <Loader2 size={20} className="animate-spin text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">AI Travel Tips</h3>
            <p className="text-xs text-text-muted">Generating tips for {destination}…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tips) {
    return null; // Silent fail — tips are optional
  }

  const sections: { key: SectionKey; icon: React.ElementType; title: string; content: React.ReactNode }[] = [
    {
      key: "weather",
      icon: CloudSun,
      title: "Weather & Packing",
      content: (
        <div className="space-y-2 text-xs text-text-secondary">
          <p><strong className="text-text-primary">Current:</strong> {tips.weather.current}</p>
          <p><strong className="text-text-primary">Best time to visit:</strong> {tips.weather.bestTime}</p>
          <p><strong className="text-text-primary">Pack:</strong> {tips.weather.packingAdvice}</p>
        </div>
      ),
    },
    {
      key: "tips",
      icon: Lightbulb,
      title: "Insider Tips",
      content: (
        <ul className="space-y-1.5 text-xs text-text-secondary">
          {tips.localTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">•</span>
              {tip}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "food",
      icon: UtensilsCrossed,
      title: "Food Guide",
      content: (
        <div className="space-y-2 text-xs text-text-secondary">
          <div>
            <strong className="text-text-primary">Must try:</strong>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tips.foodGuide.mustTry.map((item, i) => (
                <span key={i} className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <p><strong className="text-text-primary">Budget eats:</strong> {tips.foodGuide.budgetEats}</p>
          <p><strong className="text-text-primary">🌿 Veg-friendly:</strong> {tips.foodGuide.vegetarianFriendly}</p>
        </div>
      ),
    },
    {
      key: "transport",
      icon: Train,
      title: "Getting Around",
      content: (
        <div className="space-y-2 text-xs text-text-secondary">
          <p><strong className="text-text-primary">From airport/station:</strong> {tips.transport.fromAirport}</p>
          <p><strong className="text-text-primary">In the city:</strong> {tips.transport.gettingAround}</p>
          <div>
            <strong className="text-text-primary">Hacks:</strong>
            <ul className="mt-1 space-y-1">
              {tips.transport.hacks.map((hack, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary-500">💡</span> {hack}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      key: "safety",
      icon: Shield,
      title: "Safety",
      content: (
        <ul className="space-y-1.5 text-xs text-text-secondary">
          {tips.safety.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span> {tip}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "budget",
      icon: Wallet,
      title: "Budget Tips",
      content: (
        <ul className="space-y-1.5 text-xs text-text-secondary">
          {tips.budgetTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">₹</span> {tip}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "packing",
      icon: Backpack,
      title: "Packing Checklist",
      content: (
        <div className="grid grid-cols-2 gap-1.5 text-xs text-text-secondary">
          {tips.packingChecklist.map((item, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600" />
              {item}
            </label>
          ))}
        </div>
      ),
    },
    {
      key: "culture",
      icon: Globe,
      title: "Cultural Notes",
      content: (
        <ul className="space-y-1.5 text-xs text-text-secondary">
          {tips.culturalNotes.map((note, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5">🙏</span> {note}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "connectivity",
      icon: Wifi,
      title: "Connectivity & Money",
      content: (
        <div className="space-y-2 text-xs text-text-secondary">
          <p><strong className="text-text-primary">SIM/eSIM:</strong> {tips.connectivity.simCard}</p>
          <p><strong className="text-text-primary">WiFi:</strong> {tips.connectivity.wifi}</p>
          <p><strong className="text-text-primary">Currency:</strong> {tips.connectivity.currency}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <Sparkles size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary">AI Travel Tips for {tips.destination}</h3>
          <p className="text-[11px] text-text-muted">Powered by Gemini AI — personalized for Indian travelers</p>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-border">
        {sections.map(({ key, icon: Icon, title, content }) => (
          <div key={key}>
            <button
              onClick={() => toggle(key)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className="text-primary-600" />
                <span className="text-sm font-medium text-text-primary">{title}</span>
              </div>
              {expanded.has(key) ? (
                <ChevronUp size={16} className="text-text-muted" />
              ) : (
                <ChevronDown size={16} className="text-text-muted" />
              )}
            </button>
            {expanded.has(key) && (
              <div className="px-4 pb-4 pt-1">{content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
