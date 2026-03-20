"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-up";
  delay?: number;
  stagger?: number;
  /** If true, animates direct children with stagger */
  staggerChildren?: boolean;
}

/**
 * ScrollReveal — GSAP ScrollTrigger wrapper
 * Animates children into view when they enter the viewport.
 */
export default function ScrollReveal({
  children,
  className = "",
  variant = "fade-up",
  delay = 0,
  stagger = 0.1,
  staggerChildren = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    const fromVars: gsap.TweenVars = { opacity: 0, duration: 0.8, ease: "power3.out", delay };

    switch (variant) {
      case "fade-up":
        fromVars.y = 40;
        break;
      case "fade-in":
        break;
      case "slide-left":
        fromVars.x = -60;
        break;
      case "slide-right":
        fromVars.x = 60;
        break;
      case "scale-up":
        fromVars.scale = 0.9;
        break;
    }

    const targets = staggerChildren ? el.children : el;

    const tween = gsap.from(targets, {
      ...fromVars,
      stagger: staggerChildren ? stagger : 0,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });

    return () => {
      tween.kill();
    };
  }, [variant, delay, stagger, staggerChildren]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
