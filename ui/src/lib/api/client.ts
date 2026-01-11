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
