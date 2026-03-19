"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hotel,
  Star,
  Wifi,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  Car,
  Waves,
  ConciergeBell,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Hotel as HotelType } from "@/data/mockTrip";

interface Props {
  hotel: HotelType;
  hotels?: HotelType[];
  hotelOptions?: HotelType[][];
  onHotelSelect?: (cityIndex: number, hotel: HotelType) => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

const amenityIcons: Record<string, React.ReactNode> = {
  "Free Wi-Fi": <Wifi className="h-3.5 w-3.5" />,
  "Spa & Wellness": <Waves className="h-3.5 w-3.5" />,
  "Rooftop Bar": <Sparkles className="h-3.5 w-3.5" />,
  Concierge: <ConciergeBell className="h-3.5 w-3.5" />,
  "Room Service": <Clock className="h-3.5 w-3.5" />,
  "Fitness Center": <Dumbbell className="h-3.5 w-3.5" />,
  Restaurant: <UtensilsCrossed className="h-3.5 w-3.5" />,
  "Airport Shuttle": <Car className="h-3.5 w-3.5" />,
};

const tierBadge: Record<number, { label: string; color: string }> = {
  3: { label: "Budget", color: "bg-emerald-500/15 text-emerald-600" },
  4: { label: "Comfort", color: "bg-amber-500/15 text-amber-600" },
  5: { label: "Luxury", color: "bg-primary-500/15 text-primary-600" },
};

function HotelOptionRow({
  hotel,
  isSelected,
  onSelect,
  isCheapest,
}: {
  hotel: HotelType;
  isSelected: boolean;
  onSelect: () => void;
  isCheapest: boolean;
}) {
  const badge = tierBadge[hotel.stars] || tierBadge[4];
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
      <div className="flex items-start gap-4">
        {/* Selection indicator */}
        <div
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            isSelected
              ? "border-primary-500 bg-primary-500"
              : "border-gray-300 bg-transparent"
          }`}
        >
          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
        </div>

        {/* Hotel image */}
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Hotel info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-text-primary truncate">{hotel.name}</h4>
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${badge.color}`}>
              {badge.label}
            </span>
            {isCheapest && (
              <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                Best Value
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400/80 text-amber-400/80" />
            ))}
            <span className="ml-1 text-[11px] text-text-muted">
              {hotel.rating} ({hotel.reviews.toLocaleString()})
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-text-muted truncate">{hotel.address}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="flex items-center gap-1 rounded-lg border border-border bg-gray-50 px-2 py-0.5 text-[10px] text-text-muted"
              >
                {amenityIcons[a] || <Sparkles className="h-2.5 w-2.5" />}
                {a}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[10px] text-text-muted">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-text-primary">
            {formatCurrency(hotel.totalPrice)}
          </p>
          <p className="text-[11px] text-text-muted">
            {formatCurrency(hotel.pricePerNight)}/night
          </p>
          <p className="text-[10px] text-text-muted">{hotel.nights} nights</p>
        </div>
      </div>
    </motion.button>
  );
}

function HotelCitySection({
  cityIndex,
  selectedHotel,
  options,
  onSelect,
  showCityLabel,
}: {
  cityIndex: number;
  selectedHotel: HotelType;
  options: HotelType[];
  onSelect: (hotel: HotelType) => void;
  showCityLabel: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const cheapestPrice =
    options.length > 0
      ? Math.min(...options.map((h) => h.totalPrice))
      : selectedHotel.totalPrice;

  return (
    <div className="card overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          {showCityLabel && (
            <span className="rounded-xl bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
              Stay {cityIndex + 1}
            </span>
          )}
          <span className="text-xs text-text-secondary">
            {selectedHotel.name}
          </span>
          <span className="text-[11px] text-text-muted">
            {selectedHotel.checkIn} → {selectedHotel.checkOut}
          </span>
        </div>
        {options.length > 1 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
          >
            {isExpanded ? "Hide" : "Show"} {options.length} options
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
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
            {options.map((hotel) => (
              <HotelOptionRow
                key={hotel.id}
                hotel={hotel}
                isSelected={hotel.id === selectedHotel.id}
                onSelect={() => onSelect(hotel)}
                isCheapest={hotel.totalPrice === cheapestPrice}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            <HotelOptionRow
              hotel={selectedHotel}
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

function HotelCard({ hotel, index }: { hotel: HotelType; index?: number }) {
  return (
    <div className="card overflow-hidden rounded-2xl">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="text-xl font-bold text-white">{hotel.name}</h3>
          <p className="text-sm text-white/60">{hotel.address}</p>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 shadow-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-text-primary">{hotel.rating}</span>
          <span className="text-xs text-text-muted">
            ({hotel.reviews.toLocaleString()})
          </span>
        </div>
        {typeof index === "number" && (
          <div className="absolute top-4 left-4 rounded-xl bg-primary-500 px-3 py-1.5">
            <span className="text-xs font-bold text-white">Stay {index + 1}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-6">
        {/* Stars */}
        <div className="mb-4 flex items-center gap-1">
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-amber-400/80 text-amber-400/80"
            />
          ))}
          <span className="ml-2 text-xs text-text-muted">
            {hotel.stars}-Star Luxury Hotel
          </span>
        </div>

        {/* Amenities */}
        <div className="mb-6 flex flex-wrap gap-2">
          {hotel.amenities.map((amenity) => (
            <span
              key={amenity}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-gray-50 px-3 py-1.5 text-xs text-text-secondary"
            >
              {amenityIcons[amenity] || <Sparkles className="h-3.5 w-3.5" />}
              {amenity}
            </span>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-text-muted">Per night</p>
            <p className="text-base font-semibold text-text-secondary">
              {formatCurrency(hotel.pricePerNight)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">
              Total ({hotel.nights} nights)
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(hotel.totalPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccommodationCard({
  hotel,
  hotels,
  hotelOptions = [],
  onHotelSelect,
}: Props) {
  const baseHotels = hotels && hotels.length > 0 ? hotels : [hotel];
  const isMulti = baseHotels.length > 1;
  const hasOptions = hotelOptions.length > 0;

  // Track which hotel is selected per city
  const [selections, setSelections] = useState<HotelType[]>(baseHotels);

  const handleSelect = (cityIdx: number, h: HotelType) => {
    setSelections((prev) => {
      const next = [...prev];
      next[cityIdx] = h;
      return next;
    });
    onHotelSelect?.(cityIdx, h);
  };

  const totalCost = selections.reduce((s, h) => s + h.totalPrice, 0);
  const totalNights = selections.reduce((s, h) => s + h.nights, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <Hotel className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Accommodation</h2>
            <p className="text-xs text-text-muted">
              {hasOptions
                ? `Choose from ${hotelOptions[0]?.length ?? 0} options per stay`
                : isMulti
                ? `${selections.length} hotels • ${totalNights} nights total`
                : `${hotel.nights} nights • ${hotel.checkIn} → ${hotel.checkOut}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-text-muted">Hotel total</p>
          <p className="text-lg font-bold text-text-primary">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {hasOptions ? (
        <div className="space-y-4">
          {baseHotels.map((h, i) => (
            <HotelCitySection
              key={h.id}
              cityIndex={i}
              selectedHotel={selections[i] || h}
              options={hotelOptions[i] || []}
              onSelect={(sel) => handleSelect(i, sel)}
              showCityLabel={isMulti}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {baseHotels.map((h, i) => (
            <HotelCard key={h.id} hotel={h} index={isMulti ? i : undefined} />
          ))}
        </div>
      )}
    </motion.section>
  );
}
