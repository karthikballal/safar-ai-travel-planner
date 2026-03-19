// ─── Tracked Affiliate Link Component ─────────────────────────────────────
// Renders an outbound affiliate link with proper attributes and click tracking.

"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

interface AffiliateLinkProps {
  provider: string;
  category: "flight" | "hotel" | "activity" | "insurance" | "train";
  href: string;
  label?: string;
  tripId?: string;
  className?: string;
  showIcon?: boolean;
  children: React.ReactNode;
}

export default function AffiliateLink({
  provider,
  category,
  href,
  label,
  tripId,
  className = "",
  showIcon = true,
  children,
}: AffiliateLinkProps) {
  const trackUrl = `/api/go/${provider}?url=${encodeURIComponent(href)}&category=${category}${tripId ? `&trip=${tripId}` : ""}${label ? `&label=${encodeURIComponent(label)}` : ""}`;

  return (
    <a
      href={trackUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
    >
      {children}
      {showIcon && <ExternalLink className="inline-block ml-1 h-3 w-3" />}
      <span className="sr-only">(opens in new tab, affiliate link)</span>
    </a>
  );
}
