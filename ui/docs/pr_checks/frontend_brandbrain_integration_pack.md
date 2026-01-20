# Frontend BrandBrain Integration Pack

This document provides verbatim code from the kairo-frontend repo for ChatGPT review of BrandBrain integration.

---

## 0) Repo Context

**Branch:** `main`
**Commit:** `4058d2c3d6266968c1a38a68dc95ee5541c2d8fb`
**Framework:** Next.js 16.0.7 (App Router with Turbopack)
**Router Type:** App Router (`app/` directory)
**Environment Variables:** `NEXT_PUBLIC_*` prefix (standard Next.js public env vars)

---

## 1) API Client + Base URL

### 1.1 Environment Configuration

**File:** `ui/src/lib/env.ts` (lines 1-27)

```typescript
// src/lib/env.ts
// Centralized environment configuration

export type ApiMode = "mock" | "real";

export const env = {
  // API mode: mock (fixture data) or real (backend HTTP)
  apiMode: (process.env.NEXT_PUBLIC_API_MODE || "mock") as ApiMode,

  // Backend base URL (only used in real mode)
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",

  // BrandBrain dev mode (enables force refresh compile, debug tools)
  brandBrainDevMode: process.env.NEXT_PUBLIC_BRANDBRAIN_DEV_MODE === "true",

  // Feature flags
  featureLiProfilePosts: process.env.NEXT_PUBLIC_FEATURE_LI_PROFILE_POSTS === "true",
} as const;

// Type-safe check for API mode
export function isRealApiMode(): boolean {
  return env.apiMode === "real";
}

export function isMockApiMode(): boolean {
  return env.apiMode === "mock";
}
```

**Environment Variable Answers:**
- **Base URL key name:** `NEXT_PUBLIC_API_BASE_URL`
- **Default value:** `http://localhost:8000`
- **Does it default to relative paths?** No - defaults to absolute `http://localhost:8000`. No proxy assumed.
- **API mode key:** `NEXT_PUBLIC_API_MODE` (defaults to `"mock"`)

### 1.2 API Adapter (Mock/Real Switch)

**File:** `ui/src/lib/api/index.ts` (lines 1-94)

```typescript
// src/lib/api/index.ts
// API adapter that switches between mock and real backends based on env

import { env, isRealApiMode } from "../env";
import { realApi } from "./client";
import { mockBrandBrainApi } from "./mockBrandBrain";
import type {
  BrandCore,
  BrandOnboarding,
  SourceConnection,
  BrandBrainSnapshot,
  BrandBrainOverrides,
  CompileStatus,
  BrandBrainEvidence,
  OverridesPatchRequest,
} from "@/contracts";

// ============================================
// API INTERFACE
// ============================================

export interface BrandBrainApi {
  // Brands
  listBrands(): Promise<BrandCore[]>;
  getBrand(brandId: string): Promise<BrandCore>;
  createBrand(data: { name: string; website_url?: string }): Promise<BrandCore>;

  // Onboarding
  getOnboarding(brandId: string): Promise<BrandOnboarding>;
  saveOnboarding(
    brandId: string,
    tier: 0 | 1 | 2,
    answers: Record<string, unknown>
  ): Promise<BrandOnboarding>;

  // Source Connections
  listSources(brandId: string): Promise<SourceConnection[]>;
  createSource(
    brandId: string,
    data: {
      platform: string;
      capability: string;
      identifier: string;
      is_enabled?: boolean;
      settings_json?: Record<string, unknown>;
    }
  ): Promise<SourceConnection>;
  updateSource(
    sourceId: string,
    updates: Partial<{
      is_enabled: boolean;
      identifier: string;
      settings_json: Record<string, unknown>;
    }>
  ): Promise<SourceConnection>;
  deleteSource(sourceId: string): Promise<void>;

  // Compile
  triggerCompile(
    brandId: string,
    forceRefresh?: boolean
  ): Promise<{ compile_run_id: string; status: string }>;
  getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus>;

  // Snapshot
  getLatestSnapshot(brandId: string): Promise<BrandBrainSnapshot>;
  getSnapshotHistory(brandId: string): Promise<BrandBrainSnapshot[]>;

  // Overrides
  getOverrides(brandId: string): Promise<BrandBrainOverrides>;
  patchOverrides(
    brandId: string,
    patch: OverridesPatchRequest
  ): Promise<BrandBrainOverrides>;

  // Evidence
  getEvidence(evidenceId: string): Promise<BrandBrainEvidence>;
  getEvidenceBatch(evidenceIds: string[]): Promise<BrandBrainEvidence[]>;
}

// ============================================
// API SINGLETON
// ============================================

/**
 * The main API client. Uses real backend in production, mock in development.
 * Switch via NEXT_PUBLIC_API_MODE=mock|real
 */
export const api: BrandBrainApi = isRealApiMode() ? realApi : mockBrandBrainApi;

// Re-export types and errors
export * from "./client";
export { mockBrandBrainApi } from "./mockBrandBrain";
```

