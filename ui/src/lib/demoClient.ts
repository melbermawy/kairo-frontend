// src/lib/demoClient.ts
// Unified client for accessing demo data. All reads and writes go through here
// so we can swap in a real backend later without changing page components.

import { assertDemoMode } from "@/config/demoMode";
import {
  demoBrands,
  getBrandById,
  getBrandStrategy,
  DEFAULT_BRAND_ID,
  type DemoBrand,
  type BrandStrategy,
} from "@/demo/brands";

// Re-export default brand ID for redirects
export { DEFAULT_BRAND_ID };
import {
  getOpportunitiesByBrand,
  getOpportunityById,
  type DemoOpportunity,
} from "@/demo/opportunities";
import {
  getPackagesByBrand,
  getPackageById,
  getOpportunityTitleById,
  type DemoPackage,
  type PackageStatus,
  type PackageChannel,
} from "@/demo/packages";
import {
  getAllPatterns,
  getPatternById,
  getPatternsByChannel,
  getPatternsByCategory,
  getTopPatterns,
  type DemoPattern,
  type PatternCategory,
} from "@/demo/patterns";

// Type aliases for clarity
export type BrandId = string;
export type PackageId = string;
export type OpportunityId = string;
export type PatternId = string;

/**
 * Demo client - provides a unified API for all data access.
 *
 * READS: Synchronous functions that return data from in-memory fixtures.
 * WRITES: Async functions that are no-ops in demo mode (just console.log).
 */
export const demoClient = {
  // ============================================
  // BRANDS - READS
  // ============================================

  /**
   * List all brands.
   */
  listBrands(): DemoBrand[] {
    return demoBrands;
  },

  /**
   * Get a single brand by ID.
   */
  getBrand(brandId: BrandId): DemoBrand | undefined {
    return getBrandById(brandId);
  },

  /**
   * Get brand strategy (voice, personas, pillars, guardrails).
   */
  getBrandStrategy(brandId: BrandId): BrandStrategy | undefined {
    return getBrandStrategy(brandId);
  },

  // ============================================
  // OPPORTUNITIES - READS
  // ============================================

  /**
   * List all opportunities for a brand.
   */
  listOpportunities(brandId: BrandId): DemoOpportunity[] {
    return getOpportunitiesByBrand(brandId);
  },

  /**
   * Get a single opportunity by ID.
   */
  getOpportunity(opportunityId: OpportunityId): DemoOpportunity | undefined {
    return getOpportunityById(opportunityId);
  },

  // ============================================
  // PACKAGES - READS
  // ============================================

  /**
   * List all packages for a brand.
   */
  listPackages(brandId: BrandId): DemoPackage[] {
    return getPackagesByBrand(brandId);
  },

  /**
   * Get a single package by ID.
   */
  getPackage(packageId: PackageId): DemoPackage | undefined {
    return getPackageById(packageId);
  },

  /**
   * Get the title of an opportunity by its ID (for display in package rows).
   */
  getOpportunityTitle(opportunityId: OpportunityId | null): string | null {
    return getOpportunityTitleById(opportunityId);
  },

  // ============================================
  // PATTERNS - READS
  // ============================================

  /**
   * List all patterns (not brand-specific in current implementation).
   */
  listPatterns(): DemoPattern[] {
    return getAllPatterns();
  },

  /**
   * Get a single pattern by ID.
   */
  getPattern(patternId: PatternId): DemoPattern | undefined {
    return getPatternById(patternId);
  },

  /**
   * List patterns filtered by category.
   */
  listPatternsByCategory(category: PatternCategory): DemoPattern[] {
    return getPatternsByCategory(category);
  },

  /**
   * List patterns filtered by channel (e.g., "LinkedIn", "X", "YouTube Shorts").
   */
  listPatternsByChannel(channel: string): DemoPattern[] {
    return getPatternsByChannel(channel);
  },

  /**
   * Get top recommended patterns (sorted by usage, recency).
   */
  getTopPatterns(limit = 3): DemoPattern[] {
    return getTopPatterns(limit);
  },

  // ============================================
  // OPPORTUNITIES - WRITES (stubs)
  // ============================================

  /**
   * Pin an opportunity to keep it visible at the top.
   * In demo mode, this is a no-op that logs to console.
   */
  async pinOpportunity(
    brandId: BrandId,
    opportunityId: OpportunityId
  ): Promise<void> {
    assertDemoMode("pinOpportunity");
    console.log("[demo] pinOpportunity", { brandId, opportunityId });
  },

  /**
   * Unpin a previously pinned opportunity.
   * In demo mode, this is a no-op that logs to console.
   */
  async unpinOpportunity(
    brandId: BrandId,
    opportunityId: OpportunityId
  ): Promise<void> {
    assertDemoMode("unpinOpportunity");
    console.log("[demo] unpinOpportunity", { brandId, opportunityId });
  },

  /**
   * Snooze an opportunity to hide it temporarily.
   * In demo mode, this is a no-op that logs to console.
   */
  async snoozeOpportunity(
    brandId: BrandId,
    opportunityId: OpportunityId
  ): Promise<void> {
    assertDemoMode("snoozeOpportunity");
    console.log("[demo] snoozeOpportunity", { brandId, opportunityId });
  },

  /**
   * Unsnooze a previously snoozed opportunity.
   * In demo mode, this is a no-op that logs to console.
   */
  async unsnoozeOpportunity(
    brandId: BrandId,
    opportunityId: OpportunityId
  ): Promise<void> {
    assertDemoMode("unsnoozeOpportunity");
    console.log("[demo] unsnoozeOpportunity", { brandId, opportunityId });
  },

  // ============================================
  // PACKAGES - WRITES (stubs)
  // ============================================

  /**
   * Update the status of a package (draft -> in_review -> scheduled -> published).
   * In demo mode, this is a no-op that logs to console.
   */
  async updatePackageStatus(
    brandId: BrandId,
    packageId: PackageId,
    status: PackageStatus
  ): Promise<void> {
    assertDemoMode("updatePackageStatus");
    console.log("[demo] updatePackageStatus", { brandId, packageId, status });
  },

  /**
   * Create a new package from an opportunity.
   * In demo mode, this is a no-op that logs to console and returns a fake ID.
   */
  async createPackageFromOpportunity(
    brandId: BrandId,
    opportunityId: OpportunityId
  ): Promise<string> {
    assertDemoMode("createPackageFromOpportunity");
    const fakeId = `pkg_demo_${Date.now()}`;
    console.log("[demo] createPackageFromOpportunity", {
      brandId,
      opportunityId,
      newPackageId: fakeId,
    });
    return fakeId;
  },
};

// Re-export types for convenience
export type {
  DemoBrand,
  BrandStrategy,
  DemoOpportunity,
  DemoPackage,
  PackageStatus,
  PackageChannel,
  DemoPattern,
  PatternCategory,
};
