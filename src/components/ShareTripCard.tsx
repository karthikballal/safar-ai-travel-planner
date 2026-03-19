"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, Check, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────

interface ShareTripCardProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  origin: string;
  duration: number;
  adults: number;
  children?: number;
  budget: number;
  travelStyle?: string;
  highlights?: string[];
  slug?: string;
}

// ─── Country flag helper ──────────────────────────────────────────────────

const DESTINATION_FLAGS: Record<string, string> = {
  japan: "\u{1F1EF}\u{1F1F5}",
  france: "\u{1F1EB}\u{1F1F7}",
  paris: "\u{1F1EB}\u{1F1F7}",
  italy: "\u{1F1EE}\u{1F1F9}",
  rome: "\u{1F1EE}\u{1F1F9}",
  thailand: "\u{1F1F9}\u{1F1ED}",
  bangkok: "\u{1F1F9}\u{1F1ED}",
  bali: "\u{1F1EE}\u{1F1E9}",
  indonesia: "\u{1F1EE}\u{1F1E9}",
  dubai: "\u{1F1E6}\u{1F1EA}",
  singapore: "\u{1F1F8}\u{1F1EC}",
  london: "\u{1F1EC}\u{1F1E7}",
  usa: "\u{1F1FA}\u{1F1F8}",
  "new york": "\u{1F1FA}\u{1F1F8}",
  australia: "\u{1F1E6}\u{1F1FA}",
  switzerland: "\u{1F1E8}\u{1F1ED}",
  spain: "\u{1F1EA}\u{1F1F8}",
  turkey: "\u{1F1F9}\u{1F1F7}",
  vietnam: "\u{1F1FB}\u{1F1F3}",
  "sri lanka": "\u{1F1F1}\u{1F1F0}",
  maldives: "\u{1F1F2}\u{1F1FB}",
  nepal: "\u{1F1F3}\u{1F1F5}",
  greece: "\u{1F1EC}\u{1F1F7}",
  egypt: "\u{1F1EA}\u{1F1EC}",
  malaysia: "\u{1F1F2}\u{1F1FE}",
  korea: "\u{1F1F0}\u{1F1F7}",
  india: "\u{1F1EE}\u{1F1F3}",
  goa: "\u{1F1EE}\u{1F1F3}",
  rajasthan: "\u{1F1EE}\u{1F1F3}",
  kerala: "\u{1F1EE}\u{1F1F3}",
  europe: "\u{1F30D}",
  "south east asia": "\u{1F30F}",
  "southeast asia": "\u{1F30F}",
};

function getFlag(destination: string): string {
  const lower = destination.toLowerCase();
  for (const [key, flag] of Object.entries(DESTINATION_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return "\u{1F30D}";
}

// ─── Format helpers ───────────────────────────────────────────────────────

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStyleLabel(style?: string): string {
  if (!style) return "";
  const labels: Record<string, string> = {
    comfort: "Comfort",
    backpacker: "Backpacker",
    luxury: "Luxury",
    adventure: "Adventure",
    cultural: "Cultural",
    romantic: "Romantic",
    family: "Family",
  };
  return labels[style] || style.charAt(0).toUpperCase() + style.slice(1);
}

// ─── Component ────────────────────────────────────────────────────────────

export default function ShareTripCard({
  isOpen,
  onClose,
  destination,
  origin,
  duration,
  adults,
  children: childCount = 0,
  budget,
  travelStyle,
  highlights = [],
  slug,
}: ShareTripCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = slug
    ? `https://safar-ai-travel-planner.vercel.app/trip/${slug}`
    : typeof window !== "undefined"
      ? window.location.href
      : "";

  const totalTravelers = adults + childCount;
  const flag = getFlag(destination);
  const topHighlights = highlights.slice(0, 4);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [shareUrl]);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out my ${duration}-day ${destination} trip plan! ${shareUrl} - Made with Safar AI \u{1F9F3}`
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Just planned my ${duration}-day ${destination} trip with AI! \u{1F30D}`
  )}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="share-modal"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] z-[70] mx-auto max-w-md sm:inset-x-auto sm:w-full"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Card */}
            <div className="relative overflow-hidden rounded-3xl">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />

              {/* Content */}
              <div className="relative p-6 sm:p-8">
                {/* Header */}
                <div className="mb-6">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/50">
                    Trip Plan
                  </p>
                  <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                    {duration} Days in {destination} {flag}
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    From {origin}
                  </p>
                </div>

                {/* Stats row */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3 text-center">
                    <p className="text-lg font-bold text-white">{duration}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                      Days
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3 text-center">
                    <p className="text-lg font-bold text-white">{totalTravelers}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                      Travelers
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3 text-center">
                    <p className="text-sm font-bold text-white leading-tight">{formatINR(budget)}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                      Budget
                    </p>
                  </div>
                </div>

                {/* Travel Style Badge */}
                {travelStyle && (
                  <div className="mb-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {formatStyleLabel(travelStyle)} Style
                    </span>
                  </div>
                )}

                {/* Highlights */}
                {topHighlights.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                      Highlights
                    </p>
                    <div className="space-y-2">
                      {topHighlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 rounded-xl bg-white/8 backdrop-blur-sm border border-white/5 px-3.5 py-2.5"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-white/90 truncate">
                            {h}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Branding */}
                <div className="mb-6 flex items-center gap-2 text-white/30">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    Generated with Safar AI
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Share buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {/* WhatsApp */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3 transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/20">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-white/70">WhatsApp</span>
                  </a>

                  {/* Twitter/X */}
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3 transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-white/70">Twitter/X</span>
                  </a>

                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3 transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      {copied ? (
                        <Check className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Copy className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-white/70">
                      {copied ? "Copied!" : "Copy Link"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Toast notification */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 px-4 py-2.5"
                >
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">
                    Link copied to clipboard!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