### 1.3 Real API Client (HTTP with Zod Validation)

**File:** `ui/src/lib/api/client.ts` (lines 1-288)

```typescript
// src/lib/api/client.ts
// Real API client with Zod validation
// Mirrors mockApi method signatures for seamless switching

import { z } from "zod";
import { env } from "../env";
import {
  BrandCoreSchema,
  BrandOnboardingSchema,
  SourceConnectionSchema,
  BrandBrainSnapshotSchema,
  BrandBrainOverridesSchema,
  CompileStatusSchema,
  BrandBrainEvidenceSchema,
  type BrandCore,
  type BrandOnboarding,
  type SourceConnection,
  type BrandBrainSnapshot,
  type BrandBrainOverrides,
  type CompileStatus,
  type BrandBrainEvidence,
  type OverridesPatchRequest,
} from "@/contracts";

// ============================================
// API ERROR TYPES
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// ============================================
// HTTP HELPERS
// ============================================

async function fetchApi<T>(
  endpoint: string,
  schema: z.ZodSchema<T>,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.apiBaseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText} - ${errorBody}`,
      response.status
    );
  }

  const data = await response.json();
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(
      `Response validation failed for ${endpoint}`,
      result.error.issues
    );
  }

  return result.data;
}

async function fetchApiNoValidation(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${env.apiBaseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText} - ${errorBody}`,
      response.status
    );
  }

  return response.json();
}

// ============================================
// REAL API CLIENT
// ============================================

export const realApi = {
  // ============================================
  // BRANDS (BrandCore for backend)
  // ============================================

  async listBrands(): Promise<BrandCore[]> {
    return fetchApi("/api/brands", z.array(BrandCoreSchema));
  },

  async getBrand(brandId: string): Promise<BrandCore> {
    return fetchApi(`/api/brands/${brandId}`, BrandCoreSchema);
  },

  async createBrand(data: { name: string; website_url?: string }): Promise<BrandCore> {
    return fetchApi("/api/brands", BrandCoreSchema, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ============================================
  // ONBOARDING
  // ============================================

  async getOnboarding(brandId: string): Promise<BrandOnboarding> {
    return fetchApi(`/api/brands/${brandId}/onboarding`, BrandOnboardingSchema);
  },

  async saveOnboarding(
    brandId: string,
    tier: 0 | 1 | 2,
    answers: Record<string, unknown>
  ): Promise<BrandOnboarding> {
    return fetchApi(`/api/brands/${brandId}/onboarding`, BrandOnboardingSchema, {
      method: "PUT",
      body: JSON.stringify({
        tier,
        answers_json: answers,
      }),
    });
  },

  // ============================================
  // SOURCE CONNECTIONS
  // ============================================

  async listSources(brandId: string): Promise<SourceConnection[]> {
    return fetchApi(`/api/brands/${brandId}/sources`, z.array(SourceConnectionSchema));
  },

  async createSource(
    brandId: string,
    data: {
      platform: string;
      capability: string;
      identifier: string;
      is_enabled?: boolean;
      settings_json?: Record<string, unknown>;
    }
  ): Promise<SourceConnection> {
    return fetchApi(`/api/brands/${brandId}/sources`, SourceConnectionSchema, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        is_enabled: data.is_enabled ?? true,
        settings_json: data.settings_json ?? {},
      }),
    });
  },

  async updateSource(
    sourceId: string,
    updates: Partial<{
      is_enabled: boolean;
      identifier: string;
      settings_json: Record<string, unknown>;
    }>
  ): Promise<SourceConnection> {
    return fetchApi(`/api/sources/${sourceId}`, SourceConnectionSchema, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteSource(sourceId: string): Promise<void> {
    await fetchApiNoValidation(`/api/sources/${sourceId}`, {
      method: "DELETE",
    });
  },

  // ============================================
  // BRANDBRAIN COMPILE
  // ============================================

  async triggerCompile(
    brandId: string,
    forceRefresh = false
  ): Promise<{ compile_run_id: string; status: string }> {
    const result = await fetchApiNoValidation(
      `/api/brands/${brandId}/brandbrain/compile`,
      {
        method: "POST",
        body: JSON.stringify({ force_refresh: forceRefresh }),
      }
    );
    return result as { compile_run_id: string; status: string };
  },

  async getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/compile/${compileRunId}`,
      CompileStatusSchema
    );
  },

  // ============================================
  // BRANDBRAIN SNAPSHOT
  // ============================================

  async getLatestSnapshot(brandId: string): Promise<BrandBrainSnapshot> {
    return fetchApi(`/api/brands/${brandId}/brandbrain/latest`, BrandBrainSnapshotSchema);
  },

  async getSnapshotHistory(brandId: string): Promise<BrandBrainSnapshot[]> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/history`,
      z.array(BrandBrainSnapshotSchema)
    );
  },

  // ============================================
  // BRANDBRAIN OVERRIDES
  // ============================================

  async getOverrides(brandId: string): Promise<BrandBrainOverrides> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/overrides`,
      BrandBrainOverridesSchema
    );
  },

  async patchOverrides(
    brandId: string,
    patch: OverridesPatchRequest
  ): Promise<BrandBrainOverrides> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/overrides`,
      BrandBrainOverridesSchema,
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      }
    );
  },

  // ============================================
  // EVIDENCE (for provenance)
  // ============================================

  async getEvidence(evidenceId: string): Promise<BrandBrainEvidence> {
    return fetchApi(`/api/evidence/${evidenceId}`, BrandBrainEvidenceSchema);
  },

  async getEvidenceBatch(evidenceIds: string[]): Promise<BrandBrainEvidence[]> {
    return fetchApi("/api/evidence/batch", z.array(BrandBrainEvidenceSchema), {
      method: "POST",
      body: JSON.stringify({ ids: evidenceIds }),
    });
  },
};
```

