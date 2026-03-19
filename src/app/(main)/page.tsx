"use client";

import React from "react";
import Link from "next/link";
import { Plane, Shield, Sparkles, Globe, ArrowRight, MapPin, Star, Clock, IndianRupee } from "lucide-react";
import SmartSearchBar from "@/components/SmartSearchBar";
import SocialProof from "@/components/SocialProof";

const POPULAR_DESTINATIONS = [
  { name: "Goa", tagline: "Beaches & nightlife", image: "🏖️", slug: "goa", price: "₹8,500" },
  { name: "Manali", tagline: "Mountains & adventure", image: "🏔️", slug: "manali", price: "₹12,000" },
  { name: "Jaipur", tagline: "Heritage & culture", image: "🏰", slug: "jaipur", price: "₹6,500" },
  { name: "Dubai", tagline: "Luxury & shopping", image: "🌆", slug: "dubai", price: "₹35,000" },
  { name: "Bali", tagline: "Tropical paradise", image: "🌴", slug: "bali", price: "₹28,000" },
  { name: "Thailand", tagline: "Budget-friendly getaway", image: "⛩️", slug: "thailand", price: "₹22,000" },
  { name: "Kerala", tagline: "Backwaters & ayurveda", image: "🌿", slug: "kerala", price: "₹9,000" },
  { name: "Maldives", tagline: "Overwater luxury", image: "🏝️", slug: "maldives", price: "₹45,000" },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Tell us your plan", desc: "Enter destination, dates, budget, and preferences.", icon: MapPin },
  { step: 2, title: "AI builds your trip", desc: "Our AI finds the best flights, hotels, and activities.", icon: Sparkles },
  { step: 3, title: "Book at best prices", desc: "Compare prices from MakeMyTrip, Cleartrip, Booking.com & more.", icon: IndianRupee },
];

const TRUST_SIGNALS = [
  { icon: Shield, label: "8+ booking platforms" },
  { icon: Globe, label: "30+ destinations" },
  { icon: Sparkles, label: "AI-powered itineraries" },
  { icon: Clock, label: "Plan in 2 minutes" },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero — compact, no ambient-bg */}
      <section className="bg-gradient-to-b from-primary-50/60 to-white pb-10 pt-10 sm:pb-14 sm:pt-14">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            <Sparkles size={12} />
            AI-powered travel planning for India
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            Plan your perfect trip{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              in minutes
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-text-secondary sm:text-lg">
            Compare flights, hotels & activities from MakeMyTrip, Cleartrip, Booking.com and more.
          </p>

          {/* AI Smart Search Bar */}
          <div className="mt-6">
            <SmartSearchBar />
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="h-px w-12 bg-border" />
          </div>

          <div className="mt-3">
            <Link
              href="/plan"
              className="btn-secondary inline-flex items-center gap-2 text-sm"
            >
              <Plane size={16} />
              Use Step-by-Step Planner
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-text-secondary sm:gap-6 sm:text-sm">
            {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon size={14} className="text-primary-600" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof stats */}
      <SocialProof />

      {/* Popular Destinations */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h2 className="font-display text-center text-xl font-bold text-text-primary sm:text-2xl">
          Popular destinations
        </h2>
        <p className="mx-auto mt-1 max-w-lg text-center text-sm text-text-secondary">
          Trending trips — estimated starting prices per person (5-7 days, incl. flights &amp; hotels)
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {POPULAR_DESTINATIONS.map((dest) => (
            <Link
              key={dest.slug}
              href={`/plan?destination=${dest.name}`}
              className="card group flex flex-col items-center gap-1.5 p-4 text-center transition-all hover:scale-[1.02] hover:border-primary-200"
            >
              <span className="text-2xl">{dest.image}</span>
              <span className="text-sm font-semibold text-text-primary">{dest.name}</span>
              <span className="text-xs text-text-muted">{dest.tagline}</span>
              <span className="mt-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                from {dest.price}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-center text-xl font-bold text-text-primary sm:text-2xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-50">
                  <Icon size={20} className="text-primary-700" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-text-primary">{title}</h3>
                <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100/50 p-6 text-center sm:p-8">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl">
              Ready to explore?
            </h2>
            <p className="max-w-md text-sm text-text-secondary">
              Join thousands of Indian travelers planning smarter trips with AI. Free to use, no sign-up required to start.
            </p>
            <Link
              href="/plan"
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plane size={16} />
              Plan Your Trip — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
