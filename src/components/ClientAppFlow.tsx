"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Plane,
  MapPin,
  Calendar,
  Users,
  BedDouble,
  Baby,
  User,
  TrainFront,
  ArrowRight,
  LogOut,
  Home,
  Share2,
} from "lucide-react";
import InputEngine from "@/components/InputEngine";
import type { TravelInput } from "@/components/InputEngine";
import ProcessingState from "@/components/ProcessingState";
import FlightCard from "@/components/FlightCard";
import AccommodationCard from "@/components/AccommodationCard";
import DayTimeline from "@/components/DayTimeline";
import VisaDocHub from "@/components/VisaDocHub";
import StickyCart from "@/components/StickyCart";
import TransportCard from "@/components/TransportCard";
import RouteSelector from "@/components/RouteSelector";
import AuthScreen from "@/components/AuthScreen";
import SafarLogo from "@/components/SafarLogo";
import Footer from "@/components/Footer";
import TravelTipsPanel from "@/components/TravelTipsPanel";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import FlightSelectionPage from "@/components/FlightSelectionPage";
import HotelSelectionPage from "@/components/HotelSelectionPage";
import ActivitiesSelectionPage from "@/components/ActivitiesSelectionPage";
import type { ActivityOption } from "@/components/ActivitiesSelectionPage";
import SummaryCheckoutPage from "@/components/SummaryCheckoutPage";
import ArrivalCityPicker from "@/components/ArrivalCityPicker";
import CountryCityPicker from "@/components/CountryCityPicker";
import RegionCountryPicker from "@/components/RegionCountryPicker";
import ShareTripCard from "@/components/ShareTripCard";
import TripCostSummary from "@/components/TripCostSummary";
import { useAuth, getInitials } from "@/lib/auth";
import { trackClientEvent } from "@/lib/analytics";
import { buildBookingSearchUrl, buildMapsUrl } from "@/lib/affiliate";
import { isCountryDestination, getArrivalCities, isRegionDestination, getRegionCountries } from "@/lib/countryData";
import { getFlightSourceLabel, getFlightTotalLabel, sumVerifiedFlightPrices } from "@/lib/travelDisplay";
import { generateTripData, generateTripFromRouteOption, enhanceItineraryWithRestaurants } from "@/lib/tripGenerator";
import { generateRouteOptions, isRegion } from "@/lib/routePlanner";
import type { RouteOption } from "@/lib/routePlanner";
import type { TripData, Flight, Hotel as HotelType } from "@/data/mockTrip";
import type { AIRoutePlan } from "@/lib/wizardContext";
import { useTripStore } from "@/store/useTripStore";
import type { AppState } from "@/store/useTripStore";

