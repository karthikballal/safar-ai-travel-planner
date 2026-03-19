// ─── PostHog Provider ─────────────────────────────────────────────────────
// Initializes PostHog analytics on the client side.

"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog";

export default function PostHogBootstrap() {
  useEffect(() => {
    initPostHog();
  }, []);

  return null;
}
