"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
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
    required: <AlertCircle className="h-4 w-4 text-red-500" />,
    recommended: <Info className="h-4 w-4 text-amber-500" />,
    optional: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  };

  const statusColor = {
    required: "border-red-200 bg-red-50 text-red-600",
    recommended: "border-amber-200 bg-amber-50 text-amber-600",
    optional: "border-emerald-200 bg-emerald-50 text-emerald-600",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(visa.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter out documents with empty names
  const validDocuments = visa.documents.filter((doc) => doc.name && doc.name.trim().length > 0);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 border border-red-100">
            <FileText className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Visa & Document Hub
            </h2>
            <p className="text-xs text-text-muted">
              {visa.type} • {visa.processingTime}
            </p>
          </div>
        </div>

        <div className="card rounded-2xl p-6">
          {/* Alert Banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-700">
                {visa.required ? "Visa Required" : "No Visa Required"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600">
                {visa.type}. Processing time: {visa.processingTime}.
              </p>
            </div>
          </div>

          {/* Document checklist */}
          {validDocuments.length > 0 ? (
            <div className="space-y-2">
              {validDocuments.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="mt-0.5">{statusIcon[doc.status]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">
                        {doc.name}
                      </p>
                      <span
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          statusColor[doc.status]
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">
              Document checklist will be generated based on your destination's visa requirements.
            </p>
          )}

          {/* Generate Cover Letter CTA */}
          {visa.coverLetter && (
            <div className="mt-6 border-t border-border pt-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="flex w-full min-h-13 items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-primary-50 px-6 py-3.5 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100"
              >
                <FileText className="h-4 w-4" />
                View AI-Generated Visa Cover Letter
              </motion.button>
            </div>
          )}
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border px-8 py-5">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Visa Cover Letter
                  </h3>
                  <p className="text-xs text-text-muted">
                    AI-generated • Embassy-ready
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-text-muted transition-colors hover:bg-gray-200"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-text-muted transition-colors hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="max-h-[calc(85vh-140px)] overflow-y-auto px-8 py-6">
                <div className="rounded-2xl border border-border bg-gray-50 p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-secondary">
                    {visa.coverLetter}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-border px-8 py-4">
                <p className="text-[11px] text-text-muted">
                  Replace [bracketed] placeholders with your actual details before
                  submitting
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  className="flex min-h-10 items-center gap-2 rounded-xl bg-primary-50 border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
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
