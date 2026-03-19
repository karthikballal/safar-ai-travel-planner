"use client";

import React from "react";
import { Check } from "lucide-react";

export interface Step {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4" aria-label="Progress">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? "bg-primary-600 text-white"
                    : isCurrent
                      ? "border-2 border-primary-600 bg-primary-50 text-primary-700"
                      : "border-2 border-gray-200 bg-white text-text-muted"
                }`}
              >
                {isCompleted ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  isCurrent ? "text-primary-700" : isCompleted ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded transition-colors ${
                  i < currentIndex ? "bg-primary-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