---

## 2) Brand Playbook + Onboarding Routes/Pages

### 2.1 Router Structure (Next.js App Router)

The app uses Next.js App Router with dynamic `[brandId]` segments:

```
ui/src/app/
├── page.tsx                                    # Root redirect
├── brands/
│   └── [brandId]/
│       ├── onboarding/page.tsx                 # Brand onboarding wizard
│       ├── strategy/page.tsx                   # Brand Playbook (BrandBrain view)
│       ├── today/page.tsx                      # Today dashboard
│       ├── patterns/page.tsx                   # Content patterns
│       ├── packages/
│       │   ├── page.tsx                        # Package list
│       │   └── [packageId]/page.tsx            # Package detail
│       └── content/concepts/new/page.tsx       # Concept builder
```

### 2.2 Onboarding Page (Server Component)

**File:** `ui/src/app/brands/[brandId]/onboarding/page.tsx` (lines 1-28)

```typescript
// app/brands/[brandId]/onboarding/page.tsx
// Server shell for onboarding wizard

import { api } from "@/lib/api";
import { OnboardingWizardClient } from "@/components/onboarding";

interface OnboardingPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { brandId } = await params;

  // Fetch initial data for SSR
  const [brand, onboarding, sources] = await Promise.all([
    api.getBrand(brandId),
    api.getOnboarding(brandId),
    api.listSources(brandId),
  ]);

  return (
    <OnboardingWizardClient
      brand={brand}
      initialOnboarding={onboarding}
      initialSources={sources}
    />
  );
}
```

### 2.3 Strategy/Playbook Page (Server Component)

**File:** `ui/src/app/brands/[brandId]/strategy/page.tsx` (lines 1-28)

```typescript
// app/brands/[brandId]/strategy/page.tsx
// BrandBrain page - snapshot viewer with overrides and provenance

import { api } from "@/lib/api";
import { BrandBrainClient } from "@/components/brandbrain";

interface StrategyPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { brandId } = await params;

  // Fetch brand and snapshot data
  const [brand, snapshot, overrides] = await Promise.all([
    api.getBrand(brandId),
    api.getLatestSnapshot(brandId).catch(() => null),
    api.getOverrides(brandId).catch(() => null),
  ]);

  return (
    <BrandBrainClient
      brand={brand}
      initialSnapshot={snapshot}
      initialOverrides={overrides}
    />
  );
}
```

### 2.4 OnboardingWizardClient (Client Component)

**File:** `ui/src/components/onboarding/OnboardingWizardClient.tsx` (lines 1-374)

```typescript
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
```

### 2.5 BrandBrainClient (Playbook View Client Component)

**File:** `ui/src/components/brandbrain/BrandBrainClient.tsx` (lines 1-419)

