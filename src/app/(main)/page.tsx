"use client";

import React from "react";
import Link from "next/link";
import {
  Plane,
  Shield,
  Sparkles,
  Globe,
  ArrowRight,
  MapPin,
  Star,
  Clock,
  IndianRupee,
  Users,
  Heart,
  Backpack,
  Baby,
  Compass,
  ChevronRight,
  CheckCircle,
  Quote,
  TrendingUp,
} from "lucide-react";
import SmartSearchBar from "@/components/SmartSearchBar";
import SocialProof from "@/components/SocialProof";

/* ─── Destination data with Unsplash images ──────────────────────────── */
const TRENDING_DESTINATIONS = [
  {
    name: "Bali",
    tagline: "Tropical paradise",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=800&fit=crop",
    slug: "bali",
    price: "₹28,000",
    duration: "5-7 days",
    badge: "TRENDING",
    badgeClass: "badge-trending",
  },
  {
    name: "Dubai",
    tagline: "Luxury & shopping",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=800&fit=crop",
    slug: "dubai",
    price: "₹35,000",
    duration: "4-6 days",
    badge: "POPULAR",
    badgeClass: "badge-popular",
  },
  {
    name: "Thailand",
    tagline: "Budget-friendly getaway",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&h=800&fit=crop",
    slug: "thailand",
    price: "₹22,000",
    duration: "5-7 days",
    badge: "BUDGET",
    badgeClass: "badge-budget",
  },
  {
    name: "Maldives",
    tagline: "Overwater luxury",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=800&fit=crop",
    slug: "maldives",
    price: "₹45,000",
    duration: "4-5 days",
    badge: "HONEYMOON",
    badgeClass: "badge-honeymoon",
  },
  {
    name: "Goa",
    tagline: "Beaches & nightlife",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=800&fit=crop",
    slug: "goa",
    price: "₹8,500",
    duration: "3-5 days",
    badge: "POPULAR",
    badgeClass: "badge-popular",
  },
  {
    name: "Vietnam",
    tagline: "Culture & cuisine",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=800&fit=crop",
    slug: "vietnam",
    price: "₹25,000",
    duration: "6-8 days",
    badge: "NEW",
    badgeClass: "badge-new",
  },
  {
    name: "Kerala",
    tagline: "Backwaters & ayurveda",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=800&fit=crop",
    slug: "kerala",
    price: "₹9,000",
    duration: "4-6 days",
    badge: "IN SEASON",
    badgeClass: "badge-season",
  },
  {
    name: "Japan",
    tagline: "Tradition meets future",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=800&fit=crop",
    slug: "japan",
    price: "₹65,000",
    duration: "7-10 days",
    badge: "TRENDING",
    badgeClass: "badge-trending",
  },
];

/* ─── Trip type selectors (PYT-style icon cards) ─────────────────────── */
const TRIP_TYPES = [
  { icon: Heart, label: "Couple", color: "text-pink-500 bg-pink-50" },
  { icon: Users, label: "Family", color: "text-blue-500 bg-blue-50" },
  { icon: Backpack, label: "Friends", color: "text-orange-500 bg-orange-50" },
  { icon: Compass, label: "Solo", color: "text-purple-500 bg-purple-50" },
];