export default function ClientAppFlow() {
  const { user, isLoading, signOut } = useAuth();
  const {
    appState, setAppState,
    userInput, setUserInput,
    tripData, setTripData,
    routeOptions, setRouteOptions,
    aiRoutePlan, setAiRoutePlan,
    preferredArrivalCity, setPreferredArrivalCity,
    selectedRegionCountries, setSelectedRegionCountries,
    flightOutbound, setFlightOutbound,
    flightInbound, setFlightInbound,
    flightSource, setFlightSource,
    flightLoading, setFlightLoading,
    hotelOptionsByCity, setHotelOptionsByCity,
    hotelCityLabels, setHotelCityLabels,
    hotelNightsPerCity, setHotelNightsPerCity,
    hotelSource, setHotelSource,
    hotelLoading, setHotelLoading,
    activityOptions, setActivityOptions,
    activitySource, setActivitySource,
    activityLoading, setActivityLoading,
    selectedOutbound, setSelectedOutbound,
    selectedInbound, setSelectedInbound,
    selectedHotels, setSelectedHotels,
    selectedActivities, setSelectedActivities,
    returnToState, setReturnToState,
    resetState,
    _hasHydrated,
  } = useTripStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const selectedFlightTotal = sumVerifiedFlightPrices([selectedOutbound, selectedInbound]);
  const selectedFlightTotalLabel = getFlightTotalLabel([selectedOutbound, selectedInbound], "Live fare on partner");


  // Auto-navigate to input if user is already signed in (session persistence)
  useEffect(() => {
    if (!isLoading && user && appState === "auth") {
      setAppState("input");
    }
  }, [isLoading, user, appState]);

  const handleFlightSelect = useCallback(
    (direction: "outbound" | "inbound", flight: Flight) => {
      if (direction === "outbound") setSelectedOutbound(flight);
      else setSelectedInbound(flight);
    },
    []
  );

  const handleHotelSelect = useCallback(
    (cityIndex: number, hotel: HotelType) => {
      const next = [...selectedHotels];
      next[cityIndex] = hotel;
      setSelectedHotels(next);
    },
    [selectedHotels, setSelectedHotels]
  );

  const handleInputSubmit = (input: TravelInput) => {
    trackClientEvent("planner_started", {
      destination: input.destination,
      tripType: input.tripType,
      duration: input.duration,
      travelers: input.adults + input.children,
    });
    setUserInput(input);
    setPreferredArrivalCity(null);
    setSelectedRegionCountries([]);

    // If destination is a region (Europe, Southeast Asia), show country picker
    if (input.tripType === "international" && isRegionDestination(input.destination)) {
      setAppState("region-country-picker");
      return;
    }

    // If destination is a country with multiple cities, show intelligent city picker
    if (input.tripType === "international" && isCountryDestination(input.destination)) {
      const cities = getArrivalCities(input.destination);
      if (cities.length > 1) {
        setAppState("country-city-picker");
        return;
      }
    }

    setAppState("processing");
  };

  // Handler for arrival city selection (legacy — kept for backward compat)
  const handleArrivalCitySelect = useCallback((city: string) => {
    setPreferredArrivalCity(city);
    setAppState("processing");
  }, []);

  // Handler for intelligent country city selection
  const handleCountryCitiesConfirm = useCallback((selectedCities: string[], arrivalCity: string) => {
    setPreferredArrivalCity(arrivalCity);
    // Store the selected cities in the user input so the AI planner can use them
    if (userInput) {
      const updatedInput = {
        ...userInput,
        selectedCities: selectedCities,
      };
      setUserInput(updatedInput);
    }
    setAppState("processing");
  }, [userInput]);

  // Handler for region country selection (e.g., Europe → France, Italy, Spain)
  const handleRegionCountriesConfirm = useCallback((countries: string[]) => {
    setSelectedRegionCountries(countries);
    // Update userInput destination to be specific countries instead of "Europe"
    if (userInput) {
      const updatedInput = {
        ...userInput,
        destination: countries.join(", "),
      };
      setUserInput(updatedInput);
    }
    setAppState("processing");
  }, [userInput]);

  // ─── AI Real Itinerary Generator helper ─────────────────────────────────
  const fetchRealItinerary = async (currentTripData: TripData, input: TravelInput, routePlan: AIRoutePlan) => {
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: input.destination,
          duration: input.duration,
          budget: input.budget,
          travelers: input.adults + input.children,
          foodPreference: input.foodPreference,
          travelStyle: input.travelStyle || "comfort",
          interests: input.interests,
          startDate: input.startDate,
          tripType: input.tripType,
          cities: routePlan.cities.map(c => ({ city: c.city, days: c.days })),
        }),
      });
      if (res.ok) {
        const { itinerary } = await res.json();
        // Immediately update the store. Since Zustand setters are stable, this works
        // Update both tripData and its nested itinerary
        useTripStore.getState().setTripData({
          ...currentTripData,
          itinerary
        });
        console.log("[ClientAppFlow] Real LLM itinerary loaded in background");
      }
    } catch (err) {
      console.error("[ClientAppFlow] Background true LLM generation failed:", err);
    }
  };

  // ─── AI-Powered Processing ──────────────────────────────────────────────
  const handleProcessingComplete = useCallback(async () => {
    if (!userInput) return;

    const isDomestic = userInput.tripType === "domestic";

    try {
      // Step 1: Call AI planner API for intelligent routing
      const aiResponse = await fetch("/api/ai-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: userInput.origin,
          destination: userInput.destination,
          duration: userInput.duration,
          budget: userInput.budget,
          adults: userInput.adults,
          children: userInput.children,
          foodPreference: userInput.foodPreference,
          preferredArrivalCity: preferredArrivalCity || undefined,
          tripType: userInput.tripType,
          selectedCities: userInput.selectedCities || undefined,
        }),
      });
      const aiData = await aiResponse.json();
      const plan: AIRoutePlan = aiData.plan;
      setAiRoutePlan(plan);

      // Step 2: Compute dates
      const departDate = userInput.startDate;
      const returnDate = new Date(
        new Date(departDate).getTime() + userInput.duration * 86400000
      )
        .toISOString()
        .split("T")[0];

      // Step 3: For domestic trips, skip flights → go directly to hotels
      if (isDomestic) {
        setHotelLoading(true);
        setAppState("hotel-selection");

        // Fetch hotels
        const cities = plan.cities.map((c) => {
          const startDateObj = new Date(userInput.startDate);
          let dayOffset = 0;
          for (const prev of plan.cities) {
            if (prev.city === c.city) break;
            dayOffset += prev.days;
          }
          const checkIn = new Date(startDateObj.getTime() + dayOffset * 86400000).toISOString().split("T")[0];
          const checkOut = new Date(startDateObj.getTime() + (dayOffset + c.days) * 86400000).toISOString().split("T")[0];
          return { city: c.city, checkIn, checkOut };
        });

        const hotelResponse = await fetch("/api/hotels/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cities,
            adults: userInput.adults,
            rooms: userInput.rooms,
          }),
        });
        const hotelData = await hotelResponse.json();
        setHotelOptionsByCity(hotelData.cities?.map((c: { hotels: HotelType[] }) => c.hotels) || []);
        setHotelCityLabels(hotelData.cities?.map((c: { city: string }) => c.city) || []);
        setHotelNightsPerCity(cities.map((c) => {
          const d1 = new Date(c.checkIn).getTime();
          const d2 = new Date(c.checkOut).getTime();
          return Math.round((d2 - d1) / 86400000);
        }));
        setHotelSource(hotelData.source || "estimated");
        setHotelLoading(false);
      } else {
        // International: Fetch flights first
        setFlightLoading(true);
        setAppState("flight-selection");

        const arrivalCity = preferredArrivalCity || plan.cities[0]?.city || userInput.destination;
        const flightResponse = await fetch("/api/flights/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: userInput.origin,
            destination: arrivalCity,
            departDate,
            returnDate,
            adults: userInput.adults,
          }),
        });
        const flightData = await flightResponse.json();
        setFlightOutbound(flightData.outbound || []);
        setFlightInbound(flightData.inbound || []);
        setFlightSource(flightData.source || "estimated");
        setFlightLoading(false);
      }

      // Also generate legacy tripData for dashboard compatibility
      if (isRegion(userInput.destination)) {
        const options = generateRouteOptions({
          origin: userInput.origin,
          destination: userInput.destination,
          duration: userInput.duration,
          budget: userInput.budget,
          adults: userInput.adults,
          children: userInput.children,
        });
        if (options.length > 0) {
          const data = generateTripFromRouteOption(
            {
              origin: userInput.origin,
              destination: userInput.destination,
              startDate: userInput.startDate,
              duration: userInput.duration,
              adults: userInput.adults,
              children: userInput.children,
              rooms: userInput.rooms,
              budget: userInput.budget,
            },
            options[0]
          );
          const enhanced = enhanceItineraryWithRestaurants(data, userInput.foodPreference);
          setTripData(enhanced);
          fetchRealItinerary(enhanced, userInput, plan);
        }
      } else {
        const data = generateTripData({
          origin: userInput.origin,
          destination: userInput.destination,
          startDate: userInput.startDate,
          duration: userInput.duration,
          adults: userInput.adults,
          children: userInput.children,
          rooms: userInput.rooms,
          budget: userInput.budget,
        });
        const enhanced = enhanceItineraryWithRestaurants(data, userInput.foodPreference);
        setTripData(enhanced);
        fetchRealItinerary(enhanced, userInput, plan);
      }
    } catch (error) {
      console.error("[Processing] Error:", error);
      // Fallback to legacy flow
      if (userInput) {
        const data = generateTripData({
          origin: userInput.origin,
          destination: userInput.destination,
          startDate: userInput.startDate,
          duration: userInput.duration,
          adults: userInput.adults,
          children: userInput.children,
          rooms: userInput.rooms,
          budget: userInput.budget,
        });
        setTripData(enhanceItineraryWithRestaurants(data, userInput.foodPreference));
        setFlightOutbound(data.flightOptions?.outbound || [data.flights.outbound]);
        setFlightInbound(data.flightOptions?.inbound || [data.flights.inbound]);
        setFlightSource("estimated");
        setFlightLoading(false);
        setAppState("flight-selection");
      }
    }
  }, [userInput, preferredArrivalCity]);

  const handleRouteSelect = useCallback(
    (option: RouteOption) => {
      if (!userInput) return;
      const data = generateTripFromRouteOption(
        {
          origin: userInput.origin,
          destination: userInput.destination,
          startDate: userInput.startDate,
          duration: userInput.duration,
          adults: userInput.adults,
          children: userInput.children,
          rooms: userInput.rooms,
          budget: userInput.budget,
        },
        option
      );
      const enhanced = enhanceItineraryWithRestaurants(data, userInput.foodPreference);
      setTripData(enhanced);
      // If we selected a different route, trigger a new LLM generation specifically for this route
      if (useTripStore.getState().aiRoutePlan) {
        fetchRealItinerary(enhanced, userInput, useTripStore.getState().aiRoutePlan!);
      }
      setAppState("flight-selection");
    },
    [userInput]
  );

  // ─── Multi-step wizard handlers ─────────────────────────────────────────

  const handleFlightConfirm = useCallback(
    async (outbound: Flight, inbound: Flight) => {
      setSelectedOutbound(outbound);
      setSelectedInbound(inbound);
      setHotelLoading(true);
      setAppState("hotel-selection");

      // Fetch real hotels from API
      try {
        const cities = aiRoutePlan
          ? aiRoutePlan.cities.map((c) => {
            const startDate = new Date(userInput!.startDate);
            let dayOffset = 0;
            for (const prev of aiRoutePlan!.cities) {
              if (prev.city === c.city) break;
              dayOffset += prev.days;
            }
            const checkIn = new Date(startDate.getTime() + dayOffset * 86400000).toISOString().split("T")[0];
            const checkOut = new Date(startDate.getTime() + (dayOffset + c.days) * 86400000).toISOString().split("T")[0];
            return { city: c.city, checkIn, checkOut };
          })
          : [
            {
              city: userInput!.destination,
              checkIn: userInput!.startDate,
              checkOut: new Date(
                new Date(userInput!.startDate).getTime() + userInput!.duration * 86400000
              ).toISOString().split("T")[0],
            },
          ];

        setHotelCityLabels(cities.map((c) => c.city));
        setHotelNightsPerCity(
          aiRoutePlan
            ? aiRoutePlan.cities.map((c) => c.days)
            : [userInput!.duration]
        );

        const hotelRes = await fetch("/api/hotels/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cities,
            rooms: userInput!.rooms,
            adults: userInput!.adults,
          }),
        });
        const hotelData = await hotelRes.json();
        const hotelsByCityFromAPI = (hotelData.cities || []).map(
          (c: { hotels: HotelType[] }) => c.hotels
        );
        setHotelOptionsByCity(hotelsByCityFromAPI);
        setHotelSource(hotelData.cities?.[0]?.source || "booking-affiliate");
        setHotelLoading(false);
      } catch (error) {
        console.error("[Hotels] API error:", error);
        const fallbackCities = aiRoutePlan
          ? aiRoutePlan.cities.map((c) => ({ city: c.city, days: c.days }))
          : [{ city: userInput!.destination, days: userInput!.duration }];
        setHotelOptionsByCity(
          fallbackCities.map((city) => [
            {
              id: `booking_${city.city.toLowerCase().replace(/\s+/g, "_")}`,
              name: `Hotels in ${city.city}`,
              image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
              stars: 0,
              rating: 0,
              reviews: 0,
              address: city.city,
              amenities: [],
              checkIn: userInput!.startDate,
              checkOut: userInput!.startDate,
              nights: city.days,
              pricePerNight: 0,
              totalPrice: 0,
              priceVerified: false,
              priceLabel: "Check live rates on Booking.com",
              bookingUrl: buildBookingSearchUrl({ city: city.city }),
            },
          ])
        );
        setHotelCityLabels(fallbackCities.map((city) => city.city));
        setHotelNightsPerCity(fallbackCities.map((city) => city.days));
        setHotelSource("booking-affiliate");
        setHotelLoading(false);
      }
    },
    [aiRoutePlan, userInput]
  );

  const handleHotelConfirm = useCallback(
    async (hotels: HotelType[]) => {
      setSelectedHotels(hotels);
      setActivityLoading(true);
      setAppState("activities-selection");

      // Fetch real activities from API
      try {
        const cities = aiRoutePlan
          ? aiRoutePlan.cities.map((c) => ({ city: c.city, days: c.days }))
          : [{ city: userInput!.destination, days: userInput!.duration }];

        const actRes = await fetch("/api/activities/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cities }),
        });
        const actData = await actRes.json();
        setActivityOptions(actData.cities || []);
        setActivitySource(actData.cities?.[0]?.activities?.[0]?.source || "google-places");
        setActivityLoading(false);
      } catch (error) {
        console.error("[Activities] API error:", error);
        const fallbackCities = aiRoutePlan
          ? aiRoutePlan.cities.map((c) => c.city)
          : [userInput!.destination];
        setActivityOptions(
          fallbackCities.map((city) => ({
            city,
            activities: [
              {
                id: `maps_${city}_1`,
                title: `${city} highlights on Google Maps`,
                description: `Browse top-rated attractions, opening hours, and live visitor reviews in ${city} on Google Maps.`,
                duration: "Flexible",
                price: 0,
                currency: "INR",
                rating: 0,
                reviews: 0,
                category: "attraction" as const,
                bookingUrl: buildMapsUrl(`top attractions in ${city}`),
                googleMapsUrl: buildMapsUrl(`top attractions in ${city}`),
                priceVerified: false,
                source: "google-places" as const,
              },
            ],
          }))
        );
        setActivitySource("google-places");
        setActivityLoading(false);
      }
    },
    [aiRoutePlan, userInput]
  );

  const handleActivitiesConfirm = useCallback(
    (activities: ActivityOption[]) => {
      setSelectedActivities(activities);
      setAppState("summary");
    },
    []
  );

  const handleSummaryConfirm = useCallback(() => {
    trackClientEvent("planner_completed", {
      destination: userInput?.destination,
      tripType: userInput?.tripType,
      selectedHotels: selectedHotels.length,
      selectedActivities: selectedActivities.length,
    });
    setAppState("dashboard");
  }, [selectedActivities.length, selectedHotels.length, userInput?.destination, userInput?.tripType]);

  const handleStartOver = () => {
    resetState();
  };

  const handleAuthSuccess = () => {
    if (returnToState && tripData) {
      setAppState(returnToState);
      setReturnToState(null);
    } else {
      setAppState("input");
    }
  };

  const handleAuthSkip = () => {
    if (returnToState && tripData) {
      setAppState(returnToState);
      setReturnToState(null);
    } else {
      setAppState("input");
    }
  };

  const handleLogout = useCallback(() => {
    signOut();
    handleStartOver();
    setAppState("auth");
    setShowUserMenu(false);
    window.history.replaceState({ page: "auth" }, "");
  }, [signOut]);

  // Prevent browser back button from bypassing auth
  useEffect(() => {
    const handlePopState = () => {
      if (!user) {
        setAppState("auth");
        window.history.replaceState({ page: "auth" }, "");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user]);

  // Push history entry on state changes so back doesn't leave the app
  useEffect(() => {
    if (appState !== "auth") {
      window.history.pushState({ page: appState }, "");
    }
  }, [appState]);

  // Dashboard data: use tripData if available
  const data = tripData || (userInput ? generateTripData({
    origin: userInput.origin,
    destination: userInput.destination,
    startDate: userInput.startDate,
    duration: userInput.duration,
    adults: userInput.adults,
    children: userInput.children,
    rooms: userInput.rooms,
    budget: userInput.budget,
  }) : null);

  const totalTravelers = userInput
    ? userInput.adults + userInput.children
    : 2;

  // Wait for sessionStorage rehydration before rendering — prevents wrong-state flash
  if (!_hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-text-muted">Restoring your session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative">
      {/* Ambient gradient background */}
      <div className="ambient-bg">
        <div className="ambient-orb-teal" />
      </div>

      <AnimatePresence mode="wait">
        {/* STATE 0: Auth */}
        {appState === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            {isLoading ? (
              <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <SafarLogo size={48} variant="full" />
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-primary-500" />
                  </div>
                </div>
              </div>
            ) : (
              <AuthScreen onAuthSuccess={handleAuthSuccess} onSkip={handleAuthSkip} />
            )}
          </motion.div>
        )}

        {/* STATE 1: Input Engine */}
        {appState === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <InputEngine onSubmit={handleInputSubmit} onSignOut={handleLogout} />
            <Footer />
          </motion.div>
        )}

        {/* STATE 2: Processing */}
        {appState === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProcessingState
              destination={userInput?.destination || "Paris"}
              onComplete={handleProcessingComplete}
              userInput={userInput}
            />
          </motion.div>
        )}

        {/* STATE 2.5: Intelligent Country City Picker (for country destinations) */}
        {appState === "country-city-picker" && userInput && (
          <motion.div
            key="country-city-picker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CountryCityPicker
              country={userInput.destination}
              cities={getArrivalCities(userInput.destination)}
              duration={userInput.duration}
              onConfirm={handleCountryCitiesConfirm}
              onBack={handleStartOver}
            />
          </motion.div>
        )}

        {/* STATE 2.6: Region Country Picker (for region destinations like Europe) */}
        {appState === "region-country-picker" && userInput && (
          <motion.div
            key="region-country-picker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <RegionCountryPicker
              region={userInput.destination}
              countries={getRegionCountries(userInput.destination)}
              maxSelectable={Math.min(4, Math.max(2, Math.floor(userInput.duration / 2)))}
              onConfirm={handleRegionCountriesConfirm}
              onBack={handleStartOver}
            />
          </motion.div>
        )}

        {/* STATE 3: Route Selection (for region trips) */}
        {appState === "route-selection" && userInput && (
          <motion.div
            key="route-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <RouteSelector
              options={routeOptions}
              destination={userInput.destination}
              duration={userInput.duration}
              budget={userInput.budget}
              onSelect={handleRouteSelect}
              onBack={handleStartOver}
            />
          </motion.div>
        )}

        {/* STATE 4: Flight Selection (Real-time API) */}
        {appState === "flight-selection" && (
          <motion.div
            key="flight-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FlightSelectionPage
              outboundOptions={flightOutbound.length > 0 ? flightOutbound : (data?.flightOptions?.outbound || (data ? [data.flights.outbound] : []))}
              inboundOptions={flightInbound.length > 0 ? flightInbound : (data?.flightOptions?.inbound || (data ? [data.flights.inbound] : []))}
              destination={userInput?.destination || ""}
              origin={userInput?.origin || ""}
              initialSelectedOutbound={selectedOutbound}
              initialSelectedInbound={selectedInbound}
              onConfirm={handleFlightConfirm}
              onBack={() => {
                if (userInput?.tripType === "international" && routeOptions.length > 0) {
                  setAppState("route-selection");
                } else {
                  handleStartOver();
                }
              }}
              onHome={handleStartOver}
              loading={flightLoading}
              source={flightSource}
            />
          </motion.div>
        )}

        {/* STATE 5: Hotel Selection (Real-time API) */}
        {appState === "hotel-selection" && (
          <motion.div
            key="hotel-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <HotelSelectionPage
              hotelOptions={
                hotelOptionsByCity.length > 0
                  ? hotelOptionsByCity
                  : data?.hotelOptions && data.hotelOptions.length > 0
                    ? data.hotelOptions
                    : data?.hotels && data.hotels.length > 0
                      ? data.hotels.map((h) => [h])
                      : data ? [[data.hotel]] : [[]]
              }
              cityLabels={
                hotelCityLabels.length > 0
                  ? hotelCityLabels
                  : data?.route.isMultiCity
                    ? data.route.cities.map((c) => c.city)
                    : [userInput?.destination || ""]
              }
              nightsPerCity={
                hotelNightsPerCity.length > 0
                  ? hotelNightsPerCity
                  : data?.route.isMultiCity
                    ? data.route.cities.map((c) => c.days)
                    : [userInput?.duration || 7]
              }
              initialSelectedHotels={selectedHotels.filter(Boolean) as HotelType[]}
              onConfirm={handleHotelConfirm}
              onBack={() => setAppState("flight-selection")}
              onHome={handleStartOver}
              flightTotal={selectedFlightTotal}
              flightTotalLabel={selectedFlightTotalLabel}
              loading={hotelLoading}
              source={hotelSource}
            />
          </motion.div>
        )}

        {/* STATE 6: Activities Selection (Real-time API) */}
        {appState === "activities-selection" && (
          <motion.div
            key="activities-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ActivitiesSelectionPage
              cityActivities={activityOptions}
              initialSelectedActivities={selectedActivities}
              onConfirm={handleActivitiesConfirm}
              onBack={() => setAppState("hotel-selection")}
              onHome={handleStartOver}
              flightTotal={selectedFlightTotal}
              flightTotalLabel={selectedFlightTotalLabel}
              hotelTotal={
                selectedHotels.reduce((s, h) => s + (h?.totalPrice ?? 0), 0)
              }
              loading={activityLoading}
              source={activitySource}
            />
          </motion.div>
        )}

        {/* STATE 7: Summary & Checkout */}
        {appState === "summary" && (userInput?.tripType === "domestic" || (selectedOutbound && selectedInbound)) && (
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SummaryCheckoutPage
              selectedOutbound={selectedOutbound}
              selectedInbound={selectedInbound}
              selectedHotels={selectedHotels}
              selectedActivities={selectedActivities}
              cityLabels={
                hotelCityLabels.length > 0
                  ? hotelCityLabels
                  : aiRoutePlan
                    ? aiRoutePlan.cities.map((c) => c.city)
                    : [userInput?.destination || ""]
              }
              destination={userInput?.destination || ""}
              origin={userInput?.origin || ""}
              duration={userInput?.duration || 7}
              tripType={userInput?.tripType || "international"}
              onConfirm={handleSummaryConfirm}
              onBack={() => setAppState("activities-selection")}
              onHome={handleStartOver}
            />
          </motion.div>
        )}

        {/* STATE 8: Dashboard — Read-Only Trip Summary */}
        {appState === "dashboard" && (userInput?.tripType === "domestic" || (selectedOutbound && selectedInbound)) && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            {/* Top Nav */}
            <nav className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-xl">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartOver}
                  className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text-primary"
                >
                  <Home className="h-4 w-4" />
                  New Trip
                </motion.button>

                <div className="flex items-center gap-2">
                  <SafarLogo variant="full" size={28} />
                </div>

                <div className="relative">
                  {user ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary-600 to-primary-500 text-xs font-bold text-white"
                    >
                      {getInitials(user.name)}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAppState("auth")}
                      className="rounded-xl px-3 py-2 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
                    >
                      Sign In
                    </motion.button>
                  )}
                  {showUserMenu && user && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-border bg-white p-3 shadow-2xl"
                    >
                      <div className="mb-2 border-b border-border pb-2">
                        <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                        <p className="text-[11px] text-text-muted">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-400/70 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </nav>

            {/* Trip Summary Header */}
            <div className="mx-auto max-w-5xl px-4 pt-8 pb-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="mb-2 text-3xl font-extrabold text-text-primary sm:text-4xl">
                  {userInput?.origin || "Mumbai"} →{" "}
                  <span className="bg-linear-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {userInput?.destination || "Paris"}
                  </span>
                </h1>

                {/* Multi-city route overview */}
                {aiRoutePlan && aiRoutePlan.cities.length > 1 && (
                  <div className="mt-3 mb-3 flex flex-wrap items-center gap-2">
                    {aiRoutePlan.cities.map((city, i) => (
                      <React.Fragment key={city.city}>
                        {i > 0 && (
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-text-muted" />
                            {city.transportFromPrev && (
                              <span className="text-[9px] text-text-muted font-medium">
                                {city.transportFromPrev.mode === "train" ? "🚄" : "✈️"} {city.transportFromPrev.duration}
                              </span>
                            )}
                            <ArrowRight className="h-3 w-3 text-text-muted" />
                          </div>
                        )}
                        <span className="rounded-xl bg-primary-50 border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700">
                          {city.city}
                          <span className="ml-1.5 text-text-muted font-normal">
                            {city.days}d
                          </span>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                  {selectedOutbound && selectedInbound && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {selectedOutbound.departure.date} – {selectedInbound.departure.date}
                    </span>
                  )}
                  {userInput?.tripType === "domestic" && userInput?.startDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {userInput.startDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {userInput?.adults || 2} adults
                  </span>
                  {(userInput?.children || 0) > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Baby className="h-3.5 w-3.5" />
                      {userInput?.children} children
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5" />
                    {userInput?.rooms || 1} room{(userInput?.rooms || 1) > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {userInput?.duration || 7} days
                    {aiRoutePlan && aiRoutePlan.cities.length > 1 && ` • ${aiRoutePlan.cities.length} cities`}
                  </span>
                </div>

                {/* AI Source Badge */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    getFlightSourceLabel(flightSource),
                    hotelSource === "gemini-ai" ? "Gemini AI Hotels" : "Hotel Estimates",
                    activitySource === "gemini-ai" ? "Gemini AI Activities" : "Activity Database",
                    "Skyscanner",
                    "Booking.com",
                    "Viator",
                    "GetYourGuide",
                  ].map((source) => (
                    <span
                      key={source}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-medium ${source.includes("Gemini")
                        ? "bg-primary-50 text-primary-600"
                        : "bg-gray-100 text-text-muted"
                        }`}
                    >
                      {source}
                    </span>
                  ))}
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                    {aiRoutePlan && aiRoutePlan.cities.length > 1
                      ? "AI-optimized multi-city route"
                      : "AI-curated trip plan"}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Dashboard Content — Read-Only Selections */}
            <div className="mx-auto max-w-5xl space-y-8 px-4 pb-36 sm:px-6">
              {/* ── Flights (Read-Only) — International only ────────────── */}
              {userInput?.tripType !== "domestic" && selectedOutbound && selectedInbound && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-border bg-white overflow-hidden"
                >
                  <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                      <Plane className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-text-primary">Your Flights</h2>
                      <p className="text-xs text-text-muted">
                        {selectedFlightTotalLabel}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {[selectedOutbound, selectedInbound].map((flight, i) => (
                      <div key={flight.id} className="flex items-center gap-4 rounded-xl border border-border bg-gray-50 p-4">
                        {flight.airlineLogo && (
                          <img src={flight.airlineLogo} alt={flight.airline} className="h-8 w-8 rounded object-contain bg-gray-100 p-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                            <span>{flight.departure.time}</span>
                            <span className="text-xs text-text-muted">{flight.departure.code}</span>
                            <div className="flex-1 flex items-center gap-1">
                              <div className="flex-1 h-px bg-border" />
                              <span className="text-[9px] text-text-muted px-1">{flight.duration}</span>
                              <div className="flex-1 h-px bg-border" />
                            </div>
                            <span className="text-xs text-text-muted">{flight.arrival.code}</span>
                            <span>{flight.arrival.time}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                            <span>{i === 0 ? "Outbound" : "Return"}</span>
                            <span>{flight.airline}</span>
                            <span>{flight.flightNumber}</span>
                            {flight.layover && <span className="text-amber-600">1 stop via {flight.layover.city}</span>}
                            {!flight.layover && <span className="text-emerald-600">Direct</span>}
                            <span>{flight.class}</span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-text-primary shrink-0">
                          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(flight.price)}
                        </p>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[
                        { name: "Google Flights", url: `https://www.google.com/travel/flights?q=flights+from+${selectedOutbound.departure.code}+to+${selectedOutbound.arrival.code}` },
                        { name: "Skyscanner", url: `https://www.skyscanner.co.in/transport/flights/${selectedOutbound.departure.code.toLowerCase()}/${selectedOutbound.arrival.code.toLowerCase()}/` },
                        { name: "MakeMyTrip", url: `https://www.makemytrip.com/flight/search?itinerary=${selectedOutbound.departure.code}-${selectedOutbound.arrival.code}` },
                      ].map((agg) => (
                        <a key={agg.name} href={agg.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors">
                          Book on {agg.name}
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* ── Inter-City Transport ──────────────────────────────── */}
              {aiRoutePlan && aiRoutePlan.cities.length > 1 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-border bg-white overflow-hidden"
                >
                  <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15">
                      <TrainFront className="h-4 w-4 text-sky-400" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Inter-City Transport</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {aiRoutePlan.cities.filter(c => c.transportFromPrev).map((city, i) => (
                      <div key={`transport-${i}`} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3">
                        <span className="text-lg">{city.transportFromPrev?.mode === "train" ? "🚄" : city.transportFromPrev?.mode === "bus" ? "🚌" : "✈️"}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">
                            {aiRoutePlan.cities[aiRoutePlan.cities.indexOf(city) - 1]?.city} → {city.city}
                          </p>
                          <p className="text-[11px] text-white/30">
                            {city.transportFromPrev?.operator} · {city.transportFromPrev?.duration}
                          </p>
                        </div>
                        {city.transportFromPrev?.estimatedCost && (
                          <p className="text-sm font-bold text-white">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(city.transportFromPrev.estimatedCost)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* ── Hotels (Read-Only) ─────────────────────────────────── */}
              {selectedHotels.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-border bg-white overflow-hidden"
                >
                  <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15">
                      <BedDouble className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-text-primary">Your Hotels</h2>
                      <p className="text-xs text-white/30">
                        {selectedHotels.length} {selectedHotels.length === 1 ? "hotel" : "hotels"} · {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(selectedHotels.reduce((s, h) => s + (h?.totalPrice ?? 0), 0))}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {selectedHotels.map((hotel, i) => hotel && (
                      <div key={hotel.id} className="flex items-center gap-4 rounded-xl border border-border bg-gray-50 p-4">
                        <img src={hotel.image} alt={hotel.name} className="h-16 w-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{hotel.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
                            {hotelCityLabels[i] && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{hotelCityLabels[i]}</span>}
                            <span>{"★".repeat(hotel.stars || 0)} {hotel.rating?.toFixed(1)}</span>
                            <span>{hotel.nights} nights</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {hotel.amenities?.slice(0, 4).map((a: string) => (
                              <span key={a} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/25">{a}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-white">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(hotel.totalPrice)}
                          </p>
                          <p className="text-[10px] text-white/25">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(hotel.pricePerNight)}/night
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedHotels[0] && [
                        { name: "Booking.com", url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(selectedHotels[0].name)}` },
                        { name: "Agoda", url: `https://www.agoda.com/search?q=${encodeURIComponent(selectedHotels[0].name)}` },
                        { name: "MakeMyTrip", url: `https://www.makemytrip.com/hotels/hotel-listing/?txtKeyword=${encodeURIComponent(selectedHotels[0].name)}` },
                      ].map((agg) => (
                        <a key={agg.name} href={agg.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors">
                          Book on {agg.name}
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* ── Activities (Read-Only) ──────────────────────────────── */}
              {selectedActivities.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-border bg-white overflow-hidden"
                >
                  <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
                      <MapPin className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-text-primary">Your Activities</h2>
                      <p className="text-xs text-white/30">
                        {selectedActivities.length} experiences · {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(selectedActivities.reduce((s, a) => s + a.price, 0))}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 grid gap-3 sm:grid-cols-2">
                    {selectedActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3">
                        {activity.image && <img src={activity.image} alt={activity.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/30">
                            <span>{activity.duration}</span>
                            <span>★ {activity.rating.toFixed(1)}</span>
                            <span className="font-semibold text-white/50">
                              {activity.price > 0
                                ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(activity.price)
                                : "Free"}
                            </span>
                          </div>
                        </div>
                        {activity.bookingUrl && (
                          <a href={activity.bookingUrl} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[9px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors">
                            Book <ArrowRight className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-5 pb-5 flex flex-wrap gap-2">
                    {[
                      { name: "Viator", url: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(userInput?.destination || "")}` },
                      { name: "GetYourGuide", url: `https://www.getyourguide.com/s/?q=${encodeURIComponent(userInput?.destination || "")}` },
                    ].map((agg) => (
                      <a key={agg.name} href={agg.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors">
                        Browse on {agg.name}
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* ── Meal Cost Info (Not Added to Total) ─────────────────── */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl border border-white/8 bg-linear-to-br from-orange-500/5 to-amber-500/5 p-6"
              >
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  🍽️ Estimated Daily Meal Costs
                  <span className="text-[10px] font-normal text-white/30 bg-white/5 rounded px-2 py-0.5">For reference only — not included in total</span>
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { meal: "Breakfast", emoji: "☕", range: "₹300 – ₹1,500" },
                    { meal: "Lunch", emoji: "🍱", range: "₹500 – ₹2,500" },
                    { meal: "Dinner", emoji: "🍽️", range: "₹800 – ₹4,000" },
                  ].map((m) => (
                    <div key={m.meal} className="text-center">
                      <p className="text-lg">{m.emoji}</p>
                      <p className="text-xs font-semibold text-white/60">{m.meal}</p>
                      <p className="text-[11px] text-white/30">{m.range}/person</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/20 mt-3 text-center">
                  Ranges vary by city and restaurant type. Street food is cheapest, fine dining at the top end.
                </p>
              </motion.section>

              {/* ── Price Summary ───────────────────────────────────────── */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-white/8 bg-linear-to-br from-indigo-500/8 to-purple-500/5 p-6"
              >
                <h2 className="text-sm font-bold text-white mb-4">Price Breakdown</h2>
                <div className="space-y-3">
                  {userInput?.tripType !== "domestic" && selectedOutbound && selectedInbound && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50 flex items-center gap-2"><Plane className="h-3.5 w-3.5 text-indigo-400" />Flights (2)</span>
                      <span className="font-semibold text-white">{selectedFlightTotalLabel}</span>
                    </div>
                  )}
                  {selectedHotels.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50 flex items-center gap-2"><BedDouble className="h-3.5 w-3.5 text-purple-400" />Hotels ({selectedHotels.length})</span>
                      <span className="font-semibold text-white">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(selectedHotels.reduce((s, h) => s + (h?.totalPrice ?? 0), 0))}</span>
                    </div>
                  )}
                  {selectedActivities.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50 flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-amber-400" />Activities ({selectedActivities.length})</span>
                      <span className="font-semibold text-white">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(selectedActivities.reduce((s, a) => s + a.price, 0))}</span>
                    </div>
                  )}
                  {aiRoutePlan && aiRoutePlan.cities.filter(c => c.transportFromPrev).length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50 flex items-center gap-2"><TrainFront className="h-3.5 w-3.5 text-sky-400" />Inter-city Transport</span>
                      <span className="font-semibold text-white">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(aiRoutePlan.cities.reduce((s, c) => s + (c.transportFromPrev?.estimatedCost || 0), 0))}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                    <span className="text-base font-bold text-white">Grand Total</span>
                    <span className="text-2xl font-extrabold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
                        (userInput?.tripType !== "domestic" && selectedOutbound && selectedInbound ? selectedFlightTotal : 0) +
                        selectedHotels.reduce((s, h) => s + (h?.totalPrice ?? 0), 0) +
                        selectedActivities.reduce((s, a) => s + a.price, 0) +
                        (aiRoutePlan?.cities.reduce((s, c) => s + (c.transportFromPrev?.estimatedCost || 0), 0) || 0)
                      )}
                    </span>
                  </div>
                </div>
              </motion.section>

              {/* ── Visa & Documents (international only) ─────────────── */}
              {data && userInput?.tripType !== "domestic" && <VisaDocHub visa={data.visa} />}

              {/* ── AI Agent Intelligence ──────────────────────────────── */}
              <AIInsightsPanel />

              {/* ── AI Travel Tips ─────────────────────────────────────── */}
              {userInput && (
                <TravelTipsPanel
                  destination={userInput.destination}
                  isDomestic={userInput.tripType === "domestic"}
                  duration={userInput.duration || 7}
                />
              )}

              {/* ── Trip Cost Summary ──────────────────────────────────── */}
              {userInput && (
                <TripCostSummary
                  destination={userInput.destination}
                  totalBudget={userInput.budget || 300000}
                  travelers={(userInput.adults || 2) + (userInput.children || 0)}
                  duration={userInput.duration || 7}
                  flightCost={userInput.tripType !== "domestic" && selectedOutbound && selectedInbound ? selectedFlightTotal : 0}
                  hotelCost={selectedHotels.reduce((s, h) => s + (h?.totalPrice ?? 0), 0)}
                  foodCost={Math.round(
                    selectedActivities.filter((a) => a.category === "food").reduce((s, a) => s + a.price, 0) ||
                    (userInput.budget || 300000) * 0.15
                  )}
                  activityCost={selectedActivities.filter((a) => a.category !== "food").reduce((s, a) => s + a.price, 0)}
                  transportCost={aiRoutePlan?.cities.reduce((s, c) => s + (c.transportFromPrev?.estimatedCost || 0), 0) || 0}
                  onShareClick={() => setShowShareCard(true)}
                />
              )}
            </div>

            {/* Floating Share Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              onClick={() => setShowShareCard(true)}
              className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 sm:right-8"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>

            {/* Share Trip Card Modal */}
            <ShareTripCard
              isOpen={showShareCard}
              onClose={() => setShowShareCard(false)}
              destination={userInput?.destination || ""}
              origin={userInput?.origin || ""}
              duration={userInput?.duration || 7}
              adults={userInput?.adults || 2}
              children={userInput?.children || 0}
              budget={userInput?.budget || 300000}
              travelStyle={userInput?.travelStyle}
              highlights={selectedActivities.slice(0, 4).map((a) => a.title)}
            />

            {/* Sticky Bottom — Download PDF */}
            <StickyCart
              flightTotal={userInput?.tripType !== "domestic" && selectedOutbound && selectedInbound ? selectedFlightTotal : 0}
              hotelTotal={selectedHotels.reduce((s, h) => s + (h?.totalPrice ?? 0), 0)}
              activitiesTotal={selectedActivities.reduce((s, a) => s + a.price, 0)}
              transportTotal={aiRoutePlan?.cities.reduce((s, c) => s + (c.transportFromPrev?.estimatedCost || 0), 0) || 0}
              budget={userInput?.budget || 300000}
              tripData={data || undefined}
              selectedOutbound={selectedOutbound ?? undefined}
              selectedInbound={selectedInbound ?? undefined}
              selectedHotels={selectedHotels}
              travelerName={user?.name}
              onSignInRequired={() => {
                setReturnToState("dashboard");
                setAppState("auth");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat & Contact buttons (visible on all states except input which has full footer) */}
      {appState !== "input" && appState !== "auth" && (
        <Footer />
      )}
    </main>
  );
}