```typescript
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KCard, KButton } from "@/components/ui";
import { api } from "@/lib/api";
import type {
  BrandCore,
  BrandBrainSnapshot,
  BrandBrainOverrides,
  OverridesPatchRequest,
} from "@/contracts";
import { BrandBrainSection } from "./BrandBrainSection";
import { FieldEditPanel } from "./FieldEditPanel";
import { CompileStatusBadge } from "./CompileStatusBadge";

interface BrandBrainClientProps {
  brand: BrandCore;
  initialSnapshot: BrandBrainSnapshot | null;
  initialOverrides: BrandBrainOverrides | null;
}

export function BrandBrainClient({
  brand,
  initialSnapshot,
  initialOverrides,
}: BrandBrainClientProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [selectedFieldPath, setSelectedFieldPath] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate freshness
  const compiledAt = snapshot?.meta.compiled_at
    ? new Date(snapshot.meta.compiled_at)
    : null;
  const isStale = compiledAt
    ? Date.now() - compiledAt.getTime() > 24 * 60 * 60 * 1000 // 24 hours
    : true;

  // Handle compile trigger
  const handleCompile = useCallback(async () => {
    setIsCompiling(true);
    try {
      const result = await api.triggerCompile(brand.id);
      // Poll for completion
      let status = await api.getCompileStatus(brand.id, result.compile_run_id);
      while (status.status === "QUEUED" || status.status === "RUNNING") {
        await new Promise((r) => setTimeout(r, 2000));
        status = await api.getCompileStatus(brand.id, result.compile_run_id);
      }

      if (status.status === "SUCCEEDED") {
        // Refresh data
        const [newSnapshot, newOverrides] = await Promise.all([
          api.getLatestSnapshot(brand.id),
          api.getOverrides(brand.id),
        ]);
        setSnapshot(newSnapshot);
        setOverrides(newOverrides);
      }
    } catch (err) {
      console.error("Failed to compile:", err);
    } finally {
      setIsCompiling(false);
    }
  }, [brand.id]);

  // Handle override save
  const handleSaveOverride = useCallback(
    async (path: string, value: unknown, pin: boolean) => {
      setIsSaving(true);
      try {
        const patch: OverridesPatchRequest = {
          set_overrides: { [path]: value },
        };

        // Handle pinning
        const currentlyPinned = overrides?.pinned_paths.includes(path) ?? false;
        if (pin && !currentlyPinned) {
          patch.pin_paths = [path];
        } else if (!pin && currentlyPinned) {
          patch.unpin_paths = [path];
        }

        const newOverrides = await api.patchOverrides(brand.id, patch);
        setOverrides(newOverrides);

        // Refetch snapshot to get applied overrides
        const newSnapshot = await api.getLatestSnapshot(brand.id);
        setSnapshot(newSnapshot);

        setSelectedFieldPath(null);
      } catch (err) {
        console.error("Failed to save override:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [brand.id, overrides]
  );

  // Handle removing override
  const handleRemoveOverride = useCallback(
    async (path: string) => {
      setIsSaving(true);
      try {
        const patch: OverridesPatchRequest = {
          remove_overrides: [path],
          unpin_paths: [path],
        };

        const newOverrides = await api.patchOverrides(brand.id, patch);
        setOverrides(newOverrides);

        // Refetch snapshot
        const newSnapshot = await api.getLatestSnapshot(brand.id);
        setSnapshot(newSnapshot);

        setSelectedFieldPath(null);
      } catch (err) {
        console.error("Failed to remove override:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [brand.id]
  );

  // No snapshot yet - show empty state
  if (!snapshot) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-kairo-fg">Brand Playbook</h1>
          <p className="text-[13px] text-kairo-fg-muted mt-1">
            Your brand&apos;s AI-powered strategy document
          </p>
        </header>

        <KCard className="p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-kairo-accent-500/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-kairo-accent-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-[16px] font-semibold text-kairo-fg">
              No BrandBrain yet
            </h2>
            <p className="text-[13px] text-kairo-fg-muted">
              Complete onboarding and compile your brand to generate your BrandBrain.
            </p>
            <Link href={`/brands/${brand.id}/onboarding`}>
              <KButton>Start Onboarding</KButton>
            </Link>
          </div>
        </KCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-kairo-fg">Brand Playbook</h1>
          <p className="text-[13px] text-kairo-fg-muted mt-1">
            Your brand&apos;s AI-powered strategy document for {brand.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CompileStatusBadge
            compiledAt={compiledAt}
            isStale={isStale}
          />
          <Link href={`/brands/${brand.id}/onboarding`}>
            <KButton variant="secondary">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Onboarding
            </KButton>
          </Link>
          <KButton
            variant="secondary"
            onClick={handleCompile}
            disabled={isCompiling}
          >
            {isCompiling ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Compiling...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Recompile
              </>
            )}
          </KButton>
        </div>
      </header>

      {/* Main content with edit panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Sections */}
        <div className="space-y-6">
          {/* Positioning */}
          <BrandBrainSection
            title="Positioning"
            fields={[
              { path: "positioning.what_we_do", label: "What we do", node: snapshot.positioning.what_we_do },
              { path: "positioning.who_for", label: "Who we serve", node: snapshot.positioning.who_for },
              { path: "positioning.differentiators", label: "Differentiators", node: snapshot.positioning.differentiators },
              { path: "positioning.proof_types", label: "Proof types", node: snapshot.positioning.proof_types },
            ]}
            overrides={overrides}
            selectedPath={selectedFieldPath}
            onFieldClick={setSelectedFieldPath}
          />

          {/* Voice */}
          <BrandBrainSection
            title="Voice"
            fields={[
              { path: "voice.tone_tags", label: "Tone tags", node: snapshot.voice.tone_tags },
              { path: "voice.do", label: "Do", node: snapshot.voice.do },
              { path: "voice.dont", label: "Don't", node: snapshot.voice.dont },
              { path: "voice.cta_policy", label: "CTA policy", node: snapshot.voice.cta_policy },
              { path: "voice.emoji_policy", label: "Emoji policy", node: snapshot.voice.emoji_policy },
            ]}
            overrides={overrides}
            selectedPath={selectedFieldPath}
            onFieldClick={setSelectedFieldPath}
          />

          {/* Pillars */}
          <KCard className="p-5">
            <h3 className="text-[14px] font-semibold text-kairo-fg mb-4">
              Content Pillars
            </h3>
            <div className="space-y-4">
              {snapshot.pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-kairo-bg-elevated border border-kairo-border-subtle"
                >
                  <button
                    onClick={() => setSelectedFieldPath(`pillars.${index}.name`)}
                    className="text-[13px] font-medium text-kairo-fg hover:text-kairo-accent-400 transition-colors"
                  >
                    {pillar.name.override_value ?? pillar.name.value}
                  </button>
                  <p className="text-[12px] text-kairo-fg-muted mt-1">
                    {pillar.description.override_value ?? pillar.description.value}
                  </p>
                  {pillar.themes.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(pillar.themes.override_value ?? pillar.themes.value).map((theme, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-kairo-bg-card text-[10px] text-kairo-fg-muted"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </KCard>

          {/* Constraints */}
          <BrandBrainSection
            title="Constraints"
            fields={[
              { path: "constraints.taboos", label: "Taboos", node: snapshot.constraints.taboos },
              { path: "constraints.risk_boundaries", label: "Risk boundaries", node: snapshot.constraints.risk_boundaries },
            ]}
            overrides={overrides}
            selectedPath={selectedFieldPath}
            onFieldClick={setSelectedFieldPath}
          />

          {/* Platform Profiles */}
          {snapshot.platform_profiles.length > 0 && (
            <KCard className="p-5">
              <h3 className="text-[14px] font-semibold text-kairo-fg mb-4">
                Platform Profiles
              </h3>
              <div className="space-y-3">
                {snapshot.platform_profiles.map((profile, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-kairo-bg-elevated border border-kairo-border-subtle"
                  >
                    <span className="text-[12px] font-medium text-kairo-fg capitalize">
                      {profile.platform}
                    </span>
                    {profile.tone_adjustment && (
                      <p className="text-[11px] text-kairo-fg-muted mt-1">
                        {profile.tone_adjustment.override_value ?? profile.tone_adjustment.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </KCard>
          )}

          {/* Meta (read-only) */}
          <KCard className="p-5">
            <h3 className="text-[14px] font-semibold text-kairo-fg mb-4">
              Meta
            </h3>
            <div className="space-y-2 text-[12px] text-kairo-fg-muted">
              <p>
                <span className="text-kairo-fg-subtle">Compiled:</span>{" "}
                {compiledAt?.toLocaleString()}
              </p>
              <p>
                <span className="text-kairo-fg-subtle">Evidence analyzed:</span>{" "}
                {snapshot.meta.evidence_summary.total_count} items
              </p>
              {snapshot.meta.missing_inputs.length > 0 && (
                <p className="text-kairo-warning-fg">
                  Missing inputs: {snapshot.meta.missing_inputs.join(", ")}
                </p>
              )}
            </div>
          </KCard>
        </div>

        {/* Right: Edit Panel */}
        <aside className="lg:sticky lg:top-20 h-fit">
          {selectedFieldPath ? (
            <FieldEditPanel
              path={selectedFieldPath}
              snapshot={snapshot}
              overrides={overrides}
              isSaving={isSaving}
              onSave={handleSaveOverride}
              onRemoveOverride={handleRemoveOverride}
              onClose={() => setSelectedFieldPath(null)}
            />
          ) : (
            <KCard className="p-5">
              <div className="text-center py-8">
                <p className="text-[13px] text-kairo-fg-muted">
                  Click any field to view sources and edit overrides.
                </p>
              </div>
            </KCard>
          )}
        </aside>
      </div>
    </div>
  );
}

BrandBrainClient.displayName = "BrandBrainClient";
```

