"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { KCard, KButton, KProgress, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import type {
  BrandCore,
  BrandOnboarding,
  SourceConnection,
} from "@/contracts";
import { Tier0Form } from "./Tier0Form";
import { Tier1Form } from "./Tier1Form";
import { Tier2Form } from "./Tier2Form";
import { SourcesManager } from "./SourcesManager";
import { CompilePanel } from "./CompilePanel";

// ============================================
// TYPES
// ============================================

type WizardStep = "basics" | "sources" | "tier1" | "tier2" | "compile";

const STEPS: WizardStep[] = ["basics", "sources", "tier1", "tier2", "compile"];

const STEP_LABELS: Record<WizardStep, string> = {
  basics: "Basics",
  sources: "Sources",
  tier1: "Recommended",
  tier2: "Advanced",
  compile: "Compile",
};

interface OnboardingWizardClientProps {
  brand: BrandCore;
  initialOnboarding: BrandOnboarding;
  initialSources: SourceConnection[];
}

// Animation variants for step transitions
const stepVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 20 : -20,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -20 : 20,
    transition: { duration: 0.2, ease: "easeIn" as const },
  }),
};

// ============================================
// COMPONENT
// ============================================

export function OnboardingWizardClient({
  brand,
  initialOnboarding,
  initialSources,
}: OnboardingWizardClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>("basics");
  const [answers, setAnswers] = useState<Record<string, unknown>>(
    initialOnboarding.answers_json
  );
  const [sources, setSources] = useState<SourceConnection[]>(initialSources);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [direction, setDirection] = useState(0);

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate step completion
  const isBasicsComplete = Boolean(
    answers["tier0.what_we_do"] &&
    answers["tier0.who_for"] &&
    answers["tier0.primary_goal"] &&
    answers["tier0.cta_posture"]
  );

  const hasEnabledSources = sources.some((s) => s.is_enabled);

  const canCompile = isBasicsComplete && hasEnabledSources;

  // Progress steps for KProgress component
  const progressSteps = STEPS.map((step, index) => {
    const stepIndex = STEPS.indexOf(currentStep);
    return {
      id: step,
      label: STEP_LABELS[step],
      isComplete: index < stepIndex || (step === "basics" && isBasicsComplete) || (step === "sources" && hasEnabledSources),
      isActive: step === currentStep,
    };
  });

  // ============================================
  // AUTOSAVE
  // ============================================

  const saveOnboarding = useCallback(
    async (newAnswers: Record<string, unknown>) => {
      setSaveStatus("saving");
      try {
        // Determine tier based on filled answers
        let tier: 0 | 1 | 2 = 0;
        if (Object.keys(newAnswers).some((k) => k.startsWith("tier1."))) {
          tier = 1;
        }
        if (Object.keys(newAnswers).some((k) => k.startsWith("tier2."))) {
          tier = 2;
        }

        await api.saveOnboarding(brand.id, tier, newAnswers);
        setSaveStatus("saved");

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Failed to save onboarding:", err);
        toast.error("Failed to save changes");
        setSaveStatus("idle");
      }
    },
    [brand.id, toast]
  );

  const handleAnswerChange = useCallback(
    (key: string, value: unknown) => {
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };

        // Debounced save (600ms)
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(() => {
          saveOnboarding(next);
        }, 600);

        return next;
      });
    },
    [saveOnboarding]
  );

  // Explicit save button handler
  const handleExplicitSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveOnboarding(answers);
  }, [saveOnboarding, answers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // ============================================
  // SOURCE MANAGEMENT
  // ============================================

  const handleSourceAdded = useCallback((source: SourceConnection) => {
    setSources((prev) => [...prev, source]);
    toast.success("Source connected");
  }, [toast]);

  const handleSourceUpdated = useCallback((updated: SourceConnection) => {
    setSources((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }, []);

  const handleSourceDeleted = useCallback((sourceId: string) => {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    toast.info("Source removed");
  }, [toast]);

  // ============================================
  // NAVIGATION
  // ============================================

  const currentStepIndex = STEPS.indexOf(currentStep);

  const navigateToStep = useCallback((targetStep: WizardStep) => {
    const targetIndex = STEPS.indexOf(targetStep);
    const canNavigate = targetIndex === 0 || isBasicsComplete;

    if (canNavigate && targetStep !== currentStep) {
      setDirection(targetIndex > currentStepIndex ? 1 : -1);
      setCurrentStep(targetStep);
    }
  }, [currentStep, currentStepIndex, isBasicsComplete]);

  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setDirection(1);
      setCurrentStep(STEPS[nextIndex]);
    }
  }, [currentStepIndex]);

  const goToPrevStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setDirection(-1);
      setCurrentStep(STEPS[prevIndex]);
    }
  }, [currentStepIndex]);

  // ============================================
  // COMPILE
  // ============================================

  const handleCompileSuccess = useCallback(() => {
    toast.success("BrandBrain compiled successfully!");
    // Navigate to BrandBrain page after successful compile
    router.push(`/brands/${brand.id}/strategy`);
  }, [router, brand.id, toast]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen">
      {/* Header with Progress Bar */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-kairo-fg text-[22px] font-semibold">
              Set up {brand.name}
            </h1>
            <p className="text-[13px] text-kairo-fg-muted mt-0.5">
              Help Kairo understand your brand to generate better content.
            </p>
          </div>

          {/* Save Status Badge */}
          <div className="flex items-center gap-2 text-[11px] text-kairo-fg-subtle">
            {saveStatus === "saving" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-kairo-bg-elevated"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-kairo-accent-500 animate-pulse" />
                Saving...
              </motion.div>
            )}
            {saveStatus === "saved" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-400"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <KProgress
          steps={progressSteps}
          currentStep={currentStep}
          onStepClick={(stepId) => navigateToStep(stepId as WizardStep)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left: Steps Navigation */}
        <aside className="space-y-2">
          <KCard className="p-4">
            <nav className="space-y-1">
              {STEPS.map((step, index) => {
                const isActive = step === currentStep;
                const isComplete =
                  (step === "basics" && isBasicsComplete) ||
                  (step === "sources" && hasEnabledSources);
                const canNavigate = index === 0 || isBasicsComplete;

                return (
                  <motion.button
                    key={step}
                    onClick={() => canNavigate && navigateToStep(step)}
                    disabled={!canNavigate}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px]
                      transition-colors
                      ${
                        isActive
                          ? "bg-kairo-accent-500/10 text-kairo-accent-400 font-medium"
                          : canNavigate
                          ? "text-kairo-fg-muted hover:bg-kairo-bg-elevated hover:text-kairo-fg"
                          : "text-kairo-fg-subtle cursor-not-allowed"
                      }
                    `}
                    whileHover={canNavigate && !isActive ? { x: 2 } : {}}
                    whileTap={canNavigate ? { scale: 0.98 } : {}}
                  >
                    <span
                      className={`
                        flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium
                        transition-all duration-200
                        ${
                          isComplete
                            ? "bg-kairo-accent-500 text-white"
                            : isActive
                            ? "bg-kairo-accent-500/20 text-kairo-accent-400"
                            : "bg-kairo-bg-elevated text-kairo-fg-muted"
                        }
                      `}
                    >
                      {isComplete ? (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span>{STEP_LABELS[step]}</span>
                    {(step === "tier1" || step === "tier2") && (
                      <span className="ml-auto text-[10px] text-kairo-fg-subtle">
                        Optional
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </KCard>

          {/* Quick Tips */}
          <KCard className="p-4">
            <h3 className="text-[11px] text-kairo-fg-muted uppercase tracking-wider font-medium mb-2">
              Tips
            </h3>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[12px] text-kairo-fg-muted leading-relaxed"
              >
                {currentStep === "basics" && "Be specific about what makes your brand unique. This helps generate relevant opportunities."}
                {currentStep === "sources" && "Connect at least one source. More sources = better trend discovery."}
                {currentStep === "tier1" && "Pillars and personas help focus your content strategy. You can skip this for now."}
                {currentStep === "tier2" && "Competitors and success examples give Kairo deeper context. Optional but recommended."}
                {currentStep === "compile" && "Ready to go! Compiling creates your brand profile for opportunity generation."}
              </motion.p>
            </AnimatePresence>
          </KCard>
        </aside>

        {/* Right: Form Content */}
        <main>
          <KCard className="p-6 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {currentStep === "basics" && (
                  <Tier0Form
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                  />
                )}

                {currentStep === "sources" && (
                  <SourcesManager
                    brandId={brand.id}
                    sources={sources}
                    onSourceAdded={handleSourceAdded}
                    onSourceUpdated={handleSourceUpdated}
                    onSourceDeleted={handleSourceDeleted}
                  />
                )}

                {currentStep === "tier1" && (
                  <Tier1Form
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                  />
                )}

                {currentStep === "tier2" && (
                  <Tier2Form
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                  />
                )}

                {currentStep === "compile" && (
                  <CompilePanel
                    brandId={brand.id}
                    canCompile={canCompile}
                    isBasicsComplete={isBasicsComplete}
                    hasEnabledSources={hasEnabledSources}
                    onCompileSuccess={handleCompileSuccess}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-kairo-border-subtle">
              <KButton
                variant="secondary"
                onClick={goToPrevStep}
                disabled={currentStepIndex === 0}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </KButton>

              <div className="flex items-center gap-3">
                {currentStep !== "compile" && (
                  <KButton onClick={goToNextStep}>
                    {currentStep === "tier2" ? "Review & Compile" : "Continue"}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </KButton>
                )}
              </div>
            </div>
          </KCard>
        </main>
      </div>
    </div>
  );
}

OnboardingWizardClient.displayName = "OnboardingWizardClient";
