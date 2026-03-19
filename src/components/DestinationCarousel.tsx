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
          <h3 className="text-base font-bold text-text-primary">
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
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white transition-all ${
              canScrollLeft
                ? "text-text-secondary hover:bg-gray-100"
                : "text-gray-300 cursor-default"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white transition-all ${
              canScrollRight
                ? "text-text-secondary hover:bg-gray-100"
                : "text-gray-300 cursor-default"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal scroll cards */}
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
      className="group relative flex w-65 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all hover:border-gray-300 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={dest.image}
          alt={dest.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 shadow-sm">
          <span className="text-sm">{dest.flag}</span>
          <span className="text-[11px] font-semibold text-text-primary">
            {dest.country}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-base font-bold text-text-primary">{dest.name}</h4>
        <p className="mb-2 text-[11px] text-text-muted">{dest.tagline}</p>

        {/* Cities covered */}
        {dest.cities && dest.cities.length > 0 && (
          <p className="mb-2 text-[10px] text-primary-500">
            {dest.cities.join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 text-[11px] text-text-muted">
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