### 2.6 CompilePanel Component (Compile with Polling)

**File:** `ui/src/components/onboarding/CompilePanel.tsx` (lines 1-347)

```typescript
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { KButton, KCard } from "@/components/ui";
import { api } from "@/lib/api";
import { env } from "@/lib/env";
import type { CompileStatus, CompileStage } from "@/contracts";

interface CompilePanelProps {
  brandId: string;
  canCompile: boolean;
  isBasicsComplete: boolean;
  hasEnabledSources: boolean;
  onCompileSuccess: () => void;
}

const STAGE_LABELS: Record<CompileStage, string> = {
  QUEUED: "Waiting in queue",
  ENSURE_EVIDENCE: "Gathering evidence",
  NORMALIZE: "Normalizing data",
  BUNDLE: "Bundling content",
  LLM: "Analyzing with AI",
  QA: "Quality checks",
  MERGE: "Merging results",
  DONE: "Complete",
};

// Polling intervals in ms
const FAST_POLL_INTERVAL = 2000; // 2 seconds
const SLOW_POLL_INTERVAL = 5000; // 5 seconds
const FAST_POLL_DURATION = 60000; // 60 seconds
const MAX_POLL_DURATION = 300000; // 5 minutes

export function CompilePanel({
  brandId,
  canCompile,
  isBasicsComplete,
  hasEnabledSources,
  onCompileSuccess,
}: CompilePanelProps) {
  const [compileRunId, setCompileRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<CompileStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for polling control
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Poll for compile status
  const pollStatus = useCallback(async () => {
    if (!compileRunId) return;

    try {
      const newStatus = await api.getCompileStatus(brandId, compileRunId);
      setStatus(newStatus);

      // Check for terminal states
      if (newStatus.status === "SUCCEEDED") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        onCompileSuccess();
        return;
      }

      if (newStatus.status === "FAILED") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setError(newStatus.error || "Compile failed");
        return;
      }

      // Adjust polling interval based on elapsed time
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;

        if (elapsed > MAX_POLL_DURATION) {
          // Timeout
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setError("Compile timed out. Please try again.");
          return;
        }

        // Switch to slow polling after 60s
        if (elapsed > FAST_POLL_DURATION) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = setInterval(pollStatus, SLOW_POLL_INTERVAL);
          }
        }
      }
    } catch (err) {
      console.error("Failed to poll compile status:", err);
    }
  }, [brandId, compileRunId, onCompileSuccess]);

  // Start compile
  const handleStartCompile = useCallback(
    async (forceRefresh = false) => {
      setIsStarting(true);
      setError(null);

      try {
        const result = await api.triggerCompile(brandId, forceRefresh);
        setCompileRunId(result.compile_run_id);
        startTimeRef.current = Date.now();

        // Start polling
        pollIntervalRef.current = setInterval(pollStatus, FAST_POLL_INTERVAL);

        // Initial poll
        pollStatus();
      } catch (err) {
        console.error("Failed to start compile:", err);
        setError("Failed to start compile. Please try again.");
      } finally {
        setIsStarting(false);
      }
    },
    [brandId, pollStatus]
  );

  // Retry compile
  const handleRetry = useCallback(() => {
    setCompileRunId(null);
    setStatus(null);
    setError(null);
    handleStartCompile(false);
  }, [handleStartCompile]);

  // Is compiling?
  const isCompiling =
    status?.status === "QUEUED" || status?.status === "RUNNING";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-kairo-fg mb-1">
          Compile BrandBrain
        </h2>
        <p className="text-[13px] text-kairo-fg-muted">
          Process your brand information and sources to generate your BrandBrain.
        </p>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2">
        <p className="text-[12px] font-medium text-kairo-fg-muted uppercase tracking-wide">
          Requirements
        </p>
        <div className="space-y-1.5">
          <RequirementRow
            label="Basics complete"
            met={isBasicsComplete}
          />
          <RequirementRow
            label="At least one enabled source"
            met={hasEnabledSources}
          />
        </div>
      </div>

      {/* Compile status */}
      {(isCompiling || status?.status === "SUCCEEDED") && (
        <KCard className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-kairo-fg">
                {status?.status === "SUCCEEDED"
                  ? "Compile complete!"
                  : STAGE_LABELS[status?.progress.stage || "QUEUED"]}
              </span>
              <span className="text-[12px] text-kairo-fg-muted">
                {status?.progress.percent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-kairo-bg-elevated rounded-full overflow-hidden">
              <div
                className={`
                  h-full rounded-full transition-all duration-300
                  ${
                    status?.status === "SUCCEEDED"
                      ? "bg-kairo-success-fg"
                      : "bg-kairo-accent-500"
                  }
                `}
                style={{ width: `${status?.progress.percent || 0}%` }}
              />
            </div>

            {isCompiling && (
              <p className="text-[11px] text-kairo-fg-subtle">
                This may take a few minutes...
              </p>
            )}
          </div>
        </KCard>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-kairo-error-bg border border-kairo-error-fg/20">
          <p className="text-[13px] text-kairo-error-fg">{error}</p>
          <KButton
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={handleRetry}
          >
            Retry Compile
          </KButton>
        </div>
      )}

      {/* Compile buttons */}
      {!isCompiling && !status?.status && (
        <div className="space-y-3">
          <KButton
            onClick={() => handleStartCompile(false)}
            disabled={!canCompile || isStarting}
            className="w-full justify-center"
          >
            {isStarting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Starting...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Compile BrandBrain
              </>
            )}
          </KButton>

          {/* Dev mode: force refresh */}
          {env.brandBrainDevMode && (
            <button
              onClick={() => handleStartCompile(true)}
              disabled={!canCompile || isStarting}
              className="w-full text-center text-[11px] text-kairo-fg-subtle hover:text-kairo-fg-muted transition-colors"
            >
              Force refresh (dev only)
            </button>
          )}

          {!canCompile && (
            <p className="text-[12px] text-kairo-fg-subtle text-center">
              Complete the requirements above to enable compilation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for requirement rows
function RequirementRow({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`
          flex items-center justify-center w-5 h-5 rounded-full
          ${met ? "bg-kairo-success-bg" : "bg-kairo-bg-elevated"}
        `}
      >
        {met ? (
          <svg
            className="w-3 h-3 text-kairo-success-fg"
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
          <span className="w-2 h-2 rounded-full bg-kairo-fg-subtle" />
        )}
      </span>
      <span
        className={`text-[13px] ${
          met ? "text-kairo-fg" : "text-kairo-fg-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

CompilePanel.displayName = "CompilePanel";
```

---

## 3) Existing Backend Integration Points

### 3.1 BrandBrain Compile Endpoints

**File:** `ui/src/lib/api/client.ts` (lines 209-232)

```typescript
  // ============================================
  // BRANDBRAIN COMPILE
  // ============================================

  async triggerCompile(
    brandId: string,
    forceRefresh = false
  ): Promise<{ compile_run_id: string; status: string }> {
    const result = await fetchApiNoValidation(
      `/api/brands/${brandId}/brandbrain/compile`,
      {
        method: "POST",
        body: JSON.stringify({ force_refresh: forceRefresh }),
      }
    );
    return result as { compile_run_id: string; status: string };
  },

  async getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/compile/${compileRunId}`,
      CompileStatusSchema
    );
  },
```

### 3.2 BrandBrain Snapshot Endpoints

**File:** `ui/src/lib/api/client.ts` (lines 234-247)

```typescript
  // ============================================
  // BRANDBRAIN SNAPSHOT
  // ============================================

  async getLatestSnapshot(brandId: string): Promise<BrandBrainSnapshot> {
    return fetchApi(`/api/brands/${brandId}/brandbrain/latest`, BrandBrainSnapshotSchema);
  },

  async getSnapshotHistory(brandId: string): Promise<BrandBrainSnapshot[]> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/history`,
      z.array(BrandBrainSnapshotSchema)
    );
  },
