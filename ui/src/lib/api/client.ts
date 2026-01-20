// src/lib/api/client.ts
// Real API client with Zod validation
// Mirrors mockApi method signatures for seamless switching

import { z } from "zod";
import { env, logApiBaseOnce } from "../env";
import { timing } from "../debug/timing";
import { diagnostics } from "../debug/diagnostics";
import {
  BrandCoreSchema,
  BrandOnboardingSchema,
  SourceConnectionSchema,
  BrandBrainSnapshotSchema,
  BrandBrainOverridesSchema,
  CompileStatusSchema,
  CompileTriggerResponseSchema,
  BackendSnapshotResponseSchema,
  SnapshotHistoryResponseSchema,
  BrandBrainEvidenceSchema,
  BrandBootstrapResponseSchema,
  type BrandCore,
  type BrandOnboarding,
  type SourceConnection,
  type BrandBrainSnapshot,
  type BrandBrainOverrides,
  type CompileStatus,
  type CompileTriggerResponse,
  type BackendSnapshotResponse,
  type SnapshotHistoryResponse,
  type BrandBrainEvidence,
  type OverridesPatchRequest,
  type BrandBootstrapResponse,
} from "@/contracts";

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_TIMEOUT_MS = 15000; // 15 seconds

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

export class ApiTimeoutError extends Error {
  constructor(
    message: string,
    public endpoint: string,
    public timeoutMs: number
  ) {
    super(message);
    this.name = "ApiTimeoutError";
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
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  // Log API base URL once on first request
  logApiBaseOnce();

  const url = `${env.apiBaseUrl}${endpoint}`;
  const method = options.method || "GET";
  const startTime = Date.now();

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  timing.logApiStart(method, url);
  diagnostics.trackRequestStart(url);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      timing.logApiEnd(method, url, duration, response.status);
      diagnostics.trackRequestEnd(url, duration, errorBody.length);
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText} - ${errorBody}`,
        response.status
      );
    }

    const text = await response.text();
    const payloadBytes = text.length;
    timing.logApiEnd(method, url, duration, response.status);
    diagnostics.trackRequestEnd(url, duration, payloadBytes);

    const data = JSON.parse(text);
    const result = schema.safeParse(data);

    if (!result.success) {
      // Log validation issues AND raw body (first 2KB) for debugging
      console.error(`[VALIDATION] Failed for ${endpoint}:`);
      console.error(`[VALIDATION] Status: ${response.status}`);
      console.error(`[VALIDATION] Raw body (first 2KB): ${text.slice(0, 2048)}`);
      console.error(`[VALIDATION] Issues:`, JSON.stringify(result.error.issues, null, 2));
      throw new ValidationError(
        `Response validation failed for ${endpoint}`,
        result.error.issues
      );
    }

    return result.data;
  } catch (err) {
    const duration = Date.now() - startTime;

    if (err instanceof Error && err.name === "AbortError") {
      timing.logApiEnd(method, url, duration, "timeout");
      throw new ApiTimeoutError(
        `Request to ${endpoint} timed out after ${timeoutMs}ms`,
        endpoint,
        timeoutMs
      );
    }

    // Re-throw ApiError and ValidationError as-is
    if (err instanceof ApiError || err instanceof ValidationError) {
      throw err;
    }

    timing.logApiEnd(method, url, duration, "error");
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchApiNoValidation(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<unknown> {
  // Log API base URL once on first request
  logApiBaseOnce();

  const url = `${env.apiBaseUrl}${endpoint}`;
  const method = options.method || "GET";
  const startTime = Date.now();

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  timing.logApiStart(method, url);
  diagnostics.trackRequestStart(url);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      timing.logApiEnd(method, url, duration, response.status);
      diagnostics.trackRequestEnd(url, duration, errorBody.length);
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText} - ${errorBody}`,
        response.status
      );
    }

    const text = await response.text();
    const payloadBytes = text.length;
    timing.logApiEnd(method, url, duration, response.status);
    diagnostics.trackRequestEnd(url, duration, payloadBytes);

    return JSON.parse(text);
  } catch (err) {
    const duration = Date.now() - startTime;

    if (err instanceof Error && err.name === "AbortError") {
      timing.logApiEnd(method, url, duration, "timeout");
      throw new ApiTimeoutError(
        `Request to ${endpoint} timed out after ${timeoutMs}ms`,
        endpoint,
        timeoutMs
      );
    }

    if (err instanceof ApiError) {
      throw err;
    }

    timing.logApiEnd(method, url, duration, "error");
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
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

  // ============================================
  // BOOTSTRAP (single-request page data)
  // ============================================

  /**
   * Fetch bootstrap data from backend.
   * Single request: GET /api/brands/:id/bootstrap
   */
  async _fetchBootstrap(brandId: string): Promise<BrandBootstrapResponse> {
    const startTime = Date.now();
    const result = await fetchApi(
      `/api/brands/${brandId}/bootstrap`,
      BrandBootstrapResponseSchema
    );
    const duration = Date.now() - startTime;

    // Log bootstrap performance
    console.log(
      `[BOOTSTRAP] GET /api/brands/${brandId}/bootstrap ms=${duration}`
    );

    return result;
  },

  /**
   * Get all data needed for strategy page in one request.
   * Uses backend bootstrap endpoint: GET /api/brands/:id/bootstrap
   *
   * Note: bootstrap.latest is lightweight (no snapshot_json).
   * For full snapshot content, we need a separate fetch if hasSnapshot is true.
   */
  async getStrategyBootstrap(brandId: string): Promise<{
    brand: BrandCore;
    snapshot: BackendSnapshotResponse | null;
    overrides: BrandBrainOverrides | null;
    hasSnapshot: boolean;
  }> {
    const bootstrap = await this._fetchBootstrap(brandId);

    // If snapshot exists, fetch the full snapshot_json separately
    // (bootstrap.latest only has snapshot_id, created_at, has_data)
    let snapshot: BackendSnapshotResponse | null = null;
    if (bootstrap.latest?.has_data) {
      snapshot = await this.getLatestSnapshot(brandId);
    }

    return {
      brand: bootstrap.brand,
      snapshot,
      overrides: bootstrap.overrides,
      hasSnapshot: bootstrap.latest !== null && bootstrap.latest.has_data,
    };
  },

  /**
   * Get all data needed for onboarding page in one request.
   * Uses backend bootstrap endpoint: GET /api/brands/:id/bootstrap
   */
  async getOnboardingBootstrap(brandId: string): Promise<{
    brand: BrandCore;
    onboarding: BrandOnboarding;
    sources: SourceConnection[];
  }> {
    const bootstrap = await this._fetchBootstrap(brandId);

    return {
      brand: bootstrap.brand,
      onboarding: bootstrap.onboarding,
      sources: bootstrap.sources,
    };
  },

  /**
   * Check if snapshot exists without fetching full content.
   * Uses bootstrap endpoint for lightweight check.
   */
  async hasSnapshot(brandId: string): Promise<boolean> {
    const bootstrap = await this._fetchBootstrap(brandId);
    return bootstrap.latest !== null && bootstrap.latest.has_data;
  },

  // ============================================
  // TODAY BOARD (Opportunities v2)
  // Phase 3: GET + Regenerate with polling
  // ============================================

  async getTodayBoard(brandId: string): Promise<import("@/contracts/backendContracts").TodayBoardDTO> {
    const { TodayBoardDTOSchema } = await import("@/contracts/backendContracts");
    return fetchApi(`/api/brands/${brandId}/today/`, TodayBoardDTOSchema);
  },

  /**
   * Trigger regeneration of the Today board.
   * Returns job_id for polling GET /today until terminal state.
   */
  async triggerRegenerate(brandId: string): Promise<import("@/contracts/backendContracts").RegenerateResponseDTO> {
    const { RegenerateResponseDTOSchema } = await import("@/contracts/backendContracts");
    return fetchApi(
      `/api/brands/${brandId}/today/regenerate/`,
      RegenerateResponseDTOSchema,
      { method: "POST" }
    );
  },
};
