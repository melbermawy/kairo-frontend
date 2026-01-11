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
