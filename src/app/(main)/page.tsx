"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Compass,
  ChevronRight,
  ChevronDown,
  Bot,
  Zap,
  Route,
} from "lucide-react";
import SmartSearchBar from "@/components/SmartSearchBar";
import SocialProof from "@/components/SocialProof";
import ScrollReveal from "@/components/ScrollReveal";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Destination data ───────────────────────────────────────────────── */
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

/* ─── Trip type selectors ─────────────────────────────────────────────── */
const TRIP_TYPES = [
  { icon: Heart, label: "Couple", color: "text-pink-500 bg-pink-50 border-pink-100" },
  { icon: Users, label: "Family", color: "text-blue-500 bg-blue-50 border-blue-100" },
  { icon: Backpack, label: "Friends", color: "text-orange-500 bg-orange-50 border-orange-100" },
  { icon: Compass, label: "Solo", color: "text-purple-500 bg-purple-50 border-purple-100" },
];

/* ─── How it works ───────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Describe your trip",
    desc: "Enter your destination, dates, budget, and preferences — or simply describe your ideal holiday in plain English.",
    icon: MapPin,
  },
  {
    step: 2,
    title: "AI builds your itinerary",
    desc: "7 specialised AI agents research activities, visa requirements, dining, and local tips to craft a day-by-day itinerary.",
    icon: Sparkles,
  },
  {
    step: 3,
    title: "Review & explore",
    desc: "Get your personalised itinerary with booking links to partner platforms for flights, hotels, and experiences.",
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
    text: "The budget breakdown was incredibly helpful. Saved us hours of manual research and helped us find the best deals.",
    rating: 5,
    trip: "Thailand · 5 days",
  },
  {
    name: "Sneha R.",
    location: "Delhi",
    text: "The visa document checklist told us exactly what to prepare. No other travel site generates this automatically.",
    rating: 5,
    trip: "Dubai · 4 days",
  },
];

/* ─── Stats ──────────────────────────────────────────────────────────── */
const STATS = [
  { value: 30, suffix: "+", label: "Destinations" },
  { value: 7, suffix: "", label: "AI Agents" },
  { value: 2, suffix: " min", label: "Avg. Plan Time" },
  { value: 12, suffix: "+", label: "Booking Partners" },
];

/* ─── Bento features ─────────────────────────────────────────────────── */
const BENTO_FEATURES = [
  {
    icon: Bot,
    title: "AI Trip Planning",
    desc: "7 specialised agents build a personalised itinerary based on your exact preferences, budget, and travel style.",
    span: "sm:col-span-2 sm:row-span-2",
    iconColor: "text-primary-600 bg-primary-50",
  },
  {
    icon: Globe,
    title: "30+ Destinations",
    desc: "From Goa to Japan — domestic and international trips curated for Indian travelers.",
    span: "",
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    icon: IndianRupee,
    title: "Real-Time Prices",
    desc: "Compare across Skyscanner, Booking.com, Google Flights and more.",
    span: "",
    iconColor: "text-amber-600 bg-amber-50",
  },
  {
    icon: Zap,
    title: "Under 2 Minutes",
    desc: "Complete trip plans with flights, hotels, activities and visa docs — faster than any other platform.",
    span: "",
    iconColor: "text-purple-600 bg-purple-50",
  },
  {
    icon: Route,
    title: "Complete Itinerary",
    desc: "Day-by-day plans with dining, transport, activities and local tips — all in one place.",
    span: "",
    iconColor: "text-teal-600 bg-teal-50",
  },
];

/* ─── Animated Counter ───────────────────────────────────────────────── */
function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => setStarted(true),
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.max(0, Math.round(eased * value)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-4xl font-extrabold text-primary-600 sm:text-5xl lg:text-6xl tracking-tight">
        {count}{suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-text-secondary">{label}</p>
    </div>
  );
}

