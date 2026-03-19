"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { TripData } from "@/data/mockTrip";

interface Props {
  visa: TripData["visa"];
}

export default function VisaDocHub({ visa }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusIcon = {
    required: <AlertCircle className="h-4 w-4 text-red-400" />,
    recommended: <Info className="h-4 w-4 text-amber-400" />,
    optional: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  };

  const statusColor = {
    required: "border-red-500/20 bg-red-500/5 text-red-400",
    recommended: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    optional: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(visa.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <FileText className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Visa & Document Hub
            </h2>
            <p className="text-xs text-white/40">
              {visa.type} • {visa.processingTime}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {/* Alert Banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Visa Required for France
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-200/50">
                Indian passport holders require a Schengen Type C visa. Apply at
                the VFS France center in Mumbai at least 30 days before travel.
                Processing takes approx. 15 calendar days.
              </p>
            </div>
          </div>

          {/* Document checklist */}
          <div className="space-y-2">
            {visa.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/2"
              >
                <div className="mt-0.5">{statusIcon[doc.status]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">
                      {doc.name}
                    </p>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        statusColor[doc.status]
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/35">
                    {doc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Generate Cover Letter CTA */}
          <div className="mt-6 border-t border-white/6 pt-6">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex w-full min-h-13 items-center justify-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-3.5 text-sm font-bold text-indigo-300 transition-colors hover:bg-indigo-500/15"
            >
              <FileText className="h-4 w-4" />
              View AI-Generated Visa Cover Letter
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Cover Letter Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/6 px-8 py-5">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Visa Cover Letter
                  </h3>
                  <p className="text-xs text-white/40">
                    AI-generated • Embassy-ready • Schengen-compliant
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 text-white/40 transition-colors hover:bg-white/10"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 text-white/40 transition-colors hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="max-h-[calc(85vh-140px)] overflow-y-auto px-8 py-6">
                <div className="rounded-2xl border border-white/6 bg-white/2 p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/70">
                    {visa.coverLetter}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-white/6 px-8 py-4">
                <p className="text-[11px] text-white/25">
                  Replace [bracketed] placeholders with your actual details before
                  submitting
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  className="flex min-h-10 items-center gap-2 rounded-xl bg-indigo-500/15 px-5 py-2 text-sm font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Full Letter
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
