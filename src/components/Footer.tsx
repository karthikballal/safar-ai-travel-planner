"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  Headphones,
  Mail,
  MapPin,
  Globe,
  ChevronUp,
  Sparkles,
  User,
  Loader2,
} from "lucide-react";
import SafarLogo from "./SafarLogo";

// ─── AI Chat Agent Responses ───────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const AI_RESPONSES: Record<string, string> = {
  // Greetings
  hello: "Hello! Welcome to Safar AI. I'm your travel assistant. How can I help you today? You can ask me about destinations, visa requirements, pricing, or anything travel-related!",
  hi: "Hi there! I'm the Safar AI assistant. Ask me anything about planning your perfect trip — destinations, budgets, visa info, or how our platform works!",
  hey: "Hey! Ready to plan something amazing? I can help with destination suggestions, trip costs, visa requirements, and more. What's on your mind?",

  // About the company
  "about": "Safar AI is an AI-powered travel planning platform. Our 7 specialized AI agents work in parallel to research flights, hotels, dining, activities, deals, and visa documentation — crafting your perfect trip in seconds, not hours.",
  "who are you": "I'm the Safar AI virtual assistant! I help travelers plan trips using our agentic AI system. Our platform combines 7 specialized AI agents that collaborate in real-time across 12+ platforms to find you the best deals.",
  "what is safar": "Safar means 'Journey' in Hindi/Urdu. Safar AI is an intelligent travel planner that uses 7 specialized AI agents to research, compare, and plan your perfect trip — covering flights, hotels, activities, restaurants, visa docs, and more.",

  // Pricing & Plans
  "pricing": "Safar AI is currently free during our beta! We plan trips for domestic and international destinations. In the future, we may offer premium features like real-time booking integration, but trip planning and itinerary generation will always have a free tier.",
  "free": "Yes! Safar AI is completely free to use during our beta phase. Generate unlimited trip plans, download PDF itineraries, and explore destinations at no cost.",
  "cost": "Using Safar AI to plan trips is free! We don't charge for trip generation, itinerary creation, or PDF downloads. We aim to keep a generous free tier even after launch.",

  // How it works
  "how does it work": "Here's how Safar AI works:\n\n1. Enter your origin, destination, dates & budget\n2. Our 7 AI agents activate in parallel — researching flights, hotels, activities, restaurants, transport & visa docs\n3. In ~10 seconds, you get a complete trip plan\n4. Choose your preferred flights & hotels\n5. Download a professional PDF itinerary\n\nSimple, fast, and free!",
  "agents": "We use 7 specialized AI agents:\n\n**Flight Scout** — Searches optimal routes & fares\n**Stay Curator** — Finds hotels matching your budget\n**Experience Planner** — Curates activities & sightseeing\n**Dining Advisor** — Restaurant recommendations\n**Deal Hunter** — Finds savings & special offers\n**Visa Analyst** — Checks requirements & documents\n\nThey work in parallel across 12+ platforms!",

  // Destinations
  "popular destinations": "Our most popular destinations from India:\n\n**Japan** — Cherry blossoms, temples, anime culture\n**Bali** — Beaches, temples, affordable luxury\n**Dubai** — Shopping, desert safaris, skyscrapers\n**Europe** — Multi-city trips across France, Italy, Switzerland\n**SE Asia** — Thailand, Vietnam, Cambodia combo trips\n**South Korea** — K-culture, Seoul, Jeju Island\n\nJust type any destination in our planner!",
  "destinations": "We support destinations worldwide! From popular spots like Japan, Europe, Dubai, Bali, Thailand to less common ones like Iceland, New Zealand, or Peru. Our AI adapts pricing and activities based on where you want to go.",

  // Visa
  "visa": "Our Visa Analyst AI agent automatically checks visa requirements based on your Indian passport. It tells you:\n\n• Whether a visa is required\n• Processing time\n• Required documents\n• Auto-suggests travel dates beyond processing time\n\nWe cover 50+ destinations with detailed visa intelligence!",

  // Support
  "refund": "Since Safar AI is currently free, there are no charges to refund. If you face any issues with the platform, please describe them and I'll help resolve them!",
  "bug": "I'm sorry you ran into an issue! Could you describe what happened? I'll log it for our development team. Common fixes: try clearing your browser cache or using Chrome/Edge for the best experience.",
  "not working": "I'm sorry to hear that! Here are some quick fixes:\n\n1. Clear browser cache & cookies\n2. Try Chrome or Edge (latest version)\n3. Disable browser extensions that might interfere\n4. Check your internet connection\n\nIf it still doesn't work, please describe the exact issue and I'll escalate it.",

  // Contact
  "contact": "You can reach us through:\n\n**Email**: hello@safar.ai\n**Chat**: You're already here! Ask me anything\n**Website**: safar.ai\n**Based in**: Bengaluru, India\n\nWe typically respond within a few hours during business hours.",
  "email": "You can email us at hello@safar.ai — we typically respond within a few hours. Or just ask me here — I can help with most queries right away!",
  "phone": "We don't have phone support yet, but you can reach us via:\n\nThis chat (instant)\nhello@safar.ai (within hours)\n\nI can help with most questions right here!",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase().trim();

  // Check for keyword matches
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key)) return response;
  }

  // Greeting patterns
  if (/^(hi|hello|hey|greetings|namaste|howdy)/i.test(lower)) {
    return AI_RESPONSES["hello"];
  }

  // Thank you
  if (/thank|thanks|thx/i.test(lower)) {
    return "You're welcome! Is there anything else I can help you with? Feel free to ask about destinations, visa info, pricing, or how to use Safar AI.";
  }

  // Bye
  if (/^(bye|goodbye|see you|cya)/i.test(lower)) {
    return "Goodbye! Have a wonderful journey ahead. Come back anytime you need help planning your next adventure!";
  }

  // Default fallback
  return `That's a great question! While I'm an AI assistant with pre-configured knowledge about Safar AI, I can help with:\n\n• Destination recommendations\n• Pricing & how our free service works\n• How our 7 AI agents work\n• Visa & document requirements\n• Technical support\n• Contact information\n\nCould you rephrase or pick one of these topics?`;
}

