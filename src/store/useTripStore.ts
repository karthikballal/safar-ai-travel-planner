import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TravelInput } from "@/components/InputEngine";
import type { RouteOption } from "@/lib/routePlanner";
import type { TripData, Flight, Hotel as HotelType } from "@/data/mockTrip";
import type { AIRoutePlan } from "@/lib/wizardContext";
import type { ActivityOption } from "@/components/ActivitiesSelectionPage";
import type { AllAgentResults } from "@/lib/agentRunner";

export type AppState =
  | "auth"
  | "input"
  | "processing"
  | "arrival-city-picker"
  | "country-city-picker"
  | "region-country-picker"
  | "route-selection"
  | "flight-selection"
  | "hotel-selection"
  | "activities-selection"
  | "summary"
  | "dashboard";

// States that are transient and should NOT be restored on refresh
// (user would see a blank loader — instead fall back to the last meaningful step)
const TRANSIENT_STATES: AppState[] = ["processing"];

interface TripStore {
  // Navigation State
  appState: AppState;
  setAppState: (state: AppState) => void;
  returnToState: AppState | null;
  setReturnToState: (state: AppState | null) => void;

  // Flow State
  userInput: TravelInput | null;
  setUserInput: (input: TravelInput | null) => void;

  tripData: TripData | null;
  setTripData: (data: TripData | null) => void;

  routeOptions: RouteOption[];
  setRouteOptions: (options: RouteOption[]) => void;

  aiRoutePlan: AIRoutePlan | null;
  setAiRoutePlan: (plan: AIRoutePlan | null) => void;

  preferredArrivalCity: string | null;
  setPreferredArrivalCity: (city: string | null) => void;

  selectedRegionCountries: string[];
  setSelectedRegionCountries: (countries: string[]) => void;

  // Real-time API Data
  flightOutbound: Flight[];
  setFlightOutbound: (flights: Flight[]) => void;
  flightInbound: Flight[];
  setFlightInbound: (flights: Flight[]) => void;
  flightSource: string;
  setFlightSource: (source: string) => void;
  flightLoading: boolean;
  setFlightLoading: (loading: boolean) => void;

  hotelOptionsByCity: HotelType[][];
  setHotelOptionsByCity: (options: HotelType[][]) => void;
  hotelCityLabels: string[];
  setHotelCityLabels: (labels: string[]) => void;
  hotelNightsPerCity: number[];
  setHotelNightsPerCity: (nights: number[]) => void;
  hotelSource: string;
  setHotelSource: (source: string) => void;
  hotelLoading: boolean;
  setHotelLoading: (loading: boolean) => void;

  activityOptions: { city: string; activities: ActivityOption[] }[];
  setActivityOptions: (options: { city: string; activities: ActivityOption[] }[]) => void;
  activitySource: string;
  setActivitySource: (source: string) => void;
  activityLoading: boolean;
  setActivityLoading: (loading: boolean) => void;

  // Selections
  selectedOutbound: Flight | null;
  setSelectedOutbound: (flight: Flight | null) => void;
  selectedInbound: Flight | null;
  setSelectedInbound: (flight: Flight | null) => void;

  selectedHotels: HotelType[];
  setSelectedHotels: (hotels: HotelType[]) => void;

  selectedActivities: ActivityOption[];
  setSelectedActivities: (activities: ActivityOption[]) => void;

  // AI Agent Intelligence (real Gemini outputs)
  agentIntelligence: AllAgentResults | null;
  setAgentIntelligence: (intel: AllAgentResults | null) => void;

  // Hydration flag (for SSR-safe rendering)
  _hasHydrated: boolean;

  // Actions
  resetState: () => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      // Navigation State
      appState: "input",
      setAppState: (state) => set({ appState: state }),
      returnToState: null,
      setReturnToState: (state) => set({ returnToState: state }),

      // Flow State
      userInput: null,
      setUserInput: (input) => set({ userInput: input }),

      tripData: null,
      setTripData: (data) => set({ tripData: data }),

      routeOptions: [],
      setRouteOptions: (options) => set({ routeOptions: options }),

      aiRoutePlan: null,
      setAiRoutePlan: (plan) => set({ aiRoutePlan: plan }),

      preferredArrivalCity: null,
      setPreferredArrivalCity: (city) => set({ preferredArrivalCity: city }),

