"use client";

import React from "react";
import ClientAppFlow from "@/components/ClientAppFlow";

/**
 * Trip planning wizard — renders the existing ClientAppFlow state machine
 * inside the new App Router layout (nav + footer from (main)/layout.tsx).
 *
 * ClientAppFlow already manages the full wizard lifecycle:
 * input → processing → city/route pickers → flights → hotels → activities → summary
 *
 * The plan layout's StepIndicator reads from the Zustand store's appState.
 */
export default function PlanPage() {
  return <ClientAppFlow />;
}