/* ─── Rotating Testimonial ───────────────────────────────────────────── */
function RotatingTestimonial() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = TESTIMONIALS[activeIdx];

  return (
    <div className="relative mx-auto max-w-3xl text-center">
      {/* Decorative quote */}
      <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-[100px] font-serif leading-none text-primary-500/10 select-none">
        &ldquo;
      </div>

      <div className="relative transition-opacity duration-500" key={activeIdx}>
        <div className="mb-5 flex items-center justify-center gap-1">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
          ))}
        </div>

        <p className="font-display text-xl font-medium leading-relaxed text-text-primary sm:text-2xl lg:text-3xl">
          &ldquo;{t.text}&rdquo;
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
            {t.name.charAt(0)}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-text-primary">{t.name}</p>
            <p className="text-xs text-text-muted">{t.location}</p>
          </div>
          <span className="ml-2 rounded-full bg-primary-50 px-3 py-1 text-[10px] font-bold text-primary-700">
            {t.trip}
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIdx ? "w-8 bg-primary-500" : "w-2 bg-gray-300"
            }`}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   LANDING PAGE — Unified Light Theme with Apple-level polish
   ═════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="overflow-hidden">

      {/* ═══════════ HERO SECTION ════════════════════════════════════════ */}
      <section className="relative -mt-16 overflow-hidden bg-gradient-to-b from-primary-50/60 via-white to-white pb-16 pt-28 sm:pb-24 sm:pt-36 lg:pt-40">
        {/* Subtle ambient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[5%] right-[10%] h-[350px] w-[350px] rounded-full bg-primary-200/20 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[5%] h-[250px] w-[250px] rounded-full bg-emerald-200/15 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-bold text-primary-700">
              <Sparkles size={14} className="text-primary-500" />
              AI-powered travel planning
              <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-white">
                FREE
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-7xl">
              Plan your
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
                dream trip.
              </span>
              <br />
              <span className="text-text-muted">Powered by AI.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
              7 AI agents collaborate in real-time — researching flights, hotels,
              activities & visa docs — to craft your perfect trip.
              Compare prices across 12+ booking platforms.
            </p>

            {/* Smart Search Bar */}
            <div className="mt-10">
              <SmartSearchBar />
            </div>

            {/* Divider */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-border" />
              <span className="text-xs font-medium text-text-muted">
                or choose a trip style
              </span>
              <div className="h-px w-16 bg-border" />
            </div>

            {/* Trip type selectors */}
            <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
              {TRIP_TYPES.map(({ icon: Icon, label, color }) => (
                <Link
                  key={label}
                  href={`/plan?style=${label.toLowerCase()}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 shadow-sm transition-all hover:border-primary-200 hover:shadow-md sm:px-6"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} transition-transform group-hover:scale-110`}>
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

        {/* Scroll indicator */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <ChevronDown size={18} className="text-text-muted animate-scroll-indicator" />
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF BAR ═══════════════════════════════════ */}
      <SocialProof />

      {/* ═══════════ TRENDING DESTINATIONS ══════════════════════════════ */}
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-text-primary sm:text-3xl lg:text-4xl">
                Trending destinations
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Estimated starting prices per person (flights + hotels included)
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
        </ScrollReveal>

        <ScrollReveal staggerChildren stagger={0.08}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {TRENDING_DESTINATIONS.map((dest) => (
              <Link key={dest.slug} href={`/plan?destination=${dest.name}`} className="dest-card group">
                <img src={dest.image} alt={dest.name} loading="lazy" />
                <div className="overlay" />
                <div className="absolute top-3 left-3">
                  <span className={`badge ${dest.badgeClass}`}>{dest.badge}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                  <p className="text-xs text-white/70">{dest.tagline}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="price-prefix text-white/60">STARTING FROM</p>
                      <p className="text-lg font-bold text-white">{dest.price}</p>
                    </div>
                    <span className="text-[10px] font-medium text-white/60">{dest.duration}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════════════════════════════════ */}
      <section className="border-y border-border bg-surface-elevated py-16 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="font-display text-2xl font-extrabold text-text-primary sm:text-3xl lg:text-4xl">
                How it works
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Your personalised trip plan is just 3 steps away
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerChildren stagger={0.15} delay={0.2}>
            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {HOW_IT_WORKS.map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="step-dot step-dot-active mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-lg">
                    {step}
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ STATS SECTION ══════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="mb-14 text-center font-display text-2xl font-extrabold text-text-primary sm:text-3xl lg:text-4xl">
              Safar in numbers
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map(({ value, suffix, label }) => (
              <AnimatedStat key={label} value={value} suffix={suffix} label={label} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHY CHOOSE SAFAR — BENTO GRID ═════════════════════ */}
      <section className="border-y border-border bg-surface-elevated py-16 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="mb-4 text-center font-display text-2xl font-extrabold text-text-primary sm:text-3xl lg:text-4xl">
              Why travelers choose Safar
            </h2>
            <p className="mb-14 text-center text-sm text-text-secondary">
              Everything you need for the perfect trip, in one place
            </p>
          </ScrollReveal>

          <ScrollReveal staggerChildren stagger={0.1}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:grid-rows-2">
              {BENTO_FEATURES.map(({ icon: Icon, title, desc, span, iconColor }) => (
                <div
                  key={title}
                  className={`card rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${span}`}
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconColor}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary lg:text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="mb-4 text-center font-display text-2xl font-extrabold text-text-primary sm:text-3xl lg:text-4xl">
              Loved by travelers
            </h2>
            <p className="mb-14 text-center text-sm text-text-secondary">
              Real stories from travelers who planned with Safar
            </p>
          </ScrollReveal>

          <ScrollReveal variant="scale-up">
            <RotatingTestimonial />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ PARTNER LOGOS ══════════════════════════════════════ */}
      <section className="border-y border-border bg-surface-elevated py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
            Compare prices across top booking platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-50">
            {["Google Flights", "Skyscanner", "Booking.com", "MakeMyTrip", "Cleartrip", "Viator", "GetYourGuide"].map(
              (partner) => (
                <span key={partner} className="text-sm font-bold text-text-muted">{partner}</span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <ScrollReveal>
            <div className="rounded-3xl bg-gradient-to-br from-primary-50 via-white to-emerald-50 border border-primary-100 p-8 sm:p-14">
              <h2 className="font-display text-2xl font-extrabold text-text-primary sm:text-3xl lg:text-4xl">
                Ready to plan your next{" "}
                <span className="bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
                  adventure
                </span>
                ?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
                Join thousands of Indian travelers planning smarter trips with AI.
                Completely free — no sign-up required to start.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/plan"
                  className="group btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold"
                >
                  <Plane size={18} />
                  Start Planning — It&apos;s Free
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
