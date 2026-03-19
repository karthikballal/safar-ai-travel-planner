// ─── Affiliate Click Tracker ──────────────────────────────────────────────
// Logs clicks to Firestore for attribution analysis.

import { logAffiliateClick } from "@/lib/firebase/firestore";

interface TrackClickParams {
  provider: string;
  category: "flight" | "hotel" | "activity" | "insurance" | "train";
  destinationUrl: string;
  label?: string;
  tripId?: string;
  userId?: string;
  referrerPage?: string;
}

export async function trackAffiliateClick(params: TrackClickParams): Promise<void> {
  try {
    await logAffiliateClick({
      provider: params.provider,
      category: params.category,
      destinationUrl: params.destinationUrl,
      label: params.label,
      tripId: params.tripId || "",
      userId: params.userId || "",
      referrerPage: params.referrerPage,
    });
  } catch (e) {
    console.error("[Affiliate] Failed to track click:", e);
  }
}
