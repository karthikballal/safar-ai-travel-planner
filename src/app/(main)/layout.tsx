"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import SafarLogo from "@/components/SafarLogo";
import { useAuth, getInitials } from "@/lib/auth";
import { AuthProvider } from "@/lib/auth";

function NavBar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Plan Trip", icon: Plane },
    ...(user ? [{ href: "/dashboard", label: "My Trips", icon: LayoutDashboard }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <SafarLogo size={28} variant="full" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                {getInitials(user.name)}
              </div>
              <button
                onClick={signOut}
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/plan"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
            >
              Start Planning
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                pathname === href
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => { signOut(); setMobileOpen(false); }}
              className="mt-2 w-full rounded-lg border border-border px-3 py-2.5 text-left text-sm text-text-secondary"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/plan"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-lg bg-primary-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Start Planning
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

function FooterBar() {
  const pathname = usePathname();
  // /plan page has its own full-featured footer via ClientAppFlow
  if (pathname === "/plan") return null;

  return (
    <footer className="border-t border-border bg-white py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <SafarLogo size={24} variant="full" />
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Safar AI. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-text-secondary">
            <Link href="/" className="hover:text-text-primary">Home</Link>
            <Link href="/plan" className="hover:text-text-primary">Plan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <FooterBar />
      </div>
    </AuthProvider>
  );
}
