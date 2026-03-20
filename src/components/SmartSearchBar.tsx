"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, ArrowRight, Loader2, MapPin, Calendar, Wallet } from "lucide-react";

interface SmartSearchResult {
  type: "travel" | "non_travel";
  destination?: string;
  duration?: number;
  budget?: number;
  tripType?: "domestic" | "international";
  travelers?: number;
  children?: number;
  foodPreference?: string;
  startDate?: string;
  message: string;
  suggestions?: string[];
}

const PLACEHOLDER_EXAMPLES = [
  "Plan a trip to Bali for 7 days...",
  "Family vacation in Kerala under ₹50,000...",
  "Solo trip to Japan in April...",
  "Budget honeymoon in Maldives...",
  "5-day trip to Goa with friends...",
  "Explore Europe for 2 weeks...",
  "Weekend getaway to Manali...",
];

export default function SmartSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartSearchResult | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data: SmartSearchResult = await res.json();
      setResult(data);

      if (data.type === "travel" && data.destination) {
        setTimeout(() => {
          const params = new URLSearchParams();
          params.set("destination", data.destination!);
          if (data.duration) params.set("duration", String(data.duration));
          if (data.budget) params.set("budget", String(data.budget));
          if (data.tripType) params.set("type", data.tripType);
          if (data.travelers) params.set("adults", String(data.travelers));
          if (data.children) params.set("children", String(data.children));
          if (data.foodPreference) params.set("food", data.foodPreference);
          router.push(`/plan?${params.toString()}`);
        }, 2000);
      }
    } catch {
      setResult({
        type: "non_travel",
        message:
          "Something went wrong. Try again or click 'Start Planning' below!",
        suggestions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setTimeout(() => {
      setLoading(true);
      setResult(null);
      fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: suggestion }),
      })
        .then((res) => res.json())
        .then((data: SmartSearchResult) => {
          setResult(data);
          if (data.type === "travel" && data.destination) {
            setTimeout(() => {
              const params = new URLSearchParams();
              params.set("destination", data.destination!);
              if (data.duration)
                params.set("duration", String(data.duration));
              if (data.budget) params.set("budget", String(data.budget));
              if (data.tripType) params.set("type", data.tripType);
              router.push(`/plan?${params.toString()}`);
            }, 1500);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 100);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Search Input — PYT-style integrated bar */}
      <div className="relative">
        <div className="flex items-center gap-3 rounded-full border border-border bg-white px-5 py-3 shadow-lg shadow-black/5 transition-all focus-within:border-primary-400 focus-within:shadow-xl focus-within:shadow-primary-500/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500">
            <Search size={18} className="text-white" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResult(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none sm:text-base"
            aria-label="Search for a trip"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary-500 px-5 text-sm font-bold text-white transition-all hover:bg-primary-600 disabled:opacity-40"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Plan
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Quick suggestion chips */}
        {!result && !query && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "Trip to Goa",
              "Bali honeymoon",
              "Family trip Kerala",
              "Budget Thailand",
            ].map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestionClick(s)}
                className="rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-text-secondary shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
              >
                <Search size={10} className="mr-1.5 inline" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-4 rounded-2xl border border-border bg-white p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                result.type === "travel"
                  ? "bg-primary-50 border border-primary-200"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              {result.type === "travel" ? (
                <MapPin size={16} className="text-primary-600" />
              ) : (
                <Sparkles size={16} className="text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-primary leading-relaxed">
                {result.message}
              </p>

              {result.type === "travel" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.destination && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-bold text-primary-700">
                      <MapPin size={12} /> {result.destination}
                    </span>
                  )}
                  {result.duration && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                      <Calendar size={12} /> {result.duration} days
                    </span>
                  )}
                  {result.budget && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                      <Wallet size={12} /> ₹
                      {result.budget.toLocaleString("en-IN")}
                    </span>
                  )}
                  {result.tripType && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs font-bold text-gray-600">
                      {result.tripType === "domestic" ? "🇮🇳" : "🌍"}{" "}
                      {result.tripType}
                    </span>
                  )}
                </div>
              )}

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="rounded-full bg-gray-50 border border-border px-3 py-1 text-xs font-medium text-text-secondary hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {result.type === "travel" && result.destination && (
                <p className="mt-3 text-[11px] font-bold text-primary-600 animate-pulse">
                  ✨ Taking you to the planner...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
