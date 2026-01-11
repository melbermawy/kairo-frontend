"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { KCard, KButton } from "@/components/ui";
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

// ============================================
// COMPONENT
// ============================================

export function OnboardingWizardClient({
  brand,
  initialOnboarding,
  initialSources,
}: OnboardingWizardClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>("basics");
  const [answers, setAnswers] = useState<Record<string, unknown>>(
    initialOnboarding.answers_json
  );
  const [sources, setSources] = useState<SourceConnection[]>(initialSources);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isCompiling, setIsCompiling] = useState(false);

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
        setSaveStatus("idle");
      }
    },
    [brand.id]
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
  }, []);

  const handleSourceUpdated = useCallback((updated: SourceConnection) => {
    setSources((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }, []);

  const handleSourceDeleted = useCallback((sourceId: string) => {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
  }, []);

  // ============================================
  // NAVIGATION
  // ============================================

  const currentStepIndex = STEPS.indexOf(currentStep);

  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  }, [currentStepIndex]);

  const goToPrevStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  }, [currentStepIndex]);

  // ============================================
  // COMPILE
  // ============================================

  const handleCompileSuccess = useCallback(() => {
    // Navigate to BrandBrain page after successful compile
    router.push(`/brands/${brand.id}/strategy`);
  }, [router, brand.id]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-kairo-fg text-[22px] font-semibold">
          Set up {brand.name}
        </h1>
        <p className="text-[13px] text-kairo-fg-muted mt-0.5">
          Help Kairo understand your brand to generate better content.
        </p>
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
                const isPastBasics = index > 0;
                const canNavigate = index === 0 || isBasicsComplete;

                return (
                  <button
                    key={step}
                    onClick={() => canNavigate && setCurrentStep(step)}
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
                  >
                    <span
                      className={`
                        flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium
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
                    {step === "tier1" && (
                      <span className="ml-auto text-[10px] text-kairo-fg-subtle">
                        Optional
                      </span>
                    )}
                    {step === "tier2" && (
                      <span className="ml-auto text-[10px] text-kairo-fg-subtle">
                        Optional
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </KCard>

          {/* Save Status */}
          <div className="px-3 py-2 text-[11px] text-kairo-fg-subtle flex items-center gap-2">
            {saveStatus === "saving" && (
              <>
                <span className="w-2 h-2 rounded-full bg-kairo-accent-500 animate-pulse" />
                Saving...
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Saved
              </>
            )}
            {saveStatus === "idle" && (
              <button
                onClick={handleExplicitSave}
                className="text-kairo-accent-400 hover:underline"
              >
                Save now
              </button>
            )}
          </div>
        </aside>

        {/* Right: Form Content */}
        <main>
          <KCard className="p-6">
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

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-kairo-border-subtle">
              <KButton
                variant="secondary"
                onClick={goToPrevStep}
                disabled={currentStepIndex === 0}
              >
                Back
              </KButton>

              <div className="flex items-center gap-3">
                {currentStep !== "compile" && (
                  <KButton onClick={goToNextStep}>
                    {currentStep === "tier2" ? "Review & Compile" : "Continue"}
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
