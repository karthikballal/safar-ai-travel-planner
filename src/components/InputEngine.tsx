"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  MapPin,
  Calendar,
  Users,
  Wallet,
  UtensilsCrossed,
  Sparkles,
  Baby,
  User,
  BedDouble,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { LogOut, UserCircle } from "lucide-react";
import DestinationCarousel from "./DestinationCarousel";
import PriceCalendar from "./PriceCalendar";
import SafarLogo from "./SafarLogo";
import AutocompleteInput from "./AutocompleteInput";
import { isBudgetUnrealistic, getDestinationBudget } from "@/lib/agents";
import { useGeolocation } from "@/lib/geolocation";
import { getSmartStartDate, getVisaAdvisory } from "@/lib/visaIntelligence";
import { useAuth, getInitials } from "@/lib/auth";
import { isDomesticTrip } from "@/lib/countryData";

export type TravelStyle = "comfort" | "backpacker" | "luxury" | "adventure" | "cultural" | "romantic" | "family";

export interface TravelInput {
  origin: string;
  destination: string;
  startDate: string;
  duration: number;
  adults: number;
  children: number;
  rooms: number;
  budget: number;
  foodPreference: "any" | "veg" | "nonveg";
  tripType: "domestic" | "international";
  travelStyle?: TravelStyle;
  interests?: string[];
  selectedCities?: string[];
}

interface Props {
  onSubmit: (input: TravelInput) => void;
  onSignOut?: () => void;
}

