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
// BOOTSTRAP RETURN TYPES
// ============================================

/**
 * Return type for strategy page bootstrap.
 * Backend: GET /api/brands/{id}/bootstrap
 *
 * Note: For strategy page, if hasSnapshot is true, getStrategyBootstrap
 * also fetches the full snapshot (2 requests). Onboarding only needs 1 request.
 */
export interface StrategyBootstrap {
  brand: BrandCore;
  snapshot: BackendSnapshotResponse | null;
  overrides: BrandBrainOverrides | null;
  hasSnapshot: boolean;
}

/**
 * Return type for onboarding page bootstrap.
 * Backend: GET /api/brands/{id}/bootstrap (single request)
 */
export interface OnboardingBootstrap {
  brand: BrandCore;
  onboarding: BrandOnboarding;
  sources: SourceConnection[];
}

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

  // Bootstrap (single-request page data)
  // These methods combine multiple fetches. If backend supports native bootstrap
  // endpoint, it uses that; otherwise falls back to parallel fetches.
  getStrategyBootstrap(brandId: string): Promise<StrategyBootstrap>;
  getOnboardingBootstrap(brandId: string): Promise<OnboardingBootstrap>;

  // Check if snapshot exists without fetching full content (lightweight)
  hasSnapshot(brandId: string): Promise<boolean>;
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