```

### 3.3 BrandBrain Overrides Endpoints

**File:** `ui/src/lib/api/client.ts` (lines 249-272)

```typescript
  // ============================================
  // BRANDBRAIN OVERRIDES
  // ============================================

  async getOverrides(brandId: string): Promise<BrandBrainOverrides> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/overrides`,
      BrandBrainOverridesSchema
    );
  },

  async patchOverrides(
    brandId: string,
    patch: OverridesPatchRequest
  ): Promise<BrandBrainOverrides> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/overrides`,
      BrandBrainOverridesSchema,
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      }
    );
  },
```

### 3.4 Compile Status Type Definitions

**File:** `ui/src/contracts/brandbrain.ts` (lines 281-328)

```typescript
// ============================================
// COMPILE STATUS
// ============================================

export const CompileStageSchema = z.enum([
  "QUEUED",
  "ENSURE_EVIDENCE",
  "NORMALIZE",
  "BUNDLE",
  "LLM",
  "QA",
  "MERGE",
  "DONE",
]);

export type CompileStage = z.infer<typeof CompileStageSchema>;

export const CompileStatusValueSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export type CompileStatusValue = z.infer<typeof CompileStatusValueSchema>;

export const CompileProgressSchema = z.object({
  stage: CompileStageSchema,
  percent: z.number().min(0).max(100),
});

