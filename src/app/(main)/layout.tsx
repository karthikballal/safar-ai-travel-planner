"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plane,
  LayoutDashboard,
  BookOpen,
  Menu,
  X,
  Info,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import SafarLogo from "@/components/SafarLogo";
import { useAuth, getInitials } from "@/lib/auth";
import { AuthProvider } from "@/lib/auth";
import SmoothScroll from "@/components/SmoothScroll";

function NavBar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for navbar transparency transition
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/plan", label: "Plan Trip", icon: Plane },
    ...(user
      ? [{ href: "/dashboard", label: "My Trips", icon: LayoutDashboard }]
      : []),
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/about", label: "About", icon: Info },
  ];

  const isHome = pathname === "/";

  // Unified light navbar — transparent on home (blends with light hero), solid on scroll/other pages
  const navBg = scrolled
    ? "border-b border-border bg-white/90 backdrop-blur-xl shadow-sm"
    : isHome
      ? "bg-transparent border-b border-transparent"
      : "border-b border-border bg-white/90 backdrop-blur-xl shadow-sm";

  const textColor = "text-text-secondary hover:text-text-primary";
  const activeColor = "text-primary-700";
  const hamburgerColor = "text-text-primary";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <SafarLogo size={32} variant="full" />
        </Link>

        {/* Desktop nav — center */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                pathname === href ? activeColor : textColor
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop right — CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Trust badge */}
          <div className="mr-2 hidden items-center gap-1 lg:flex">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-semibold text-text-secondary">
              4.8
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {getInitials(user.name)}
              </div>
              <button
                onClick={signOut}
                className="text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/plan"
              className="rounded-full bg-primary-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md hover:shadow-primary-500/20"
            >
              Start Planning — Free
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden ${hamburgerColor}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 pb-4 pt-2 md:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold ${
                pathname === href
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => {
                signOut();
                setMobileOpen(false);
              }}
              className="mt-2 w-full rounded-lg border border-border px-4 py-3 text-left text-sm font-medium text-text-secondary"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/plan"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-full bg-primary-500 px-4 py-3 text-center text-sm font-bold text-white"
            >
              Start Planning — Free
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

function FooterBar() {
  const pathname = usePathname();
  if (pathname === "/plan") return null;

  const destinations = [
    "Goa", "Bali", "Dubai", "Thailand", "Maldives", "Kerala",
    "Manali", "Japan", "Vietnam", "Sri Lanka", "Singapore", "Europe",
  ];

  const themes = [
    "Honeymoon Packages", "Family Holidays", "Adventure Trips",
    "Beach Getaways", "Budget Trips", "Luxury Holidays",
  ];

  return (
    <footer className="border-t border-border bg-gray-50">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <SafarLogo size={28} variant="full" />
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              AI-powered travel planning for Indian travelers. Plan your perfect
              trip in minutes.
            </p>
            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 text-xs font-semibold text-text-secondary">
                4.8/5 rating
              </span>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-text-primary">Popular Destinations</h4>
            <div className="grid grid-cols-2 gap-1">
              {destinations.map((d) => (
                <Link
                  key={d}
                  href={`/plan?destination=${d}`}
                  className="text-sm text-text-secondary hover:text-primary-600 transition-colors py-0.5"
                >
                  {d}
                </Link>
              ))}
            </div>
          </div>

          {/* Themes */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-text-primary">Holiday Themes</h4>
            <div className="space-y-1">
              {themes.map((t) => (
                <Link
                  key={t}
                  href="/plan"
                  className="block text-sm text-text-secondary hover:text-primary-600 transition-colors py-0.5"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-text-primary">Company</h4>
            <div className="space-y-1">
              <Link href="/about" className="block text-sm text-text-secondary hover:text-primary-600 transition-colors py-0.5">About Us</Link>
              <Link href="/blog" className="block text-sm text-text-secondary hover:text-primary-600 transition-colors py-0.5">Blog</Link>
              <Link href="/privacy" className="block text-sm text-text-secondary hover:text-primary-600 transition-colors py-0.5">Privacy Policy</Link>
              <Link href="/terms" className="block text-sm text-text-secondary hover:text-primary-600 transition-colors py-0.5">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-text-muted sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} Safar AI. All rights reserved.</p>
          <p>Made with ❤️ for Indian travelers</p>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScroll>
        <div className="flex min-h-screen flex-col">
          <NavBar />
          <main className="flex-1 pt-16">{children}</main>
          <FooterBar />
        </div>
      </SmoothScroll>
    </AuthProvider>
  );
}
