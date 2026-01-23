/**
 * Server-side API utilities
 *
 * Phase 1: Authentication System
 *
 * These functions are for use in Server Components only.
 * They get the auth token from cookies and make authenticated API calls.
 */

import { env } from "../env";
import { getServerSession } from "../supabase/server";
import {
  BrandCoreSchema,
  BrandBootstrapResponseSchema,
  BackendSnapshotResponseSchema,
  type BrandCore,
  type BrandOnboarding,
  type SourceConnection,
  type BrandBrainOverrides,
  type BackendSnapshotResponse,
  type BrandBootstrapResponse,
} from "@/contracts";
import { TodayBoardDTOSchema, type TodayBoardDTO } from "@/contracts/backendContracts";
import { z } from "zod";

/**
 * Make an authenticated API request from a Server Component.
 */
async function serverFetch<T>(
  endpoint: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  const session = await getServerSession();
  const token = session?.access_token;

  const url = `${env.apiBaseUrl}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Don't cache authenticated requests
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  const data = await response.json();
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`[SERVER API] Validation failed for ${endpoint}:`, result.error.issues);
    throw new Error(`Response validation failed for ${endpoint}`);
  }

  return result.data;
}

// ============================================
// BRANDS
// ============================================

/**
 * List brands for the current user (server-side).
 * Use this in Server Components instead of api.listBrands().
 */
export async function listBrandsServer(): Promise<BrandCore[]> {
  return serverFetch("/api/brands", z.array(BrandCoreSchema));
}

// ============================================
// BOOTSTRAP (combined page data)
// ============================================

/**
 * Fetch bootstrap data from backend (server-side).
 */
async function fetchBootstrapServer(brandId: string): Promise<BrandBootstrapResponse> {
  return serverFetch(`/api/brands/${brandId}/bootstrap`, BrandBootstrapResponseSchema);
}

/**
 * Get latest snapshot (server-side).
 */
export async function getLatestSnapshotServer(brandId: string): Promise<BackendSnapshotResponse> {
  return serverFetch(`/api/brands/${brandId}/brandbrain/latest`, BackendSnapshotResponseSchema);
}

/**
 * Get all data needed for strategy page (server-side).
 */
export async function getStrategyBootstrapServer(brandId: string): Promise<{
  brand: BrandCore;
  snapshot: BackendSnapshotResponse | null;
  overrides: BrandBrainOverrides | null;
  hasSnapshot: boolean;
}> {
  const bootstrap = await fetchBootstrapServer(brandId);

  // If snapshot exists, fetch the full snapshot_json separately
  let snapshot: BackendSnapshotResponse | null = null;
  if (bootstrap.latest?.has_data) {
    snapshot = await getLatestSnapshotServer(brandId);
  }

  return {
    brand: bootstrap.brand,
    snapshot,
    overrides: bootstrap.overrides,
    hasSnapshot: bootstrap.latest !== null && bootstrap.latest.has_data,
  };
}

/**
 * Get all data needed for onboarding page (server-side).
 */
export async function getOnboardingBootstrapServer(brandId: string): Promise<{
  brand: BrandCore;
  onboarding: BrandOnboarding;
  sources: SourceConnection[];
}> {
  const bootstrap = await fetchBootstrapServer(brandId);

  return {
    brand: bootstrap.brand,
    onboarding: bootstrap.onboarding,
    sources: bootstrap.sources,
  };
}

// ============================================
// TODAY BOARD
// ============================================

/**
 * Get Today board for a brand (server-side).
 */
export async function getTodayBoardServer(brandId: string): Promise<TodayBoardDTO> {
  return serverFetch(`/api/brands/${brandId}/today/`, TodayBoardDTOSchema);
}
