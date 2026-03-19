"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plane, Globe, Flag } from "lucide-react";
import {
  searchAirportsAndCities,
  type AutocompleteSuggestion,
} from "@/data/airports";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: "origin" | "destination";
  className?: string;
  /** Badge shown inside the input (e.g. "Auto") */
  badge?: React.ReactNode;
}

export default function AutocompleteInput({
  value,
  onChange,
  placeholder = "Search city or airport…",
  icon = "destination",
  className = "",
  badge,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Debounce search
  useEffect(() => {
    if (!isFocused) return;
    const timer = setTimeout(() => {
      const results = searchAirportsAndCities(value, 8);
      setSuggestions(results);
      setHighlightedIndex(-1);
    }, 80);
    return () => clearTimeout(timer);
  }, [value, isFocused]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = useCallback(
    (s: AutocompleteSuggestion) => {
      onChange(s.value);
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;
    const isOpen = suggestions.length > 0 && isFocused && value.length >= 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0 && isOpen) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const showDropdown =
    isFocused && value.length >= 1 && suggestions.length > 0;

  const getTypeIcon = (type: AutocompleteSuggestion["type"]) => {
    switch (type) {
      case "airport":
        return <Plane className="h-3.5 w-3.5 text-primary-500" />;
      case "city":
        return <MapPin className="h-3.5 w-3.5 text-emerald-500" />;
      case "country":
        return <Flag className="h-3.5 w-3.5 text-amber-500" />;
      case "region":
        return <Globe className="h-3.5 w-3.5 text-primary-600" />;
      default:
        return <MapPin className="h-3.5 w-3.5 text-text-muted" />;
    }
  };

  const getTypeLabel = (type: AutocompleteSuggestion["type"]) => {
    switch (type) {
      case "airport":
        return "Airport";
      case "city":
        return "City";
      case "country":
        return "Country";
      case "region":
        return "Region";
      default:
        return "";
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={`w-full rounded-2xl border border-border bg-white px-5 py-4 ${
            badge ? "pr-20" : "pr-5"
          } text-base font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary-500 focus:bg-white ${className}`}
          placeholder={placeholder}
        />
        {badge && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {badge}
          </div>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-black/10"
          >
            <ul
              ref={listRef}
              className="max-h-72 overflow-y-auto py-2"
              role="listbox"
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.type}-${s.primary}-${s.code || i}`}
                  role="option"
                  aria-selected={highlightedIndex === i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s);
                  }}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
                    highlightedIndex === i
                      ? "bg-primary-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-gray-50">
                    {getTypeIcon(s.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-text-primary">
                        {s.primary}
                      </span>
                      {s.code && (
                        <span className="shrink-0 rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-primary-600">
                          {s.code}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-text-muted">
                      {s.secondary}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-text-muted">
                    {getTypeLabel(s.type)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