// ─── Chat Widget ───────────────────────────────────────────────────────────

function ChatWidget({ onClose }: { onClose: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm the Safar AI assistant. How can I help you today?\n\nYou can ask about destinations, pricing, visa info, how our platform works, or anything else!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getAIResponse(text);
      const aiMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: "assistant",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }, [input]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-20 right-4 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl sm:right-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-primary-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
            <Bot className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Safar AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600">Online</span>
            </div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="rounded-xl p-2 text-text-muted hover:bg-gray-100 hover:text-text-secondary transition-colors"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${msg.role === "user"
                  ? "bg-primary-500 text-white border border-primary-500"
                  : "bg-gray-50 text-text-secondary border border-border"
                }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              <p className={`mt-1.5 text-[9px] ${msg.role === "user" ? "text-white/60" : "text-text-muted"}`}>
                {isMounted ? msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-gray-50 px-4 py-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
              <span className="text-xs text-text-muted">Typing…</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {["How does it work?", "Popular destinations", "Visa info", "Pricing"].map((q) => (
            <button
              key={q}
              onClick={() => {
                setInput(q);
                setTimeout(() => {
                  const userMsg: ChatMessage = {
                    id: `u_${Date.now()}`,
                    role: "user",
                    text: q,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, userMsg]);
                  setIsTyping(true);
                  setTimeout(() => {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `a_${Date.now()}`,
                        role: "assistant",
                        text: getAIResponse(q),
                        timestamp: new Date(),
                      },
                    ]);
                    setIsTyping(false);
                  }, 800);
                  setInput("");
                }, 50);
              }}
              className="rounded-xl border border-border bg-white px-3 py-1.5 text-[11px] text-text-muted hover:bg-gray-50 hover:text-text-secondary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-gray-50 px-4 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className={`rounded-xl p-2 transition-all ${input.trim()
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "text-gray-300"
              }`}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Contact Panel ─────────────────────────────────────────────────────────

function ContactPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-20 right-4 z-50 w-[360px] overflow-hidden rounded-3xl border border-border bg-white shadow-2xl sm:right-6"
    >
      <div className="border-b border-border bg-primary-50 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
              <Headphones className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Contact Us</h3>
              <p className="text-[10px] text-text-muted">We&apos;d love to hear from you</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:bg-gray-100 hover:text-text-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <a
          href="mailto:hello@safar.ai"
          className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 hover:bg-gray-50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors">
            <Mail className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Email Us</p>
            <p className="text-xs text-text-muted">hello@safar.ai</p>
          </div>
        </a>

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <MapPin className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Office</p>
            <p className="text-xs text-text-muted">Bengaluru, Karnataka, India</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <Globe className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Website</p>
            <p className="text-xs text-text-muted">safar.ai</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-600">AI-Powered Support</p>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Our AI assistant is available 24/7 for instant help. Use the Chat Assistance
            button for immediate responses to your travel questions.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Footer Component ──────────────────────────────────────────────────────

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [activePanel, setActivePanel] = useState<"none" | "chat" | "contact">("none");

  const togglePanel = (panel: "chat" | "contact") => {
    setActivePanel((prev) => (prev === panel ? "none" : panel));
  };

  return (
    <>
      {/* Floating action buttons — always visible */}
      <AnimatePresence>
        {activePanel === "chat" && (
          <ChatWidget onClose={() => setActivePanel("none")} />
        )}
        {activePanel === "contact" && (
          <ContactPanel onClose={() => setActivePanel("none")} />
        )}
      </AnimatePresence>

      {/* FABs */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:right-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => togglePanel("contact")}
          className={`flex h-12 items-center gap-2 rounded-2xl border px-4 shadow-lg transition-all ${activePanel === "contact"
              ? "border-primary-300 bg-primary-50 text-primary-600"
              : "border-border bg-white text-text-secondary hover:text-text-primary hover:border-gray-300"
            }`}
        >
          <Headphones className="h-4.5 w-4.5" />
          <span className="text-xs font-semibold hidden sm:inline">Contact Us</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => togglePanel("chat")}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all ${activePanel === "chat"
              ? "bg-primary-600 text-white shadow-primary-500/30"
              : "bg-primary-500 text-white shadow-primary-500/20 hover:shadow-primary-500/40"
            }`}
        >
          {activePanel === "chat" ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </motion.button>
      </div>

      {/* Bottom Footer Bar */}
      <footer className="relative z-10 border-t border-border bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Brand */}
            <div className="space-y-3">
              <SafarLogo variant="full" size={32} />
              <p className="max-w-xs text-xs leading-relaxed text-text-muted">
                AI-powered travel planning with 7 specialized agents. Plan your perfect
                trip in seconds — flights, hotels, activities, restaurants, and visa docs
                all handled.
              </p>
              <p className="text-[10px] text-text-muted">
                Your AI Travel Companion
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-12">
              <div className="space-y-2.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-text-muted">
                  Support
                </p>
                <button
                  onClick={() => togglePanel("chat")}
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-primary-600 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat Assistance
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
                    AI
                  </span>
                </button>
                <button
                  onClick={() => togglePanel("contact")}
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-primary-600 transition-colors"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  Contact Us
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
                    AI
                  </span>
                </button>
                <a
                  href="mailto:hello@safar.ai"
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  hello@safar.ai
                </a>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-text-muted">
                  Platform
                </p>
                <p className="text-xs text-text-secondary">AI Trip Planner</p>
                <p className="text-xs text-text-secondary">Price Calendar</p>
                <p className="text-xs text-text-secondary">Visa Intelligence</p>
                <p className="text-xs text-text-secondary">PDF Itineraries</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
            <p className="text-[10px] text-text-muted">
              © {isMounted ? new Date().getFullYear() : "2026"} Safar AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[10px] text-text-muted">
              <a href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</a>
              <span>•</span>
              <span className="flex items-center gap-1">
                Made with
                <span className="text-red-400">♥</span>
                in India
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