      selectedRegionCountries: [],
      setSelectedRegionCountries: (countries) => set({ selectedRegionCountries: countries }),

      // Real-time API Data
      flightOutbound: [],
      setFlightOutbound: (flights) => set({ flightOutbound: flights }),
      flightInbound: [],
      setFlightInbound: (flights) => set({ flightInbound: flights }),
      flightSource: "",
      setFlightSource: (source) => set({ flightSource: source }),
      flightLoading: false,
      setFlightLoading: (loading) => set({ flightLoading: loading }),

      hotelOptionsByCity: [],
      setHotelOptionsByCity: (options) => set({ hotelOptionsByCity: options }),
      hotelCityLabels: [],
      setHotelCityLabels: (labels) => set({ hotelCityLabels: labels }),
      hotelNightsPerCity: [],
      setHotelNightsPerCity: (nights) => set({ hotelNightsPerCity: nights }),
      hotelSource: "",
      setHotelSource: (source) => set({ hotelSource: source }),
      hotelLoading: false,
      setHotelLoading: (loading) => set({ hotelLoading: loading }),

      activityOptions: [],
      setActivityOptions: (options) => set({ activityOptions: options }),
      activitySource: "",
      setActivitySource: (source) => set({ activitySource: source }),
      activityLoading: false,
      setActivityLoading: (loading) => set({ activityLoading: loading }),

      // Selections
      selectedOutbound: null,
      setSelectedOutbound: (flight) => set({ selectedOutbound: flight }),
      selectedInbound: null,
      setSelectedInbound: (flight) => set({ selectedInbound: flight }),

      selectedHotels: [],
      setSelectedHotels: (hotels) => set({ selectedHotels: hotels }),

      selectedActivities: [],
      setSelectedActivities: (activities) => set({ selectedActivities: activities }),

      // AI Agent Intelligence
      agentIntelligence: null,
      setAgentIntelligence: (intel) => set({ agentIntelligence: intel }),

      // Hydration flag
      _hasHydrated: false,

      // Actions
      resetState: () => set({
        appState: "input",
        userInput: null,
        tripData: null,
        routeOptions: [],
        aiRoutePlan: null,
        selectedRegionCountries: [],
        preferredArrivalCity: null,
        flightOutbound: [],
        flightInbound: [],
        flightSource: "",
        flightLoading: false,
        hotelOptionsByCity: [],
        hotelCityLabels: [],
        hotelNightsPerCity: [],
        hotelSource: "",
        hotelLoading: false,
        activityOptions: [],
        activitySource: "",
        activityLoading: false,
        selectedOutbound: null,
        selectedInbound: null,
        selectedHotels: [],
        selectedActivities: [],
        agentIntelligence: null,
      }),
    }),
    {
      name: "safar-trip-session",
      storage: createJSONStorage(() => {
        // SSR-safe: return a no-op storage during server rendering
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          };
        }
        return sessionStorage;
      }),
      // Only persist meaningful state — skip loading booleans and transient flags
      partialize: (state) => ({
        appState: state.appState,
        userInput: state.userInput,
        tripData: state.tripData,
        routeOptions: state.routeOptions,
        aiRoutePlan: state.aiRoutePlan,
        preferredArrivalCity: state.preferredArrivalCity,
        selectedRegionCountries: state.selectedRegionCountries,
        flightOutbound: state.flightOutbound,
        flightInbound: state.flightInbound,
        flightSource: state.flightSource,
        hotelOptionsByCity: state.hotelOptionsByCity,
        hotelCityLabels: state.hotelCityLabels,
        hotelNightsPerCity: state.hotelNightsPerCity,
        hotelSource: state.hotelSource,
        activityOptions: state.activityOptions,
        activitySource: state.activitySource,
        selectedOutbound: state.selectedOutbound,
        selectedInbound: state.selectedInbound,
        selectedHotels: state.selectedHotels,
        selectedActivities: state.selectedActivities,
      }),
      // After rehydration from sessionStorage, fix up transient states
      onRehydrateStorage: () => (state) => {
        if (state) {
          // If user was in a transient state (like "processing"), fall back to "input"
          if (TRANSIENT_STATES.includes(state.appState)) {
            state.appState = "input";
          }
          // Always reset loading flags to false on rehydration
          state.flightLoading = false;
          state.hotelLoading = false;
          state.activityLoading = false;
          state._hasHydrated = true;
        }
      },
    }
  )
);
