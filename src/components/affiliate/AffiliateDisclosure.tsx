// ─── Affiliate Disclosure Banner ──────────────────────────────────────────
// FTC/ASCI compliance. Must appear on every page with affiliate links.

"use client";

import React from "react";

export default function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-xs text-zinc-400 leading-relaxed ${className}`}
    >
      Prices shown are approximate. Safar AI may earn a commission from partner
      bookings at no extra cost to you.
    </p>
  );
}
