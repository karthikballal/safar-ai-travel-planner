"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import SafarLogo from "./SafarLogo";
import { useAuth } from "@/lib/auth";

type AuthMode = "signin" | "signup";

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onSkip: () => void;
}

export default function AuthScreen({ onAuthSuccess, onSkip }: AuthScreenProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = mode === "signup"
        ? await signUp(name, email, password)
        : await signIn(email, password);

      if (result.success) {
        onAuthSuccess();
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <SafarLogo size={48} variant="full" className="mb-4" />
          <p className="text-sm text-text-muted">
            {mode === "signin" ? "Welcome back, traveler" : "Begin your journey"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="card rounded-3xl p-8">
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <h2 className="text-xl font-bold text-text-primary">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </h2>

              {/* Name — signup only */}
              {mode === "signup" && (
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    <User className="h-3 w-3" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary-500 focus:bg-primary-50"
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <Mail className="h-3 w-3" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary-500 focus:bg-primary-50"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <Lock className="h-3 w-3" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 pr-12 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary-500 focus:bg-primary-50"
                    required
                    minLength={mode === "signup" ? 6 : 1}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted transition-colors hover:text-text-secondary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-600"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading || googleLoading}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Google OAuth */}
              <motion.button
                type="button"
                disabled={loading || googleLoading}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  setError("");
                  setGoogleLoading(true);
                  const result = await signInWithGoogle();
                  if (result.success) {
                    onAuthSuccess();
                  } else if (result.error) {
                    setError(result.error);
                  }
                  setGoogleLoading(false);
                }}
                className="flex w-full min-h-12 items-center justify-center gap-3 rounded-2xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-xs text-text-muted transition-colors hover:text-text-secondary"
            >
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <span className="font-semibold text-primary-600">Sign Up</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="font-semibold text-primary-600">Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onSkip}
          className="mt-6 w-full text-center text-xs text-text-muted transition-colors hover:text-text-secondary"
        >
          Continue without signing in →
        </motion.button>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] text-text-muted"
        >
          <span>🔒 Bcrypt encrypted • Firebase cloud</span>
          <span>⚡ 7 AI agents • Real flight data</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
