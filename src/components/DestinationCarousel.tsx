"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Wallet } from "lucide-react";
import {
  destinationSuggestions,
  DestinationSuggestion,
} from "@/data/destinations";

interface Props {
  onSelect: (destination: string) => void;
}

export default function DestinationCarousel({ onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [marqueeItems] = useState(() => [
    ...destinationSuggestions,
    ...destinationSuggestions,
  ]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full"
    >
      {/* Marquee ticker */}
      <div className="relative mb-6 overflow-hidden py-2">
        <motion.div
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {marqueeItems.map((d, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-sm font-medium text-text-muted/40"
            >
              <span className="text-base">{d.flag}</span>
              <span className="tracking-wide uppercase">{d.country}</span>
              <span className="text-gray-200">•</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Section label */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-extrabold text-text-primary">
            Not sure where to go?
          </h3>
          <p className="text-xs text-text-muted">
            Pick a destination and we&apos;ll handle the rest
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white transition-all ${
              canScrollLeft
                ? "text-text-secondary hover:bg-gray-50"
                : "text-gray-300 cursor-default"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white transition-all ${
              canScrollRight
                ? "text-text-secondary hover:bg-gray-50"
                : "text-gray-300 cursor-default"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal scroll cards — PYT style with image overlay */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {destinationSuggestions.map((dest) => (
          <DestinationCard key={dest.name} dest={dest} onSelect={onSelect} />
        ))}
      </div>
    </motion.div>
  );
}

function DestinationCard({
  dest,
  onSelect,
}: {
  dest: DestinationSuggestion;
  onSelect: (name: string) => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(dest.name)}
      className="dest-card group w-60 shrink-0 snap-start"
    >
      {/* Image */}
      <img
        src={dest.image}
        alt={dest.name}
        loading="lazy"
      />
      <div className="overlay" />

      {/* Country badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 shadow-sm">
        <span className="text-sm">{dest.flag}</span>
        <span className="text-[11px] font-bold text-text-primary">
          {dest.country}
        </span>
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h4 className="text-lg font-bold text-white">{dest.name}</h4>
        <p className="text-[11px] text-white/70">{dest.tagline}</p>

        {/* Cities */}
        {dest.cities && dest.cities.length > 0 && (
          <p className="mt-1 text-[10px] text-white/50">
            {dest.cities.join(" · ")}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-[11px] text-white/70">
          <span className="flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            {dest.budget}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dest.bestTime}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
