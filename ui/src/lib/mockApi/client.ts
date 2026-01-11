// src/lib/mockApi/client.ts
// Mock API client - single entry point for all data access
// Validates all outputs with zod before returning

import {
  wendysBrand,
  wendysEvidence,
  wendysOpportunities,
  wendysPackages,
  wendysPatterns,
  DEFAULT_BRAND_ID,
} from "@/fixtures";

import {
  BrandSchema,
  OpportunitySchema,
  OpportunityWithEvidenceSchema,
  ContentPackageSchema,
  ContentPackageWithEvidenceSchema,
  PatternSchema,
  EvidenceItemSchema,
  validateOrThrow,
  type Brand,
  type Opportunity,
  type OpportunityWithEvidence,
  type ContentPackage,
  type ContentPackageWithEvidence,
  type Pattern,
  type EvidenceItem,
  type PatternCategory,
} from "@/contracts";

import { NotFoundError } from "./errors";
import { z } from "zod";

// ============================================
// INTERNAL DATA STORE
// Build mutable copies from fixtures
// ============================================

const brands: Brand[] = [
  // Convert wendysBrand to match Brand schema
  {
    id: wendysBrand.id,
    slug: wendysBrand.slug,
    name: wendysBrand.name,
    vertical: wendysBrand.vertical,
    voice_traits: [...wendysBrand.voice_traits],
    pillars: [...wendysBrand.pillars],
    personas: [...wendysBrand.personas],
    guardrails: {
      do: [...wendysBrand.guardrails.do],
      dont: [...wendysBrand.guardrails.dont],
    },
    format_playbook: wendysBrand.format_playbook.map((fp) => ({
      format: fp.format,
      why_it_works: fp.why_it_works,
      examples: [...fp.examples],
    })),
  },
];

const evidence: EvidenceItem[] = wendysEvidence.map((e) => ({
  id: e.id,
  platform: e.platform,
  content_type: e.content_type,
  format: "format" in e ? e.format : undefined,
  canonical_url: e.canonical_url,
  thumbnail_url: e.thumbnail_url,
  author_handle: e.author_handle,
  created_at: e.created_at,
  captured_at: "captured_at" in e ? e.captured_at : undefined,
  caption: e.caption,
  metrics: { ...e.metrics },
  cluster_keys: e.cluster_keys.map((ck) => ({ ...ck })),
  extracted: e.extracted
    ? {
        entities: "entities" in e.extracted && e.extracted.entities ? [...e.extracted.entities] : undefined,
        hashtags: "hashtags" in e.extracted && e.extracted.hashtags ? [...e.extracted.hashtags] : undefined,
        audio_title: "audio_title" in e.extracted ? e.extracted.audio_title : undefined,
      }
    : undefined,
}));

const opportunities: Opportunity[] = wendysOpportunities.map((o) => ({
  id: o.id,
  type: o.type,
  score: o.score,
  title: o.title,
  hook: o.hook,
  why_now: [...o.why_now],
  why_now_summary: "why_now_summary" in o ? o.why_now_summary : undefined,
  lifecycle: "lifecycle" in o ? o.lifecycle : undefined,
  trend_kernel: "trend_kernel" in o ? { ...o.trend_kernel } : undefined,
  platforms: "platforms" in o ? [...o.platforms] : undefined,
  format_target: [...o.format_target],
  brand_fit: { ...o.brand_fit },
  evidence_ids: [...o.evidence_ids],
  signals: { ...o.signals },
  status: o.status,
}));

const packages: ContentPackage[] = wendysPackages.map((p) => ({
  id: p.id,
  opportunity_id: p.opportunity_id,
  title: p.title,
  thesis: p.thesis,
  outline_beats: [...p.outline_beats],
  cta: p.cta,
  format: p.format,
  deliverables: p.deliverables.map((d) => ({ ...d })),
  variants: p.variants.map((v) => ({ ...v })),
  evidence_refs: [...p.evidence_refs],
  quality: { ...p.quality, issues: [...p.quality.issues] },
}));

const patterns: Pattern[] = wendysPatterns.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  structure: p.structure,
  beats: [...p.beats],
  exampleHook: p.exampleHook,
  usageCount: p.usageCount,
  avgEngagement: p.avgEngagement,
  channels: [...p.channels],
  performanceHint: p.performanceHint,
  status: p.status,
  category: p.category,
  lastUsedDaysAgo: p.lastUsedDaysAgo,
}));