export default function InputEngine({ onSubmit, onSignOut }: Props) {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(() => {
    // Default to a date 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [duration, setDuration] = useState(7);
  const [budget, setBudget] = useState(300000);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Pre-fill form from URL params (from smart search or destination cards)
  useEffect(() => {
    const dest = searchParams.get("destination");
    const dur = searchParams.get("duration");
    const bud = searchParams.get("budget");
    const type = searchParams.get("type");
    const ad = searchParams.get("adults");
    const ch = searchParams.get("children");
    const food = searchParams.get("food");

    if (dest) setDestination(dest);
    if (dur) setDuration(parseInt(dur, 10));
    if (bud) setBudget(parseInt(bud, 10));
    if (type === "domestic" || type === "international") setTripType(type);
    if (ad) setAdults(parseInt(ad, 10));
    if (ch) setChildren(parseInt(ch, 10));
    if (food === "vegetarian" || food === "veg") setFoodPreference("veg");
    else if (food === "non-veg" || food === "nonveg") setFoodPreference("nonveg");
  }, [searchParams]);

  const [foodPreference, setFoodPreference] = useState<
    "any" | "veg" | "nonveg"
  >("any");
  const [tripType, setTripType] = useState<"domestic" | "international">("international");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("comfort");
  const [interests, setInterests] = useState<string[]>([]);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [budgetWarningMsg, setBudgetWarningMsg] = useState("");
  const [suggestedBudget, setSuggestedBudget] = useState(0);
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);
  const [visaMessage, setVisaMessage] = useState("");
  const [visaSeverity, setVisaSeverity] = useState<"none" | "info" | "warning">("none");
  const [originAutoDetected, setOriginAutoDetected] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Auto-detect user's city via geolocation
  const geo = useGeolocation();
  useEffect(() => {
    if (geo.city && !origin && !originAutoDetected) {
      setOrigin(geo.city);
      setOriginAutoDetected(true);
    }
  }, [geo.city, origin, originAutoDetected]);

  // Visa-aware smart start date — updates when destination changes
  useEffect(() => {
    if (!destination.trim()) {
      setVisaMessage("");
      setVisaSeverity("none");
      return;
    }
    const smartDate = getSmartStartDate(destination);
    setStartDate(smartDate);
    const advisory = getVisaAdvisory(destination);
    setVisaMessage(advisory.message);
    setVisaSeverity(advisory.severity);
  }, [destination]);

  // Auto-show price calendar when both origin & destination are set
  useEffect(() => {
    if (origin.trim() && destination.trim() && !showPriceCalendar) {
      setShowPriceCalendar(true);
    }
  }, [origin, destination]);

  const totalTravelers = adults + children;

  // Budget validation whenever destination/duration/travelers change
  useEffect(() => {
    if (!destination.trim()) {
      setShowBudgetWarning(false);
      return;
    }
    const check = isBudgetUnrealistic(
      budget,
      destination,
      duration,
      totalTravelers
    );
    setShowBudgetWarning(check.unrealistic);
    setBudgetWarningMsg(check.message);
    setSuggestedBudget(check.suggestion);
  }, [budget, destination, duration, totalTravelers]);

  // Smart room suggestion
  useEffect(() => {
    const minRooms = Math.max(1, Math.ceil(totalTravelers / 3));
    if (rooms < minRooms) setRooms(minRooms);
  }, [adults, children, rooms]);

  // Budget range based on destination
  const budgetRange = useMemo(() => {
    if (!destination.trim()) return null;
    return getDestinationBudget(destination, duration, totalTravelers);
  }, [destination, duration, totalTravelers]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  // Auto-detect domestic trip
  useEffect(() => {
    if (origin.trim() && destination.trim()) {
      const domestic = isDomesticTrip(origin, destination);
      setTripType(domestic ? "domestic" : "international");
    }
  }, [origin, destination]);

  const handleSubmit = () => {
    if (!origin.trim() || !destination.trim()) return;
    onSubmit({
      origin,
      destination,
      startDate,
      duration,
      adults,
      children,
      rooms,
      budget,
      foodPreference,
      tripType,
      travelStyle,
      interests: interests.length > 0 ? interests : undefined,
    });
  };

  const handleDestinationSelect = (name: string) => {
    setDestination(name);
    const est = getDestinationBudget(name, duration, totalTravelers);
    if (budget < est.totalMinimum) {
      setBudget(est.totalComfortable);
    }
  };

  const foodOptions: {
    label: string;
    value: "any" | "veg" | "nonveg";
    icon: string;
  }[] = [
      { label: "Any", value: "any", icon: "🍽️" },
      { label: "Vegetarian", value: "veg", icon: "🥬" },
      { label: "Non-Veg", value: "nonveg", icon: "🥩" },
    ];

  const canSubmit = origin.trim().length > 0 && destination.trim().length > 0;

  return (
    <div className="relative z-10 flex flex-col items-center px-4 pt-6 pb-20">
      {/* User Menu - Top Right */}
      {user && (
        <div className="absolute top-4 right-4 z-50 sm:top-6 sm:right-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary-600 to-primary-500 text-xs font-bold text-white shadow-lg shadow-primary-500/20 ring-2 ring-primary-200 transition-all hover:ring-primary-300"
          >
            {getInitials(user.name)}
          </motion.button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-13 w-56 rounded-2xl border border-border bg-white p-3 shadow-2xl"
              >
                <div className="mb-2 border-b border-gray-200 pb-2">
                  <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                  <p className="text-[11px] text-text-muted">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onSignOut) onSignOut();
                    else signOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Company Logo & Brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <SafarLogo variant="full" size={44} />
      </motion.div>

      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10 text-center"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium tracking-widest uppercase text-primary-600">
            Agentic AI Travel Planner
          </span>
        </div>
        <h1 className="mb-4 text-5xl leading-tight font-extrabold tracking-tight text-text-primary font-display sm:text-6xl md:text-7xl">
          Where to
          <span className="bg-linear-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
            {" "}
            next?
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed font-light text-text-muted">
          7 specialised AI agents collaborate in real-time — researching flights,
          hotels, dining, activities, deals & visa docs — to craft your perfect
          trip.
        </p>
      </motion.div>

      {/* Destination Carousel */}
      <div className="mb-10 w-full max-w-4xl">
        <DestinationCarousel onSelect={handleDestinationSelect} />
      </div>

      {/* Light Card Form */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="card w-full max-w-2xl rounded-3xl p-8 sm:p-10"
      >
        {/* Domestic / International Toggle */}
        <div className="mb-8 flex items-center justify-center">
          <div className="inline-flex rounded-2xl border border-border bg-gray-50 p-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setTripType("domestic")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${tripType === "domestic"
                ? "bg-primary-100 border border-primary-300 text-primary-700"
                : "text-text-muted hover:text-text-secondary"
                }`}
            >
              <span>🇮🇳</span>
              Domestic
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setTripType("international")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${tripType === "international"
                ? "bg-primary-100 border border-primary-300 text-primary-700"
                : "text-text-muted hover:text-text-secondary"
                }`}
            >
              <span>🌍</span>
              International
            </motion.button>
          </div>
        </div>

        {/* Origin & Destination */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-text-muted">
              <MapPin className="h-3.5 w-3.5" />
              From
            </label>
            <AutocompleteInput
              value={origin}
              onChange={(v) => { setOrigin(v); setOriginAutoDetected(false); }}
              placeholder={geo.isDetecting ? "Detecting..." : "City of departure"}
              icon="origin"
              badge={
                originAutoDetected ? (
                  <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                    📍 Auto
                  </span>
                ) : undefined
              }
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-text-muted">
              <Plane className="h-3.5 w-3.5" />
              To
            </label>
            <AutocompleteInput
              value={destination}
              onChange={setDestination}
              placeholder="Your dream destination"
              icon="destination"
            />
          </div>
        </div>

        {/* Dates & Duration */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-text-muted">
              <Calendar className="h-3.5 w-3.5" />
              Start Date
            </label>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPriceCalendar(!showPriceCalendar)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-white px-5 py-4 text-left transition-colors hover:bg-gray-50 focus:border-primary-400 focus:bg-gray-50"
            >
              <span className="text-base font-medium text-text-primary">
                {isMounted ? new Date(startDate + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }) : startDate}
              </span>
              <span className="text-[10px] font-semibold text-primary-600">
                {showPriceCalendar ? "Close" : "See Prices ↓"}
              </span>
            </motion.button>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-text-muted">
              <Calendar className="h-3.5 w-3.5" />
              Duration
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setDuration(Math.max(1, duration - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-text-secondary transition-colors hover:bg-gray-200"
              >
                −
              </motion.button>
              <span className="flex-1 text-center text-base font-semibold text-text-primary">
                {duration} {duration === 1 ? "night" : "nights"}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setDuration(Math.min(30, duration + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-text-secondary transition-colors hover:bg-gray-200"
              >
                +
              </motion.button>
            </div>
          </div>
        </div>

        {/* Price Calendar (expandable) */}
        <AnimatePresence>
          {showPriceCalendar && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              {/* Visa Advisory */}
              {visaMessage && visaSeverity !== "none" && (
                <div className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-xs leading-relaxed ${visaSeverity === "warning"
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-primary-200 bg-primary-50 text-primary-700"
                  }`}>
                  <span className="mt-0.5 shrink-0 text-sm">{visaSeverity === "warning" ? "⚠️" : "ℹ️"}</span>
                  <span>{visaMessage}</span>
                </div>
              )}
              <PriceCalendar
                origin={origin}
                destination={destination}
                selectedDate={startDate}
                onDateSelect={(date) => {
                  setStartDate(date);
                  // Keep calendar open so user can compare
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- STEP 1 CTA --- */}
        {step === 1 && (
          <motion.button
            whileTap={{ scale: canSubmit ? 0.98 : 1 }}
            whileHover={{ scale: canSubmit ? 1.01 : 1 }}
            onClick={() => setStep(2)}
            disabled={!canSubmit}
            className={`btn-primary flex w-full min-h-14 items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all mt-4 ${!canSubmit ? "opacity-40 cursor-not-allowed" : ""
              }`}
          >
            Continue to Preferences
            <TrendingUp className="h-5 w-5" />
          </motion.button>
        )}

        {/* --- STEP 2: PREFERENCES --- */}
        <AnimatePresence mode="wait">
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 border-t border-border pt-8"
            >
              {/* Travelers — Adults, Children, Rooms */}
              <div className="mb-8">
                <label className="mb-3 flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-text-muted">
                  <span className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Travelers & Rooms
                  </span>
                  <button onClick={() => setStep(1)} className="text-primary-600 capitalize hover:text-primary-700">Edit Route</button>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Adults */}
                  <div className="rounded-2xl border border-border bg-gray-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
                      <User className="h-3 w-3" />
                      Adults
                    </div>
                    <div className="flex items-center justify-between">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-text-secondary transition-colors hover:bg-gray-200"
                      >
                        −
                      </motion.button>
                      <span className="text-lg font-bold text-text-primary">{adults}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAdults(Math.min(8, adults + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-text-secondary transition-colors hover:bg-gray-200"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="rounded-2xl border border-border bg-gray-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
                      <Baby className="h-3 w-3" />
                      Children
                    </div>
                    <div className="flex items-center justify-between">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-text-secondary transition-colors hover:bg-gray-200"
                      >
                        −
                      </motion.button>
                      <span className="text-lg font-bold text-text-primary">{children}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setChildren(Math.min(6, children + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-text-secondary transition-colors hover:bg-gray-200"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="rounded-2xl border border-border bg-gray-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
                      <BedDouble className="h-3 w-3" />
                      Rooms
                    </div>
                    <div className="flex items-center justify-between">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-text-secondary transition-colors hover:bg-gray-200"
                      >
                        −
                      </motion.button>
                      <span className="text-lg font-bold text-text-primary">{rooms}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRooms(Math.min(5, rooms + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-text-secondary transition-colors hover:bg-gray-200"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] text-text-muted">
                  {totalTravelers} traveler{totalTravelers > 1 ? "s" : ""} · {rooms}{" "}
                  room{rooms > 1 ? "s" : ""}
                </p>
              </div>

              {/* Budget Slider */}
              <div className="mb-8">
                <label className="mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-text-muted">
                  <span className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5" />
                    Budget
                  </span>
                  <span className="text-sm font-bold tracking-normal normal-case text-primary-600">
                    {formatCurrency(budget)}
                  </span>
                </label>
                <input
                  type="range"
                  min={30000}
                  max={1500000}
                  step={10000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="mt-2 w-full cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-[11px] text-text-muted">
                  <span>₹30K</span>
                  <span>₹15L</span>
                </div>

                {/* Budget range indicator for selected destination */}
                {budgetRange && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-gray-50 px-4 py-2.5 text-[11px] text-text-muted">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary-500" />
                    <span>
                      <strong className="text-text-secondary">{destination}</strong>{" "}
                      estimate: {formatCurrency(budgetRange.totalMinimum)} (budget) —{" "}
                      {formatCurrency(budgetRange.totalComfortable)} (comfort) —{" "}
                      {formatCurrency(budgetRange.totalPremium)} (luxury)
                    </span>
                  </div>
                )}

                {/* Budget warning */}
                <AnimatePresence>
                  {showBudgetWarning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <div className="flex-1">
                          <p className="text-xs leading-relaxed text-amber-700">
                            {budgetWarningMsg}
                          </p>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setBudget(suggestedBudget)}
                            className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-[11px] font-bold text-amber-700 transition-colors hover:bg-amber-200"
                          >
                            <TrendingUp className="h-3 w-3" />
                            Update to {formatCurrency(suggestedBudget)}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Food Preference */}
              <div className="mb-10">
                <label className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-text-muted">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  Food Preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {foodOptions.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFoodPreference(opt.value)}
                      className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${foodPreference === opt.value
                        ? "border-primary-400 bg-primary-50 text-primary-700"
                        : "border-border bg-gray-50 text-text-secondary hover:bg-gray-100"
                        }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Travel Style */}
              <div className="mb-6">
                <label className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-text-muted">
                  <Sparkles className="h-3.5 w-3.5" />
                  Travel Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "comfort" as TravelStyle, icon: "🛋️", label: "Comfort" },
                    { value: "backpacker" as TravelStyle, icon: "🎒", label: "Budget" },
                    { value: "luxury" as TravelStyle, icon: "✨", label: "Luxury" },
                    { value: "adventure" as TravelStyle, icon: "🏔️", label: "Adventure" },
                    { value: "cultural" as TravelStyle, icon: "🏛️", label: "Cultural" },
                    { value: "romantic" as TravelStyle, icon: "💕", label: "Romantic" },
                    { value: "family" as TravelStyle, icon: "👨‍👩‍👧‍👦", label: "Family" },
                  ].map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setTravelStyle(opt.value)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all ${travelStyle === opt.value
                        ? "border-primary-400 bg-primary-50 text-primary-700"
                        : "border-border bg-gray-50 text-text-secondary hover:bg-gray-100"
                        }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="mb-10">
                <label className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  Interests (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "street-food", icon: "🍜", label: "Street Food" },
                    { value: "museums", icon: "🖼️", label: "Museums" },
                    { value: "nightlife", icon: "🌃", label: "Nightlife" },
                    { value: "nature", icon: "🌿", label: "Nature" },
                    { value: "photography", icon: "📸", label: "Photography" },
                    { value: "shopping", icon: "🛍️", label: "Shopping" },
                    { value: "temples", icon: "🛕", label: "Temples" },
                    { value: "beaches", icon: "🏖️", label: "Beaches" },
                    { value: "hiking", icon: "🥾", label: "Hiking" },
                    { value: "wellness", icon: "🧘", label: "Wellness" },
                  ].map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setInterests((prev) =>
                          prev.includes(opt.value)
                            ? prev.filter((i) => i !== opt.value)
                            : [...prev, opt.value]
                        );
                      }}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${interests.includes(opt.value)
                        ? "border-primary-400 bg-primary-50 text-primary-700"
                        : "border-border bg-gray-50 text-text-secondary hover:bg-gray-100"
                        }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* FINAL CTA Button */}
              <motion.button
                whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                whileHover={{ scale: canSubmit ? 1.01 : 1 }}
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`btn-primary flex w-full min-h-14 items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all ${!canSubmit ? "opacity-40 cursor-not-allowed" : ""
                  }`}
              >
                <Sparkles className="h-5 w-5" />
                {showBudgetWarning
                  ? "Generate Anyway (Budget Advisory)"
                  : "Generate My Journey"}
              </motion.button>

              <p className="mt-3 text-center text-[11px] text-text-muted">
                7 AI agents will research {destination} across 12+ platforms to find
                you the best deals
              </p>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom trust indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted"
      >
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          7 AI agents working in parallel
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          12+ platforms compared
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          Visa docs auto-generated
        </span>
      </motion.div>
    </div>
  );
}
