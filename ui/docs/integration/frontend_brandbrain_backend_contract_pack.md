# Frontend-Backend BrandBrain Contract Pack

**Date:** 2026-01-13
**Purpose:** Complete verbatim code reference for frontend BrandBrain integration with backend

---

## Table of Contents

1. [Environment Configuration](#1-environment-configuration)
2. [API Adapter Layer](#2-api-adapter-layer)
3. [Real API Client (BrandBrain Endpoints)](#3-real-api-client-brandbrain-endpoints)
4. [Zod Schemas (BrandBrain Only)](#4-zod-schemas-brandbrain-only)
5. [CompilePanel Polling Logic](#5-compilepanel-polling-logic)
6. [Pages Calling BrandBrain Endpoints](#6-pages-calling-brandbrain-endpoints)
7. [Endpoint Mapping Table](#7-endpoint-mapping-table)
8. [Environment Setup](#8-environment-setup)
9. [Running Locally](#9-running-locally)
10. [Network Tab Checklist](#10-network-tab-checklist)

---

## 1. Environment Configuration

**File:** `ui/src/lib/env.ts`

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

---

## 2. API Adapter Layer

**File:** `ui/src/lib/api/index.ts`

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
  CompileTriggerResponse,
  BackendSnapshotResponse,
  SnapshotHistoryResponse,
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
  ): Promise<CompileTriggerResponse>;
  getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus>;

  // Snapshot (returns backend wrapped format)
  getLatestSnapshot(brandId: string): Promise<BackendSnapshotResponse>;
  getSnapshotHistory(brandId: string): Promise<SnapshotHistoryResponse>;

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

---

## 3. Real API Client (BrandBrain Endpoints)

**File:** `ui/src/lib/api/client.ts` (BrandBrain sections only)

```typescript
// src/lib/api/client.ts
// Real API client with Zod validation

import { z } from "zod";
import { env } from "../env";
import {
  BrandCoreSchema,
  BrandOnboardingSchema,
  SourceConnectionSchema,
  BrandBrainOverridesSchema,
  CompileStatusSchema,
  CompileTriggerResponseSchema,
  BackendSnapshotResponseSchema,
  SnapshotHistoryResponseSchema,
  BrandBrainEvidenceSchema,
  type BrandCore,
  type BrandOnboarding,
  type SourceConnection,
  type BrandBrainOverrides,
  type CompileStatus,
  type CompileTriggerResponse,
  type BackendSnapshotResponse,
  type SnapshotHistoryResponse,
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

// ============================================
// BRANDBRAIN COMPILE
// ============================================

export const realApi = {
  async triggerCompile(
    brandId: string,
    forceRefresh = false
  ): Promise<CompileTriggerResponse> {
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/compile`,
      CompileTriggerResponseSchema,
      {
        method: "POST",
        body: JSON.stringify({ force_refresh: forceRefresh }),
      }
    );
  },

  async getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus> {
    // FIXED: Backend path includes /status suffix
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/compile/${compileRunId}/status`,
      CompileStatusSchema
    );
  },

  // ============================================
  // BRANDBRAIN SNAPSHOT
  // ============================================

  async getLatestSnapshot(brandId: string): Promise<BackendSnapshotResponse> {
    // Backend returns wrapped format: { snapshot_id, brand_id, snapshot_json, created_at }
    return fetchApi(`/api/brands/${brandId}/brandbrain/latest`, BackendSnapshotResponseSchema);
  },

  async getSnapshotHistory(brandId: string): Promise<SnapshotHistoryResponse> {
    // Backend returns paginated: { snapshots: [...], page, page_size, total }
    return fetchApi(
      `/api/brands/${brandId}/brandbrain/history`,
      SnapshotHistoryResponseSchema
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
};
```

---

## 4. Zod Schemas (BrandBrain Only)

**File:** `ui/src/contracts/brandbrain.ts` (BrandBrain schemas only)

### 4.1 Compile Status Schemas

```typescript
// Backend status values: PENDING | RUNNING | SUCCEEDED | FAILED
export const CompileStatusValueSchema = z.enum([
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export type CompileStatusValue = z.infer<typeof CompileStatusValueSchema>;

// Backend progress shape: { stage?, sources_completed, sources_total }
export const CompileProgressSchema = z.object({
  stage: z.string().optional(),
  sources_completed: z.number(),
  sources_total: z.number(),
});

export type CompileProgress = z.infer<typeof CompileProgressSchema>;

// Evidence status (returned in compile status responses)
export const EvidenceStatusSchema = z.object({
  total: z.number().optional(),
  completed: z.number().optional(),
  failed: z.number().optional(),
}).passthrough();

// Backend compile status response (GET /compile/{id}/status)
// Shape varies by status:
// - PENDING/RUNNING: { compile_run_id, status, progress }
// - SUCCEEDED: { compile_run_id, status, evidence_status, snapshot }
// - FAILED: { compile_run_id, status, error, evidence_status }
export const CompileStatusSchema = z.object({
  compile_run_id: z.string(),
  status: CompileStatusValueSchema,
  progress: CompileProgressSchema.optional(),
  evidence_status: EvidenceStatusSchema.optional(),
  snapshot: z.object({
    snapshot_id: z.string(),
    created_at: z.string(),
    snapshot_json: z.record(z.string(), z.unknown()),
  }).optional(),
  error: z.string().optional(),
});

export type CompileStatus = z.infer<typeof CompileStatusSchema>;
```

### 4.2 Compile Trigger Response Schema

```typescript
// Compile trigger response (POST /compile)
// 202 kickoff: { compile_run_id, status: "PENDING"|"QUEUED", poll_url }
// 200 short-circuit: { compile_run_id, status: "UNCHANGED", snapshot: {...} }
export const CompileTriggerResponseSchema = z.object({
  compile_run_id: z.string(),
  status: z.string(), // "PENDING" | "QUEUED" | "UNCHANGED"
  poll_url: z.string().optional(),
  snapshot: z.object({
    snapshot_id: z.string(),
    brand_id: z.string(),
    created_at: z.string(),
    snapshot_json: z.record(z.string(), z.unknown()),
  }).optional(),
});

export type CompileTriggerResponse = z.infer<typeof CompileTriggerResponseSchema>;
```

### 4.3 Backend Snapshot Response Schema (Wrapped Format)

```typescript
// Backend returns snapshot_json as a wrapper around the actual snapshot content
export const BackendSnapshotResponseSchema = z.object({
  snapshot_id: z.string(),
  brand_id: z.string(),
  snapshot_json: z.record(z.string(), z.unknown()), // contains the actual playbook content
  created_at: z.string(),
  compile_run_id: z.string().optional(),
});

export type BackendSnapshotResponse = z.infer<typeof BackendSnapshotResponseSchema>;
```

### 4.4 Snapshot History Response Schema (Paginated)

```typescript
export const SnapshotHistoryItemSchema = z.object({
  snapshot_id: z.string(),
  created_at: z.string(),
  diff_summary: z.record(z.string(), z.unknown()).optional(),
});

export type SnapshotHistoryItem = z.infer<typeof SnapshotHistoryItemSchema>;

export const SnapshotHistoryResponseSchema = z.object({
  snapshots: z.array(SnapshotHistoryItemSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
});

export type SnapshotHistoryResponse = z.infer<typeof SnapshotHistoryResponseSchema>;
```

### 4.5 Overrides Schemas

```typescript
export const BrandBrainOverridesSchema = z.object({
  brand_id: z.string(),
  overrides_json: z.record(z.string(), z.unknown()), // field_path -> override value
  pinned_paths: z.array(z.string()),
  updated_at: z.string().nullable(), // can be null if never updated
});

export type BrandBrainOverrides = z.infer<typeof BrandBrainOverridesSchema>;

// Override patch request - matches backend semantics:
// - overrides_json merges; null value deletes a key
// - pinned_paths replaces entire list
export const OverridesPatchRequestSchema = z.object({
  overrides_json: z.record(z.string(), z.unknown()).optional(), // path: value | null (null deletes)
  pinned_paths: z.array(z.string()).optional(), // replaces entire list
});

export type OverridesPatchRequest = z.infer<typeof OverridesPatchRequestSchema>;
```

### 4.6 Snapshot Transformation Helper

```typescript
/**
 * Transform backend snapshot response to frontend BrandBrainSnapshot format.
 * Backend returns: { snapshot_id, brand_id, snapshot_json: {...}, created_at }
 * Frontend expects: { id, brand_id, version, positioning, voice, ... meta: { compiled_at } }
 *
 * The snapshot_json from backend contains the actual playbook content.
 * We extract it and add meta information from the wrapper.
 */
export function transformBackendSnapshot(
  response: BackendSnapshotResponse
): BrandBrainSnapshot | null {
  if (!response?.snapshot_json) return null;

  const content = response.snapshot_json;

  // Build meta from wrapper + content
  const meta = {
    compiled_at: response.created_at,
    evidence_summary: (content.meta as Record<string, unknown>)?.evidence_summary ?? {
      total_count: 0,
      by_platform: {},
    },
    missing_inputs: (content.meta as Record<string, unknown>)?.missing_inputs ?? [],
  };

  // Build the snapshot, using content fields with fallbacks
  const snapshot: BrandBrainSnapshot = {
    id: response.snapshot_id,
    brand_id: response.brand_id,
    version: (content.version as number) ?? 1,
    positioning: content.positioning as BrandBrainSnapshot["positioning"],
    voice: content.voice as BrandBrainSnapshot["voice"],
    pillars: (content.pillars as BrandBrainSnapshot["pillars"]) ?? [],
    constraints: content.constraints as BrandBrainSnapshot["constraints"],
    platform_profiles: (content.platform_profiles as BrandBrainSnapshot["platform_profiles"]) ?? [],
    examples: (content.examples as BrandBrainSnapshot["examples"]) ?? {
      canonical_evidence: [],
      user_examples: [],
    },
    meta: meta as BrandBrainSnapshot["meta"],
  };

  // Validate the result
  const result = BrandBrainSnapshotSchema.safeParse(snapshot);
  if (!result.success) {
    console.warn("Snapshot transformation validation failed:", result.error.issues);
    // Return the snapshot anyway for graceful degradation
    return snapshot;
  }

  return result.data;
}
```

---

## 5. CompilePanel Polling Logic

**File:** `ui/src/components/onboarding/CompilePanel.tsx`

### Key Helper Functions

```typescript
// Helper to compute percent from sources_completed/sources_total
function computeProgress(status: CompileStatus | null): number {
  if (!status?.progress) return 0;
  const { sources_completed, sources_total } = status.progress;
  if (sources_total === 0) return 0;
  return Math.round((sources_completed / sources_total) * 100);
}

// Helper to get stage label
function getStageLabel(status: CompileStatus | null): string {
  if (!status) return "Starting...";
  if (status.status === "SUCCEEDED") return "Complete!";
  const stage = status.progress?.stage || "queued";
  return STAGE_LABELS[stage] || `Processing: ${stage}`;
}
```

### Polling Constants

```typescript
// Polling intervals in ms
const FAST_POLL_INTERVAL = 2000; // 2 seconds
const SLOW_POLL_INTERVAL = 5000; // 5 seconds
const FAST_POLL_DURATION = 60000; // 60 seconds
const MAX_POLL_DURATION = 300000; // 5 minutes
```

### Polling Implementation

```typescript
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
```

### Start Compile with UNCHANGED Handling

```typescript
// Start compile
const handleStartCompile = useCallback(
  async (forceRefresh = false) => {
    setIsStarting(true);
    setError(null);

    try {
      const result = await api.triggerCompile(brandId, forceRefresh);

      // Handle "UNCHANGED" short-circuit - backend returns existing snapshot
      if (result.status === "UNCHANGED") {
        // Snapshot already exists and is up-to-date
        onCompileSuccess();
        return;
      }

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
  [brandId, pollStatus, onCompileSuccess]
);
```

### isCompiling Check

```typescript
// Is compiling? (PENDING or RUNNING are the in-progress states)
const isCompiling =
  status?.status === "PENDING" || status?.status === "RUNNING";
```

---

## 6. Pages Calling BrandBrain Endpoints

### 6.1 Strategy Page (BrandBrain Viewer)

**File:** `ui/src/app/brands/[brandId]/strategy/page.tsx`

```typescript
// app/brands/[brandId]/strategy/page.tsx
// BrandBrain page - snapshot viewer with overrides and provenance

import { api } from "@/lib/api";
import { BrandBrainClient } from "@/components/brandbrain";
import { transformBackendSnapshot } from "@/contracts";

interface StrategyPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { brandId } = await params;

  // Fetch brand and snapshot data
  const [brand, backendSnapshot, overrides] = await Promise.all([
    api.getBrand(brandId),
    api.getLatestSnapshot(brandId).catch(() => null),
    api.getOverrides(brandId).catch(() => null),
  ]);

  // Transform backend snapshot format to frontend format
  const snapshot = backendSnapshot ? transformBackendSnapshot(backendSnapshot) : null;

  return (
    <BrandBrainClient
      brand={brand}
      initialSnapshot={snapshot}
      initialOverrides={overrides}
    />
  );
}
```

**Endpoints called:**
- `GET /api/brands/{brandId}` - Get brand
- `GET /api/brands/{brandId}/brandbrain/latest` - Get latest snapshot
- `GET /api/brands/{brandId}/brandbrain/overrides` - Get overrides

### 6.2 Concept Builder Page

**File:** `ui/src/app/brands/[brandId]/content/concepts/new/page.tsx`

```typescript
// app/brands/[brandId]/content/concepts/new/page.tsx
// Concept Builder page - bridge between opportunity and package creation

import { mockApi } from "@/lib/mockApi";
import { api } from "@/lib/api";
import { transformBackendSnapshot } from "@/contracts";
import { ConceptBuilderClient } from "./ConceptBuilderClient";

interface ConceptBuilderPageProps {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ opportunityId?: string }>;
}

export default async function ConceptBuilderPage({
  params,
  searchParams,
}: ConceptBuilderPageProps) {
  const { brandId } = await params;
  const { opportunityId } = await searchParams;

  // Fetch brand
  const brand = mockApi.getBrand(brandId);

  // Fetch opportunity if provided
  let opportunity = null;
  if (opportunityId) {
    try {
      opportunity = mockApi.getOpportunity(brandId, opportunityId);
    } catch {
      // Opportunity not found, proceed without it
    }
  }

  // Fetch BrandBrain snapshot for guardrails (if available)
  let snapshot = null;
  try {
    const backendSnapshot = await api.getLatestSnapshot(brandId);
    snapshot = transformBackendSnapshot(backendSnapshot);
  } catch {
    // No snapshot available
  }

  return (
    <ConceptBuilderClient
      brand={brand}
      opportunity={opportunity}
      snapshot={snapshot}
    />
  );
}
```

**Endpoints called:**
- `GET /api/brands/{brandId}/brandbrain/latest` - Get latest snapshot

---

## 7. Endpoint Mapping Table

| Action | Method | Frontend Path | Request Body | Response Schema | Validation Location |
|--------|--------|---------------|--------------|-----------------|---------------------|
| **Trigger compile** | POST | `/api/brands/{id}/brandbrain/compile` | `{ force_refresh?: boolean }` | `CompileTriggerResponseSchema` | `client.ts:223-231` |
| **Get compile status** | GET | `/api/brands/{id}/brandbrain/compile/{run_id}/status` | - | `CompileStatusSchema` | `client.ts:233-239` |
| **Get latest snapshot** | GET | `/api/brands/{id}/brandbrain/latest` | - | `BackendSnapshotResponseSchema` | `client.ts:245-248` |
| **Get snapshot history** | GET | `/api/brands/{id}/brandbrain/history` | - | `SnapshotHistoryResponseSchema` | `client.ts:250-256` |
| **Get overrides** | GET | `/api/brands/{id}/brandbrain/overrides` | - | `BrandBrainOverridesSchema` | `client.ts:262-266` |
| **Patch overrides** | PATCH | `/api/brands/{id}/brandbrain/overrides` | `{ overrides_json?, pinned_paths? }` | `BrandBrainOverridesSchema` | `client.ts:269-281` |

### Key Contract Notes

1. **Compile Status Path**: Must include `/status` suffix:
   - WRONG: `/compile/{run_id}`
   - CORRECT: `/compile/{run_id}/status`

2. **Status Enum**: Backend uses `PENDING`, not `QUEUED`:
   - Values: `PENDING | RUNNING | SUCCEEDED | FAILED`

3. **Progress Shape**: Backend uses source counts, not percent:
   ```json
   { "stage": "evidence_gathering", "sources_completed": 3, "sources_total": 5 }
   ```

4. **Snapshot Response**: Backend wraps content in `snapshot_json`:
   ```json
   {
     "snapshot_id": "snap_xxx",
     "brand_id": "brand_xxx",
     "snapshot_json": { /* actual playbook content */ },
     "created_at": "2026-01-13T..."
   }
   ```

5. **Overrides PATCH Semantics**:
   - `overrides_json`: Merges with existing; `null` value deletes key
   - `pinned_paths`: Replaces entire list (not additive)

6. **History Response**: Paginated format:
   ```json
   {
     "snapshots": [...],
     "page": 1,
     "page_size": 20,
     "total": 5
   }
   ```

---

## 8. Environment Setup

### `.env.local` for Real Backend Mode

```bash
# API mode: "mock" (default) or "real" for backend connection
NEXT_PUBLIC_API_MODE=real

# Backend base URL (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Optional: Enable dev-only features like force refresh
NEXT_PUBLIC_BRANDBRAIN_DEV_MODE=true
```

### `.env.local` for Mock Mode (Default)

```bash
# Mock mode - uses fixture data, no backend required
NEXT_PUBLIC_API_MODE=mock

# These are ignored in mock mode but can be set
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BRANDBRAIN_DEV_MODE=true
```

---

## 9. Running Locally

### With Mock Data (No Backend Required)

```bash
cd ui
npm install
npm run dev
```

Open: http://localhost:3000

### With Real Backend

```bash
# Terminal 1: Start backend (port 8000)
cd backend
python -m uvicorn main:app --reload

# Terminal 2: Start frontend in real mode
cd ui
NEXT_PUBLIC_API_MODE=real NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev
```

Or create `.env.local` and run:

```bash
cd ui
npm run dev
```

---

## 10. Network Tab Checklist

Use this checklist to verify frontend-backend integration for the **Onboarding → Compile → Latest** flow.

### Pre-requisites
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running with `NEXT_PUBLIC_API_MODE=real`
- [ ] Have a brand ID ready (or create one)

### Flow: Onboarding → Compile → View Snapshot

#### Step 1: Navigate to Onboarding
**URL:** `/brands/{brandId}/onboarding`

| Check | Request | Expected |
|-------|---------|----------|
| [ ] | `GET /api/brands/{brandId}` | 200, brand object |
| [ ] | `GET /api/brands/{brandId}/onboarding` | 200, onboarding data |
| [ ] | `GET /api/brands/{brandId}/sources` | 200, array of sources |

#### Step 2: Save Onboarding Answers
**Action:** Fill in tier 0 basics and blur/submit

| Check | Request | Expected |
|-------|---------|----------|
| [ ] | `PUT /api/brands/{brandId}/onboarding` | 200, updated onboarding |
| [ ] | Request body | `{ "tier": 0, "answers_json": {...} }` |

#### Step 3: Trigger Compile
**Action:** Click "Compile BrandBrain" button

| Check | Request | Expected |
|-------|---------|----------|
| [ ] | `POST /api/brands/{brandId}/brandbrain/compile` | 200 or 202 |
| [ ] | Request body | `{ "force_refresh": false }` |
| [ ] | Response has `compile_run_id` | String like `compile_xxx` |
| [ ] | Response `status` | `"PENDING"` or `"UNCHANGED"` |

**If status is `"UNCHANGED"`:**
- [ ] Response includes `snapshot` object
- [ ] UI should short-circuit to success

#### Step 4: Poll Compile Status
**Automatic polling every 2s**

| Check | Request | Expected |
|-------|---------|----------|
| [ ] | `GET /api/brands/{brandId}/brandbrain/compile/{run_id}/status` | 200 |
| [ ] | Path includes `/status` suffix | YES |
| [ ] | Response `status` | `"PENDING"` → `"RUNNING"` → `"SUCCEEDED"` |
| [ ] | Response `progress` | `{ sources_completed: N, sources_total: M }` |

**When status is `"SUCCEEDED"`:**
- [ ] Response includes `snapshot` object
- [ ] Polling stops

#### Step 5: View Strategy Page
**URL:** `/brands/{brandId}/strategy`

| Check | Request | Expected |
|-------|---------|----------|
| [ ] | `GET /api/brands/{brandId}` | 200, brand object |
| [ ] | `GET /api/brands/{brandId}/brandbrain/latest` | 200, wrapped snapshot |
| [ ] | Response format | `{ snapshot_id, brand_id, snapshot_json: {...}, created_at }` |
| [ ] | `GET /api/brands/{brandId}/brandbrain/overrides` | 200, overrides object |

#### Step 6: Edit Override
**Action:** Click a field, edit value, save

| Check | Request | Expected |
|-------|---------|----------|
| [ ] | `PATCH /api/brands/{brandId}/brandbrain/overrides` | 200 |
| [ ] | Request body | `{ "overrides_json": {"path": "value"}, "pinned_paths": [...] }` |
| [ ] | Response `overrides_json` | Contains new override |

### Error Scenarios to Test

| Scenario | Expected Behavior |
|----------|-------------------|
| Compile timeout (5 min) | Error message, retry button |
| Compile failure | Error message with `status.error`, retry button |
| No snapshot exists | Empty state with "Start Onboarding" link |
| Backend unavailable | API error handling, user-friendly message |

---

## Summary

This document provides the complete verbatim code reference for BrandBrain frontend-backend integration:

1. **Environment**: `env.ts` controls mock vs real mode
2. **Adapter**: `api/index.ts` switches between mock and real clients
3. **Client**: `client.ts` implements HTTP calls with Zod validation
4. **Contracts**: `brandbrain.ts` defines schemas matching backend contract
5. **Transform**: `transformBackendSnapshot()` bridges wrapped format
6. **Polling**: `CompilePanel.tsx` handles compile status polling
7. **Pages**: Strategy and Concept Builder pages fetch BrandBrain data

All schemas and paths have been aligned with the backend contract as of 2026-01-13.