// ============================================
// MOCK API CLIENT
// ============================================

export const mockApi = {
  // Default brand ID for redirects
  DEFAULT_BRAND_ID,

  // ============================================
  // BRANDS
  // ============================================

  /**
   * List all brands.
   */
  listBrands(): Brand[] {
    return brands.map((b) =>
      validateOrThrow(BrandSchema, b, "listBrands")
    );
  },

  /**
   * Get a single brand by ID.
   * @throws NotFoundError if brand not found
   */
  getBrand(brandId: string): Brand {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) {
      throw new NotFoundError("Brand", brandId);
    }
    return validateOrThrow(BrandSchema, brand, `getBrand(${brandId})`);
  },

  // ============================================
  // OPPORTUNITIES
  // ============================================

  /**
   * List all opportunities for a brand.
   * Returns basic opportunity data without hydrated evidence.
   */
  listOpportunities(brandId: string): Opportunity[] {
    // Verify brand exists
    this.getBrand(brandId);

    // All opportunities belong to Wendy's for now
    if (brandId !== DEFAULT_BRAND_ID) {
      return [];
    }

    return opportunities.map((o) =>
      validateOrThrow(OpportunitySchema, o, "listOpportunities")
    );
  },

  /**
   * Get a single opportunity by ID with hydrated evidence.
   * @throws NotFoundError if opportunity not found
   */
  getOpportunity(brandId: string, opportunityId: string): OpportunityWithEvidence {
    // Verify brand exists
    this.getBrand(brandId);

    const opp = opportunities.find((o) => o.id === opportunityId);
    if (!opp) {
      throw new NotFoundError("Opportunity", opportunityId);
    }

    // Hydrate evidence
    const hydratedEvidence = opp.evidence_ids
      .map((id) => evidence.find((e) => e.id === id))
      .filter((e): e is EvidenceItem => e !== undefined);

    const result = {
      ...opp,
      evidence: hydratedEvidence,
    };

    return validateOrThrow(
      OpportunityWithEvidenceSchema,
      result,
      `getOpportunity(${opportunityId})`
    );
  },

  // ============================================
  // PACKAGES
  // ============================================

  /**
   * List all packages for a brand.
   * Returns basic package data without hydrated evidence.
   */
  listPackages(brandId: string): ContentPackage[] {
    // Verify brand exists
    this.getBrand(brandId);

    // All packages belong to Wendy's for now
    if (brandId !== DEFAULT_BRAND_ID) {
      return [];
    }

    return packages.map((p) =>
      validateOrThrow(ContentPackageSchema, p, "listPackages")
    );
  },

  /**
   * Get a single package by ID with hydrated evidence.
   * @throws NotFoundError if package not found
   */
  getPackage(brandId: string, packageId: string): ContentPackageWithEvidence {
    // Verify brand exists
    this.getBrand(brandId);

    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) {
      throw new NotFoundError("Package", packageId);
    }

    // Hydrate evidence refs
    const hydratedEvidence = pkg.evidence_refs
      .map((id) => evidence.find((e) => e.id === id))
      .filter((e): e is EvidenceItem => e !== undefined);

    const result = {
      ...pkg,
      evidence: hydratedEvidence,
    };

    return validateOrThrow(
      ContentPackageWithEvidenceSchema,
      result,
      `getPackage(${packageId})`
    );
  },

  /**
   * Get opportunity title by ID (for package rows).
   */
  getOpportunityTitle(opportunityId: string | null): string | null {
    if (!opportunityId) return null;
    const opp = opportunities.find((o) => o.id === opportunityId);
    return opp?.title ?? null;
  },

  // ============================================
  // PATTERNS
  // TODO(spec): patterns are not brand-specific in current impl
  // ============================================

  /**
   * List all patterns.
   */
  listPatterns(): Pattern[] {
    return patterns.map((p) =>
      validateOrThrow(PatternSchema, p, "listPatterns")
    );
  },

  /**
   * Get a single pattern by ID.
   * @throws NotFoundError if pattern not found
   */
  getPattern(patternId: string): Pattern {
    const pattern = patterns.find((p) => p.id === patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern", patternId);
    }
    return validateOrThrow(PatternSchema, pattern, `getPattern(${patternId})`);
  },

  /**
   * List patterns filtered by category.
   */
  listPatternsByCategory(category: PatternCategory): Pattern[] {
    return patterns
      .filter((p) => p.category === category)
      .map((p) => validateOrThrow(PatternSchema, p, "listPatternsByCategory"));
  },

  /**
   * List patterns filtered by channel.
   */
  listPatternsByChannel(channel: string): Pattern[] {
    const channelLower = channel.toLowerCase();
    return patterns
      .filter((p) => p.channels.some((c) => c.toLowerCase() === channelLower))
      .map((p) => validateOrThrow(PatternSchema, p, "listPatternsByChannel"));
  },

  /**
   * Get top recommended patterns (sorted by usage, recency).
   */
  getTopPatterns(limit = 3): Pattern[] {
    return patterns
      .filter((p) => p.status === "active")
      .sort((a, b) => {
        if (b.usageCount !== a.usageCount) {
          return b.usageCount - a.usageCount;
        }
        return a.lastUsedDaysAgo - b.lastUsedDaysAgo;
      })
      .slice(0, limit)
      .map((p) => validateOrThrow(PatternSchema, p, "getTopPatterns"));
  },

  // ============================================
  // EVIDENCE
  // ============================================

  /**
   * Get a single evidence item by ID.
   * @throws NotFoundError if evidence not found
   */
  getEvidence(evidenceId: string): EvidenceItem {
    const ev = evidence.find((e) => e.id === evidenceId);
    if (!ev) {
      throw new NotFoundError("Evidence", evidenceId);
    }
    return validateOrThrow(EvidenceItemSchema, ev, `getEvidence(${evidenceId})`);
  },

  // ============================================
  // WRITE STUBS (no-ops that log in mock mode)
  // ============================================

  /**
   * Pin an opportunity.
   * Mock mode: logs to console.
   */
  async pinOpportunity(brandId: string, opportunityId: string): Promise<void> {
    console.log("[mockApi] pinOpportunity", { brandId, opportunityId });
  },

  /**
   * Unpin an opportunity.
   * Mock mode: logs to console.
   */
  async unpinOpportunity(brandId: string, opportunityId: string): Promise<void> {
    console.log("[mockApi] unpinOpportunity", { brandId, opportunityId });
  },

  /**
   * Snooze an opportunity.
   * Mock mode: logs to console.
   */
  async snoozeOpportunity(brandId: string, opportunityId: string): Promise<void> {
    console.log("[mockApi] snoozeOpportunity", { brandId, opportunityId });
  },

  /**
   * Unsnooze an opportunity.
   * Mock mode: logs to console.
   */
  async unsnoozeOpportunity(brandId: string, opportunityId: string): Promise<void> {
    console.log("[mockApi] unsnoozeOpportunity", { brandId, opportunityId });
  },

  /**
   * Update package status.
   * Mock mode: logs to console.
   */
  async updatePackageStatus(
    brandId: string,
    packageId: string,
    status: string
  ): Promise<void> {
    console.log("[mockApi] updatePackageStatus", { brandId, packageId, status });
  },

  /**
   * Create a new package from an opportunity.
   * Mock mode: logs to console and returns a fake ID.
   */
  async createPackageFromOpportunity(
    brandId: string,
    opportunityId: string
  ): Promise<string> {
    const fakeId = `pkg_mock_${Date.now()}`;
    console.log("[mockApi] createPackageFromOpportunity", {
      brandId,
      opportunityId,
      newPackageId: fakeId,
    });
    return fakeId;
  },

  /**
   * Create a new package.
   * Mock mode: logs to console and returns a fake ID.
   */
  async createPackage(
    brandId: string,
    opportunityId: string
  ): Promise<string> {
    const fakeId = `pkg_mock_${Date.now()}`;
    console.log("[mockApi] createPackage", {
      brandId,
      opportunityId,
      newPackageId: fakeId,
    });
    return fakeId;
  },

  /**
   * Update a variant's content.
   * Mock mode: logs to console.
   */
  async updateVariant(
    brandId: string,
    packageId: string,
    variantId: string,
    updates: { body?: string; notes?: string; status?: string }
  ): Promise<void> {
    console.log("[mockApi] updateVariant", {
      brandId,
      packageId,
      variantId,
      updates,
    });
  },
};
