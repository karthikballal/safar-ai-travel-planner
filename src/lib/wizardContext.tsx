"use client";

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import type { TravelInput } from "@/components/InputEngine";
import type { TripData, Flight, Hotel, DayPlan, Activity } from "@/data/mockTrip";

// ─── AI Route Plan (from LLM) ────────────────────────────────────────────
export interface AICity {
  city: string;
  country: string;
  days: number;
  highlights: string[];
  transportFromPrev?: {
    mode: "flight" | "train" | "bus" | "ferry" | "car";
    operator: string;
    duration: string;
    estimatedCost: number;
  };
}

export interface AIRoutePlan {
  cities: AICity[];
  totalDays: number;
  theme: string;
  summary: string;
  estimatedBudget: {
    flights: number;
    hotels: number;
    activities: number;
    transport: number;
    total: number;
  };
}

// ─── Real API results ─────────────────────────────────────────────────────
export interface FlightSearchResult {
  outbound: Flight[];
  inbound: Flight[];
  source: "flightdataapi" | "kiwi" | "skyscanner" | "serpapi" | "partner-redirect";
  searchedAt: string;
}

export interface HotelSearchResult {
  /** Per-city hotel options */
  cities: {
    city: string;
    hotels: Hotel[];
    source: "booking-affiliate" | "google-places";
  }[];
  searchedAt: string;
}

export interface ActivityOption {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  image?: string;
  category: "tour" | "attraction" | "experience" | "food" | "transport";
  bookingUrl?: string;
  priceVerified?: boolean;
  source: "google-places" | "viator" | "getyourguide" | "klook" | "estimated";
}


export interface ActivitySearchResult {
  cities: {
    city: string;
    activities: ActivityOption[];
  }[];
  searchedAt: string;
}

// ─── Wizard Steps ─────────────────────────────────────────────────────────
export type WizardStep =
  | "auth"
  | "input"
  | "processing"
  | "route-selection"
  | "flight-selection"
  | "hotel-selection"
  | "activities-selection"
  | "summary"
  | "dashboard";

// ─── Wizard State ─────────────────────────────────────────────────────────
export interface WizardState {
  step: WizardStep;
  userInput: TravelInput | null;

  // AI-generated route plan
  aiRoutePlan: AIRoutePlan | null;
  routeOptions: AIRoutePlan[];   // Multiple route options from AI

  // Real API search results
  flightResults: FlightSearchResult | null;
  hotelResults: HotelSearchResult | null;
  activityResults: ActivitySearchResult | null;

  // User selections
  selectedOutbound: Flight | null;
  selectedInbound: Flight | null;
  selectedHotels: Hotel[];             // One per city
  selectedActivities: ActivityOption[]; // All selected activities across cities

  // Generated trip data (for dashboard / PDF)
  tripData: TripData | null;

  // Loading states
  isLoadingFlights: boolean;
  isLoadingHotels: boolean;
  isLoadingActivities: boolean;
  isLoadingAI: boolean;

  // Error states
  error: string | null;

