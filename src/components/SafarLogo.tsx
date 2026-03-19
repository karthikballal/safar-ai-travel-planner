"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  variant?: "full" | "icon" | "wordmark";
}

// Safar AI Logo — A stylized "S" formed by two connected travel route arcs,
// with a subtle directional arrow/compass element. Modern, geometric, minimal.
// The gradient flows indigo → purple → teal, matching the app's design language.

export default function SafarLogo({ size = 32, className = "", variant = "full" }: LogoProps) {
  const iconSize = size;
  const textScale = size / 32;

  const icon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="safar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="safar-grad-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
      </defs>

      {/* Outer circle — route ring */}
      <circle cx="24" cy="24" r="22" stroke="url(#safar-grad)" strokeWidth="2" opacity="0.3" />

      {/* S-shaped route path — two connected arcs forming a journey */}
      <path
        d="M16 14 C16 14, 32 10, 32 20 C32 26, 16 22, 16 28 C16 38, 32 34, 32 34"
        stroke="url(#safar-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Route dots — origin and destination */}
      <circle cx="16" cy="14" r="3" fill="#0d9488" />
      <circle cx="32" cy="34" r="3" fill="#14b8a6" />

      {/* Inner glow dot on destination */}
      <circle cx="32" cy="34" r="1.5" fill="white" opacity="0.8" />

      {/* Tiny directional arrow at destination */}
      <path
        d="M29 31.5 L32 34 L29 36.5"
        stroke="#14b8a6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );

  if (variant === "icon") return <span className={className}>{icon}</span>;

  const wordmark = (
    <span className="flex items-baseline gap-1" style={{ fontSize: `${14 * textScale}px` }}>
      <span className="font-extrabold tracking-tight text-text-primary">Safar</span>
      <span className="font-light text-text-muted">AI</span>
    </span>
  );

  if (variant === "wordmark") return <span className={className}>{wordmark}</span>;

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {icon}
      {wordmark}
    </span>
  );
}