export const CompileStatusSchema = z.object({
  compile_run_id: z.string(),
  status: CompileStatusValueSchema,
  progress: CompileProgressSchema,
  started_at: z.string(),
  updated_at: z.string(),
  error: z.string().nullable(),
});

export type CompileStatus = z.infer<typeof CompileStatusSchema>;

// Compile request
export const CompileRequestSchema = z.object({
  force_refresh: z.boolean().optional(),
});

export type CompileRequest = z.infer<typeof CompileRequestSchema>;
```

### 3.5 Overrides Patch Request Type

**File:** `ui/src/contracts/brandbrain.ts` (lines 258-279)

```typescript
// ============================================
// BRANDBRAIN OVERRIDES
// ============================================

export const BrandBrainOverridesSchema = z.object({
  brand_id: z.string(),
  overrides_json: z.record(z.string(), z.unknown()), // field_path -> override value
  pinned_paths: z.array(z.string()),
  updated_at: z.string(),
});

export type BrandBrainOverrides = z.infer<typeof BrandBrainOverridesSchema>;

// Override patch request
export const OverridesPatchRequestSchema = z.object({
  set_overrides: z.record(z.string(), z.unknown()).optional(),
  remove_overrides: z.array(z.string()).optional(),
  pin_paths: z.array(z.string()).optional(),
  unpin_paths: z.array(z.string()).optional(),
});

