"use client";

type AnalyticsEventPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function getAnonymousSessionId(): string {
  if (typeof window === "undefined") return "server";

  const key = "safar_anon_session_id";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;

  const next = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  window.sessionStorage.setItem(key, next);
  return next;
}

export function trackClientEvent(eventName: string, payload: AnalyticsEventPayload = {}): void {
  if (typeof window === "undefined") return;

  const enrichedPayload = {
    ...payload,
    sessionId: getAnonymousSessionId(),
    pathname: window.location.pathname,
    timestamp: new Date().toISOString(),
  };

  // PostHog tracking (primary)
  try {
    const { trackEvent } = require("@/lib/posthog");
    trackEvent(eventName, enrichedPayload);
  } catch {
    // PostHog not available
  }

  // Legacy gtag (kept for backward compatibility during migration)
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, enrichedPayload);
  }

  const body = JSON.stringify({
    eventName,
    payload: enrichedPayload,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", body);
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}
