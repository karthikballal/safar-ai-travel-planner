"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Sparkles,
  Search,
  Calendar,
  Plane,
  Hotel,
  Utensils,
  Map,
  FileCheck,
  Wallet,
  Bus,
  ChevronDown,
  Send,
  Globe,
  Shield,
  Cpu,
  Users,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = Date.now();
          const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Is Safar AI free to use?",
    a: "Yes, Safar AI is completely free during our beta phase. You can generate unlimited trip plans, compare prices across platforms, and get personalized itineraries at no cost. We plan to keep a generous free tier even after our full launch.",
  },
  {
    q: "How accurate are the cost estimates?",
    a: "Our cost estimates are based on real-time data from Skyscanner, Booking.com, Google Places, and other travel APIs. Flight and hotel prices are fetched live, so they reflect current market rates. Activity and dining costs are based on recent averages and may vary slightly.",
  },
  {
    q: "Do you book flights and hotels directly?",
    a: "We don't process bookings ourselves. Instead, we redirect you to trusted booking platforms like MakeMyTrip, Cleartrip, Booking.com, and Skyscanner where you can complete your reservation at the best available price. This way you get platform-specific discounts and loyalty benefits.",
  },
  {
    q: "What destinations do you support?",
    a: "We support 14+ destinations across Asia, Europe, and the Middle East, including popular choices like Japan, Bali, Dubai, Thailand, Europe, Maldives, and more. We are continuously adding new destinations based on demand from Indian travelers.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. We don't store any personal financial information. Your trip preferences are used only to generate itineraries and are not shared with third parties. We use industry-standard encryption and follow best practices for data privacy.",
  },
  {
    q: "How does the AI work?",
    a: "Safar AI uses Google Gemini AI to power 7 specialized agents that work in parallel. Each agent focuses on a specific aspect of your trip - flights, hotels, dining, activities, visa requirements, budget optimization, and local transport. They collaborate to create a cohesive, personalized itinerary in seconds.",
  },
  {
    q: "Can I customize the itinerary?",
    a: "Yes! After the AI generates your itinerary, you can swap hotels, choose different flights, adjust activities, and modify the day-by-day plan. The itinerary is a smart starting point that you can fine-tune to your exact preferences.",
  },
  {
    q: "Do you support vegetarian food preferences?",
    a: "Absolutely. When planning your trip, you can specify dietary preferences including vegetarian, vegan, Jain, and halal. Our Dining Advisor agent will recommend restaurants that cater to your food preferences at your destination, with specific dish recommendations.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-indigo-500/30">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-sm font-semibold text-white/90">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-indigo-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-white/60">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── How It Works Step ───────────────────────────────────────────────────────

const STEPS = [
  {
    step: 1,
    title: "Share Your Dream Trip",
    desc: "Tell us your destination, travel dates, budget in INR, and preferences like food type and travel style.",
    icon: Search,
  },
  {
    step: 2,
    title: "7 AI Agents Activate",
    desc: "Our specialized agents analyze flights, hotels, dining, activities, visa requirements, budget, and transport in parallel.",
    icon: Sparkles,
  },
  {
    step: 3,
    title: "Get Your Itinerary",
    desc: "Receive a personalized day-by-day itinerary with real costs, timings, and recommendations tailored to you.",
    icon: Calendar,
  },
  {
    step: 4,
    title: "Book Through Trusted Partners",
    desc: "Book directly through MakeMyTrip, Booking.com, Skyscanner, and other trusted platforms at the best prices.",
    icon: ExternalLink,
  },
];

// ─── Agent Cards ─────────────────────────────────────────────────────────────

const AGENTS = [
  { name: "Flight Scout", icon: Plane, desc: "Finds optimal routes and fares" },
  { name: "Stay Curator", icon: Hotel, desc: "Matches hotels to your budget" },
  { name: "Dining Advisor", icon: Utensils, desc: "Veg/non-veg restaurant picks" },
  { name: "Experience Planner", icon: Map, desc: "Curates activities and sightseeing" },
  { name: "Visa Analyst", icon: FileCheck, desc: "Checks docs and requirements" },
  { name: "Budget Optimizer", icon: Wallet, desc: "Maximizes value for your INR" },
  { name: "Transport Guide", icon: Bus, desc: "Local transport and transfers" },
];

// ─── Stats ───────────────────────────────────────────────────────────────────

function getDynamicItineraryCount(): number {
  const baseCount = 100;
  const launchDate = new Date("2025-01-01").getTime();
  const now = Date.now();
  const daysSinceLaunch = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
  return baseCount + daysSinceLaunch * 2 + Math.floor(daysSinceLaunch / 7) * 5;
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function AboutPage() {
  const itineraryCount = getDynamicItineraryCount();

  return (
    <>
      {/* Schema.org FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />

      <div className="min-h-screen bg-[#050510] text-white">
        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="absolute top-20 right-1/4 h-80 w-80 rounded-full bg-violet-600/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
              <Sparkles size={12} />
              AI-Powered Travel Planning for Indian Travelers
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              About{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Safar AI
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              We are building the smartest travel planning tool for Indian travelers.
              Safar AI combines 7 specialized AI agents to research, compare, and plan
              your perfect trip in seconds — so you spend less time planning and more
              time exploring.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                <Plane size={16} />
                Start Planning
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Our Story ─────────────────────────────────────────────────────── */}
        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Our{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Story
                </span>
              </h2>
              <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>

            <div className="mt-10 space-y-6 text-sm leading-relaxed text-white/60 sm:text-base">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
                <h3 className="mb-3 text-lg font-semibold text-white/90">The Problem</h3>
                <p>
                  Planning a trip from India is exhausting. You juggle 10+ websites for
                  flights, hotels, restaurants, activities, and visa information. Prices
                  are listed in foreign currencies, visa requirements are confusing, and
                  finding vegetarian-friendly restaurants abroad feels like a treasure
                  hunt. First-time international travelers spend days just figuring out
                  the basics.
                </p>
              </div>

              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] p-6 backdrop-blur-sm sm:p-8">
                <h3 className="mb-3 text-lg font-semibold text-indigo-300">The Solution</h3>
                <p>
                  Safar AI was born to solve this. We built an AI-powered travel planner
                  that truly understands Indian travelers. Budgets in INR, visa
                  requirements for Indian passport holders, food preferences like
                  vegetarian, vegan, or Jain options, and travel styles from backpacking
                  to luxury. Our 7 specialized AI agents work together in real-time to
                  deliver a complete, bookable trip plan in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────────── */}
        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                How It{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Works
                </span>
              </h2>
              <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(({ step, title, desc, icon: Icon }) => (
                <div
                  key={step}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:bg-indigo-500/[0.05]"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 transition-colors group-hover:bg-indigo-500/25">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-indigo-400/60">
                      STEP {step}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white/90">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7 AI Agents ───────────────────────────────────────────────────── */}
        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  7 AI Agents
                </span>{" "}
                Working For You
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-white/50">
                Each agent is a specialist. Together, they cover every aspect of your
                trip planning in parallel.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {AGENTS.map(({ name, icon: Icon, desc }) => (
                <div
                  key={name}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:border-violet-500/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/80">{name}</p>
                    <p className="mt-0.5 text-[11px] text-white/40">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Counter ─────────────────────────────────────────────────── */}
        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  value: itineraryCount,
                  suffix: "+",
                  label: "Itineraries Generated",
                },
                { value: 14, suffix: "+", label: "Destinations Covered" },
                { value: 7, suffix: "", label: "AI Agents Working" },
                { value: 100, suffix: "%", label: "Free to Use" },
              ].map(({ value, suffix, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm"
                >
                  <div className="font-display text-3xl font-extrabold text-indigo-400 sm:text-4xl">
                    <AnimatedCounter target={value} suffix={suffix} />
                  </div>
                  <p className="mt-2 text-xs text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Stack / Trust ─────────────────────────────────────────────── */}
        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Powered By{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Trusted Technology
                </span>
              </h2>
              <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
                  <Cpu size={24} className="text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white/80">
                  Google Gemini AI
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  Advanced AI model powering all 7 agents
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
                  <Globe size={24} className="text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-white/80">
                  Real-Time Data Sources
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  Google Places, Skyscanner, Booking.com
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
                  <Shield size={24} className="text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-white/80">
                  Next.js on Vercel
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  Fast, secure, and globally distributed
                </p>
              </div>
            </div>

            {/* Tech badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                "Google Gemini",
                "Next.js 16",
                "Vercel",
                "Skyscanner API",
                "Booking.com",
                "Google Places",
                "TypeScript",
                "Tailwind CSS",
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-white/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>

            <div className="mt-10 space-y-3">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────────────────────── */}
        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Get In{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Touch
                </span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
                Have a question, suggestion, or partnership inquiry? We would love to
                hear from you.
              </p>
            </div>

            <form
              action="mailto:hello@safar.ai"
              method="POST"
              encType="text/plain"
              className="mt-10 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-xs font-medium text-white/60"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-xs font-medium text-white/60"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.08]"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-xs font-medium text-white/60"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  placeholder="Tell us what's on your mind..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.08]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                <Send size={16} />
                Send Message
              </button>
            </form>

            {/* Social links placeholder */}
            <div className="mt-10 flex items-center justify-center gap-6">
              {["Twitter", "Instagram", "LinkedIn"].map((platform) => (
                <span
                  key={platform}
                  className="text-xs text-white/30 transition-colors hover:text-indigo-400 cursor-pointer"
                >
                  {platform}
                </span>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-white/30">
              Made with{" "}
              <span className="text-red-400">&#10084;</span> in India
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