export type OverridesPatchRequest = z.infer<typeof OverridesPatchRequestSchema>;
```

---

## 4) CORS / Auth / Headers Assumptions

**Result:** None found.

The API client uses plain `fetch()` with only `Content-Type: application/json` header:

```typescript
async function fetchApi<T>(
  endpoint: string,
  schema: z.ZodSchema<T>,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.apiBaseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  // ...
}
```

**No authentication, CORS, CSRF, or credential headers are used.** The frontend assumes:
- Backend is on the same origin OR has permissive CORS headers
- No authentication required (internal trial mode)

---

## 5) Proposed Wiring Plan (Minimal, Internal Trial, No Auth)

### 5.1 Current Endpoint Mapping

The frontend already has full BrandBrain endpoint support. Current real API client endpoints:

| Frontend Method | HTTP | Endpoint |
|-----------------|------|----------|
| `triggerCompile(brandId, forceRefresh)` | POST | `/api/brands/{brand_id}/brandbrain/compile` |
| `getCompileStatus(brandId, compileRunId)` | GET | `/api/brands/{brand_id}/brandbrain/compile/{run_id}` |
| `getLatestSnapshot(brandId)` | GET | `/api/brands/{brand_id}/brandbrain/latest` |
| `getSnapshotHistory(brandId)` | GET | `/api/brands/{brand_id}/brandbrain/history` |
| `getOverrides(brandId)` | GET | `/api/brands/{brand_id}/brandbrain/overrides` |
| `patchOverrides(brandId, patch)` | PATCH | `/api/brands/{brand_id}/brandbrain/overrides` |

### 5.2 Backend Endpoint Alignment

If backend uses different paths, update `ui/src/lib/api/client.ts`:

**If backend uses `/brandbrain/{brand_id}/...` instead of `/api/brands/{brand_id}/brandbrain/...`:**

```typescript
// Change from:
async triggerCompile(brandId: string, forceRefresh = false) {
  return fetchApiNoValidation(`/api/brands/${brandId}/brandbrain/compile`, {...});
}

// To:
async triggerCompile(brandId: string, forceRefresh = false) {
  return fetchApiNoValidation(`/brandbrain/${brandId}/compile`, {...});
}
```

### 5.3 Polling Behavior (Already Implemented)

**CompilePanel.tsx** already implements polling:

- **Fast poll:** 2 seconds interval for first 60 seconds
- **Slow poll:** 5 seconds interval after 60 seconds
- **Max timeout:** 5 minutes
- **Stop conditions:** `status === "SUCCEEDED"` or `status === "FAILED"`

### 5.4 Minimal Changes Required

**If backend paths match current frontend expectations:**
1. Set `NEXT_PUBLIC_API_MODE=real` in `.env.local`
2. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` (or actual backend URL)
3. No code changes needed

**If backend paths differ:**
1. Update endpoint paths in `ui/src/lib/api/client.ts`
2. Ensure Zod schemas match backend response shapes

### 5.5 Recommended .env.local Template

```bash
# API Configuration
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Optional: Enable dev tools
NEXT_PUBLIC_BRANDBRAIN_DEV_MODE=true
```

---

## Summary

### Files Included in This Pack

1. `ui/src/lib/env.ts` - Environment configuration
2. `ui/src/lib/api/index.ts` - API adapter (mock/real switch)
3. `ui/src/lib/api/client.ts` - Real API client with Zod validation
4. `ui/src/app/brands/[brandId]/onboarding/page.tsx` - Onboarding server component
5. `ui/src/app/brands/[brandId]/strategy/page.tsx` - Strategy/Playbook server component
6. `ui/src/components/onboarding/OnboardingWizardClient.tsx` - Onboarding wizard client
7. `ui/src/components/brandbrain/BrandBrainClient.tsx` - BrandBrain viewer client
8. `ui/src/components/onboarding/CompilePanel.tsx` - Compile panel with polling
9. `ui/src/contracts/brandbrain.ts` - BrandBrain type definitions

### Missing Pieces

- No `.env.example` file exists in the repository
- No explicit proxy configuration found
- No authentication layer implemented (as expected for internal trial)