  // For auth redirect
  returnToStep: WizardStep | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────
type WizardAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_INPUT"; input: TravelInput }
  | { type: "SET_AI_ROUTE"; plan: AIRoutePlan }
  | { type: "SET_ROUTE_OPTIONS"; options: AIRoutePlan[] }
  | { type: "SET_FLIGHT_RESULTS"; results: FlightSearchResult }
  | { type: "SET_HOTEL_RESULTS"; results: HotelSearchResult }
  | { type: "SET_ACTIVITY_RESULTS"; results: ActivitySearchResult }
  | { type: "SELECT_OUTBOUND"; flight: Flight }
  | { type: "SELECT_INBOUND"; flight: Flight }
  | { type: "SELECT_HOTELS"; hotels: Hotel[] }
  | { type: "TOGGLE_ACTIVITY"; activity: ActivityOption }
  | { type: "SET_TRIP_DATA"; data: TripData }
  | { type: "SET_LOADING"; key: "flights" | "hotels" | "activities" | "ai"; value: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_RETURN_STEP"; step: WizardStep | null }
  | { type: "RESET" };

const initialState: WizardState = {
  step: "auth",
  userInput: null,
  aiRoutePlan: null,
  routeOptions: [],
  flightResults: null,
  hotelResults: null,
  activityResults: null,
  selectedOutbound: null,
  selectedInbound: null,
  selectedHotels: [],
  selectedActivities: [],
  tripData: null,
  isLoadingFlights: false,
  isLoadingHotels: false,
  isLoadingActivities: false,
  isLoadingAI: false,
  error: null,
  returnToStep: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step, error: null };
    case "SET_INPUT":
      return { ...state, userInput: action.input };
    case "SET_AI_ROUTE":
      return { ...state, aiRoutePlan: action.plan };
    case "SET_ROUTE_OPTIONS":
      return { ...state, routeOptions: action.options };
    case "SET_FLIGHT_RESULTS":
      return { ...state, flightResults: action.results, isLoadingFlights: false };
    case "SET_HOTEL_RESULTS":
      return { ...state, hotelResults: action.results, isLoadingHotels: false };
    case "SET_ACTIVITY_RESULTS":
      return { ...state, activityResults: action.results, isLoadingActivities: false };
    case "SELECT_OUTBOUND":
      return { ...state, selectedOutbound: action.flight };
    case "SELECT_INBOUND":
      return { ...state, selectedInbound: action.flight };
    case "SELECT_HOTELS":
      return { ...state, selectedHotels: action.hotels };
    case "TOGGLE_ACTIVITY": {
      const exists = state.selectedActivities.find((a) => a.id === action.activity.id);
      return {
        ...state,
        selectedActivities: exists
          ? state.selectedActivities.filter((a) => a.id !== action.activity.id)
          : [...state.selectedActivities, action.activity],
      };
    }
    case "SET_TRIP_DATA":
      return { ...state, tripData: action.data };
    case "SET_LOADING":
      switch (action.key) {
        case "flights":   return { ...state, isLoadingFlights: action.value };
        case "hotels":    return { ...state, isLoadingHotels: action.value };
        case "activities": return { ...state, isLoadingActivities: action.value };
        case "ai":        return { ...state, isLoadingAI: action.value };
      }
      return state;
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_RETURN_STEP":
      return { ...state, returnToStep: action.step };
    case "RESET":
      return { ...initialState, step: "input" };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────
interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;

  // Convenience actions
  setStep: (step: WizardStep) => void;
  setInput: (input: TravelInput) => void;
  selectOutbound: (flight: Flight) => void;
  selectInbound: (flight: Flight) => void;
  selectHotels: (hotels: Hotel[]) => void;
  toggleActivity: (activity: ActivityOption) => void;
  reset: () => void;

  // Computed totals
  flightTotal: number;
  hotelTotal: number;
  activityTotal: number;
  grandTotal: number;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const setStep = useCallback((step: WizardStep) => dispatch({ type: "SET_STEP", step }), []);
  const setInput = useCallback((input: TravelInput) => dispatch({ type: "SET_INPUT", input }), []);
  const selectOutbound = useCallback((flight: Flight) => dispatch({ type: "SELECT_OUTBOUND", flight }), []);
  const selectInbound = useCallback((flight: Flight) => dispatch({ type: "SELECT_INBOUND", flight }), []);
  const selectHotels = useCallback((hotels: Hotel[]) => dispatch({ type: "SELECT_HOTELS", hotels }), []);
  const toggleActivity = useCallback((activity: ActivityOption) => dispatch({ type: "TOGGLE_ACTIVITY", activity }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  // Computed totals
  const flightTotal =
    (state.selectedOutbound?.price ?? 0) + (state.selectedInbound?.price ?? 0);

  const hotelTotal = state.selectedHotels.reduce(
    (sum, h) => sum + (h?.totalPrice ?? 0),
    0
  );

  const activityTotal = state.selectedActivities.reduce(
    (sum, a) => sum + (a?.price ?? 0),
    0
  );

  const grandTotal = flightTotal + hotelTotal + activityTotal;

  return (
    <WizardContext.Provider
      value={{
        state,
        dispatch,
        setStep,
        setInput,
        selectOutbound,
        selectInbound,
        selectHotels,
        toggleActivity,
        reset,
        flightTotal,
        hotelTotal,
        activityTotal,
        grandTotal,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <WizardProvider>");
  return ctx;
}
