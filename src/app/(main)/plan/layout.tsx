"use client";

import React from "react";
import { useTripStore } from "@/store/useTripStore";
import StepIndicator, { type Step } from "@/components/ui/StepIndicator";
import type { AppState } from "@/store/useTripStore";

const WIZARD_STEPS: Step[] = [
  { id: "input", label: "Trip Details" },
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
  { id: "activities", label: "Activities" },
  { id: "summary", label: "Summary" },
];

/** Map Zustand appState values to wizard step IDs */
function mapAppStateToStep(appState: AppState): string {
  switch (appState) {
    case "auth":
    case "input":
    case "processing":
    case "arrival-city-picker":
    case "country-city-picker":
    case "region-country-picker":
    case "route-selection":
      return "input";
    case "flight-selection":
      return "flights";
    case "hotel-selection":
      return "hotels";
    case "activities-selection":
      return "activities";
    case "summary":
    case "dashboard":
      return "summary";
    default:
      return "input";
  }
}

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  const appState = useTripStore((s) => s.appState);
  const currentStep = mapAppStateToStep(appState);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="border-b border-border bg-white">
        <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