/* ─── How it works ───────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Tell us your dream",
    desc: "Enter destination, dates, budget, and preferences — or just describe your ideal trip in plain English.",
    icon: MapPin,
  },
  {
    step: 2,
    title: "AI builds your trip",
    desc: "7 specialised AI agents research flights, hotels, activities, visa docs and dining across 12+ platforms.",
    icon: Sparkles,
  },
  {
    step: 3,
    title: "Book at best prices",
    desc: "Compare estimated prices, then book on Skyscanner, Booking.com, Google Flights & more at real-time rates.",
    icon: IndianRupee,
  },
];

/* ─── Testimonials ───────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Priya M.",
    location: "Mumbai",
    text: "Planned our entire Bali honeymoon in under 3 minutes. The AI suggested hidden gems we would have never found on our own!",
    rating: 5,
    trip: "Bali · 7 days",
  },
  {
    name: "Arjun K.",
    location: "Bangalore",
    text: "The budget estimates were surprisingly accurate. Saved us hours of research and got us better deals through the affiliate links.",
    rating: 5,
    trip: "Thailand · 5 days",
  },
  {
    name: "Sneha R.",
    location: "Delhi",
    text: "Best part? The visa document section told us exactly what to prepare. No other travel site does this automatically.",
    rating: 5,
    trip: "Dubai · 4 days",
  },
];

/* ─── Stats ──────────────────────────────────────────────────────────── */
const STATS = [
  { value: "30+", label: "Destinations" },
  { value: "7", label: "AI Agents" },
  { value: "2 min", label: "Avg. Plan Time" },
  { value: "12+", label: "Booking Partners" },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative hero-gradient pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pt-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-bold text-primary-700">
              <Sparkles size={14} />
              AI-powered travel planning
              <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-white">
                FREE
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Create your{" "}
              <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                perfect holiday
              </span>
              <br className="hidden sm:block" />
              <span className="text-text-secondary"> in minutes</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
              7 AI agents collaborate in real-time — researching flights, hotels,
              activities & visa docs — to craft your dream trip.
              Compare prices across 12+ booking platforms.
            </p>

            {/* Smart Search Bar */}
            <div className="mt-8">
              <SmartSearchBar />
            </div>

            {/* Divider */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-border" />
              <span className="text-xs font-medium text-text-muted">
                or use the step-by-step planner
              </span>
              <div className="h-px w-16 bg-border" />
            </div>

            {/* Trip type selectors (PYT-style) */}
            <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
              {TRIP_TYPES.map(({ icon: Icon, label, color }) => (
                <Link
                  key={label}
                  href={`/plan?style=${label.toLowerCase()}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 transition-all hover:border-primary-200 hover:shadow-md sm:px-6"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} transition-transform group-hover:scale-110`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ─────────────────────────────────────────────── */}
      <SocialProof />

      {/* ─── TRENDING DESTINATIONS (PYT full-bleed cards) ──────────────────── */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-text-primary sm:text-3xl">
              Trending destinations
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Estimated starting prices per person (incl. flights & hotels)
            </p>
          </div>
          <Link
            href="/plan"
            className="hidden items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 sm:flex"
          >
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Destination grid — 4 cols desktop, 2 cols mobile */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TRENDING_DESTINATIONS.map((dest) => (
            <Link
              key={dest.slug}
              href={`/plan?destination=${dest.name}`}
              className="dest-card group"
            >
              <img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
              />
              <div className="overlay" />

              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span className={`badge ${dest.badgeClass}`}>
                  {dest.badge}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                <p className="text-xs text-white/70">{dest.tagline}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="price-prefix text-white/60">STARTING FROM</p>
                    <p className="text-lg font-bold text-white">{dest.price}</p>
                  </div>
                  <span className="text-[10px] font-medium text-white/60">
                    {dest.duration}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface-elevated py-14 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-extrabold text-text-primary sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Your dream trip is 3 steps away
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="relative mx-auto mb-5">
                  <div className="step-dot step-dot-active mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg">
                    {step}
                  </div>
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-4xl font-extrabold text-primary-600 sm:text-5xl">
                  {value}
                </p>
                <p className="mt-1 text-sm font-medium text-text-secondary">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE SAFAR (PYT "3 pillars") ──────────────────────────── */}
      <section className="border-y border-border bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-extrabold text-text-primary sm:text-3xl">
            Why travelers choose Safar
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "AI Customisation",
                desc: "7 specialised agents build a personalised itinerary based on your exact preferences, budget, and travel style.",
                color: "text-primary-600 bg-primary-50",
              },
              {
                icon: Shield,
                title: "Trusted Prices",
                desc: "AI-estimated prices based on real market data. Book through Skyscanner, Booking.com & Google Flights for exact rates.",
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: Globe,
                title: "Complete Planning",
                desc: "Flights, hotels, activities, visa docs, dining, and local transport — all planned in one place in under 2 minutes.",
                color: "text-amber-600 bg-amber-50",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="card rounded-2xl p-6 sm:p-8"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-extrabold text-text-primary sm:text-3xl">
            Loved by travelers
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Real stories from people who planned with Safar
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map(({ name, location, text, rating, trip }) => (
              <div
                key={name}
                className="card rounded-2xl p-6"
              >
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      {name}
                    </p>
                    <p className="text-xs text-text-muted">{location}</p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-[10px] font-bold text-primary-700">
                    {trip}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNER LOGOS ────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-elevated py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
            Compare prices across top booking platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-60">
            {[
              "Google Flights",
              "Skyscanner",
              "Booking.com",
              "MakeMyTrip",
              "Cleartrip",
              "Viator",
              "GetYourGuide",
            ].map((partner) => (
              <span
                key={partner}
                className="text-sm font-bold text-text-muted"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="rounded-3xl bg-gradient-to-r from-primary-50 via-white to-primary-50 border border-primary-100 p-8 sm:p-12">
            <h2 className="font-display text-2xl font-extrabold text-text-primary sm:text-3xl">
              Ready to plan your next adventure?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
              Join thousands of Indian travelers planning smarter trips with AI.
              Completely free — no sign-up required to start.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/plan"
                className="btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold"
              >
                <Plane size={18} />
                Start Planning — It&apos;s Free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary-600 transition-colors"
              >
                Read travel guides
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
