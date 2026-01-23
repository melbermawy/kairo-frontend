"use client";

import { motion } from "framer-motion";

interface KProgressStep {
  id: string;
  label: string;
  isComplete?: boolean;
  isActive?: boolean;
}

interface KProgressProps {
  steps: KProgressStep[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
}

/**
 * Horizontal progress bar showing wizard steps.
 * Per deployment_prep_plan.md Phase 4: Clear progress indicator.
 */
export function KProgress({ steps, currentStep, onStepClick }: KProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const progressPercent = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="w-full">
      {/* Progress bar background */}
      <div className="relative h-1 bg-kairo-bg-elevated rounded-full overflow-hidden mb-3">
        <motion.div
          className="absolute inset-y-0 left-0 bg-kairo-accent-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = index < currentIndex;
          const isClickable = onStepClick && (isComplete || isActive);

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={`
                flex items-center gap-2 px-2 py-1 rounded-lg text-[12px]
                transition-all duration-200
                ${isClickable ? "cursor-pointer" : "cursor-default"}
                ${isActive ? "text-kairo-accent-400 font-medium" : ""}
                ${isComplete ? "text-kairo-fg hover:text-kairo-accent-400" : ""}
                ${!isActive && !isComplete ? "text-kairo-fg-subtle" : ""}
              `}
            >
              {/* Step number/check circle */}
              <span
                className={`
                  flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold
                  transition-all duration-200
                  ${isComplete ? "bg-kairo-accent-500 text-white" : ""}
                  ${isActive ? "bg-kairo-accent-500/20 text-kairo-accent-400 ring-2 ring-kairo-accent-500/30" : ""}
                  ${!isActive && !isComplete ? "bg-kairo-bg-elevated text-kairo-fg-subtle" : ""}
                `}
              >
                {isComplete ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>

              {/* Step label - show on medium+ screens */}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

KProgress.displayName = "KProgress";
