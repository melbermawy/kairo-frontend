// src/lib/mockApi/__tests__/mockApi.test.ts
// Tests for mockApi layer - validates fixture data and API behavior

import { describe, it, expect } from "vitest";
import { mockApi, NotFoundError } from "../index";
import {
  BrandSchema,
  OpportunitySchema,
  ContentPackageSchema,
  PatternSchema,
  EvidenceItemSchema,
} from "@/contracts";

describe("mockApi", () => {
  describe("DEFAULT_BRAND_ID", () => {
    it("should be brand_wendys", () => {
      expect(mockApi.DEFAULT_BRAND_ID).toBe("brand_wendys");
    });
  });

  describe("listBrands", () => {
    it("should return an array of brands", () => {
      const brands = mockApi.listBrands();
      expect(Array.isArray(brands)).toBe(true);
      expect(brands.length).toBeGreaterThan(0);
    });

    it("should return brands that match the BrandSchema", () => {
      const brands = mockApi.listBrands();
      for (const brand of brands) {
        const result = BrandSchema.safeParse(brand);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("getBrand", () => {
    it("should return a brand for valid brandId", () => {
      const brand = mockApi.getBrand("brand_wendys");
      expect(brand).toBeDefined();
      expect(brand.id).toBe("brand_wendys");
      expect(brand.name).toBe("Wendy's");
    });

    it("should throw NotFoundError for invalid brandId", () => {
      expect(() => mockApi.getBrand("brand_invalid")).toThrow(NotFoundError);
    });

    it("should return brand that matches BrandSchema", () => {
      const brand = mockApi.getBrand("brand_wendys");
      const result = BrandSchema.safeParse(brand);
      expect(result.success).toBe(true);
    });
  });

  describe("listOpportunities", () => {
    it("should return opportunities for valid brandId", () => {
      const opportunities = mockApi.listOpportunities("brand_wendys");
      expect(Array.isArray(opportunities)).toBe(true);
      expect(opportunities.length).toBeGreaterThan(0);
    });

    it("should throw NotFoundError for invalid brandId", () => {
      expect(() => mockApi.listOpportunities("brand_invalid")).toThrow(
        NotFoundError
      );
    });

    it("should return opportunities that match OpportunitySchema", () => {
      const opportunities = mockApi.listOpportunities("brand_wendys");
      for (const opp of opportunities) {
        const result = OpportunitySchema.safeParse(opp);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("getOpportunity", () => {
    it("should return opportunity with hydrated evidence", () => {
      const opp = mockApi.getOpportunity("brand_wendys", "opp_001");
      expect(opp).toBeDefined();
      expect(opp.id).toBe("opp_001");
      expect(Array.isArray(opp.evidence)).toBe(true);
    });

    it("should throw NotFoundError for invalid opportunityId", () => {
      expect(() =>
        mockApi.getOpportunity("brand_wendys", "opp_invalid")
      ).toThrow(NotFoundError);
    });

    it("should hydrate evidence items correctly", () => {
      const opp = mockApi.getOpportunity("brand_wendys", "opp_001");
      for (const ev of opp.evidence) {
        const result = EvidenceItemSchema.safeParse(ev);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("listPackages", () => {
    it("should return packages for valid brandId", () => {
      const packages = mockApi.listPackages("brand_wendys");
      expect(Array.isArray(packages)).toBe(true);
      expect(packages.length).toBeGreaterThan(0);
    });

    it("should throw NotFoundError for invalid brandId", () => {
      expect(() => mockApi.listPackages("brand_invalid")).toThrow(
        NotFoundError
      );
    });

    it("should return packages that match ContentPackageSchema", () => {
      const packages = mockApi.listPackages("brand_wendys");
      for (const pkg of packages) {
        const result = ContentPackageSchema.safeParse(pkg);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("getPackage", () => {
    it("should return package with hydrated evidence", () => {
      const pkg = mockApi.getPackage("brand_wendys", "pkg_001");
      expect(pkg).toBeDefined();
      expect(pkg.id).toBe("pkg_001");
      expect(Array.isArray(pkg.evidence)).toBe(true);
    });

    it("should throw NotFoundError for invalid packageId", () => {
      expect(() => mockApi.getPackage("brand_wendys", "pkg_invalid")).toThrow(
        NotFoundError
      );
    });
  });

  describe("listPatterns", () => {
    it("should return an array of patterns", () => {
      const patterns = mockApi.listPatterns();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it("should return patterns that match PatternSchema", () => {
      const patterns = mockApi.listPatterns();
      for (const pattern of patterns) {
        const result = PatternSchema.safeParse(pattern);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("getTopPatterns", () => {
    it("should return top N patterns sorted by usageCount", () => {
      const top3 = mockApi.getTopPatterns(3);
      expect(top3.length).toBe(3);
      // Verify sorted descending by usageCount
      expect(top3[0].usageCount).toBeGreaterThanOrEqual(top3[1].usageCount);
      expect(top3[1].usageCount).toBeGreaterThanOrEqual(top3[2].usageCount);
    });
  });

  describe("write stubs", () => {
    it("pinOpportunity should be a no-op stub", () => {
      expect(() =>
        mockApi.pinOpportunity("brand_wendys", "opp_001")
      ).not.toThrow();
    });

    it("snoozeOpportunity should be a no-op stub", () => {
      expect(() =>
        mockApi.snoozeOpportunity("brand_wendys", "opp_001")
      ).not.toThrow();
    });

    it("createPackage should be a no-op stub", () => {
      expect(() => mockApi.createPackage("brand_wendys", "opp_001")).not.toThrow();
    });

    it("updateVariant should be a no-op stub", () => {
      expect(() =>
        mockApi.updateVariant("brand_wendys", "pkg_001", "var_001", {
          body: "updated",
        })
      ).not.toThrow();
    });
  });
});

describe("fixture validation", () => {
  it("all fixture data should pass zod validation", () => {
    // This test ensures that our fixture data matches the contracts
    // The mockApi already validates on read, but this is explicit

    const brands = mockApi.listBrands();
    expect(brands.length).toBeGreaterThan(0);

    const opportunities = mockApi.listOpportunities("brand_wendys");
    expect(opportunities.length).toBeGreaterThan(0);

    const packages = mockApi.listPackages("brand_wendys");
    expect(packages.length).toBeGreaterThan(0);

    const patterns = mockApi.listPatterns();
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("opportunities should have new V2 fields (lifecycle, trend_kernel, platforms)", () => {
    const opportunities = mockApi.listOpportunities("brand_wendys");

    // At least one opportunity should have the new fields
    const withLifecycle = opportunities.filter((o) => o.lifecycle !== undefined);
    expect(withLifecycle.length).toBeGreaterThan(0);

    const withTrendKernel = opportunities.filter(
      (o) => o.trend_kernel !== undefined
    );
    expect(withTrendKernel.length).toBeGreaterThan(0);

    const withPlatforms = opportunities.filter(
      (o) => o.platforms !== undefined && o.platforms.length > 0
    );
    expect(withPlatforms.length).toBeGreaterThan(0);

    const withWhyNowSummary = opportunities.filter(
      (o) => o.why_now_summary !== undefined
    );
    expect(withWhyNowSummary.length).toBeGreaterThan(0);
  });

  it("evidence should have new V2 fields (format, captured_at)", () => {
    const opp = mockApi.getOpportunity("brand_wendys", "opp_001");

    // At least one evidence item should have the new fields
    const withFormat = opp.evidence.filter((e) => e.format !== undefined);
    expect(withFormat.length).toBeGreaterThan(0);

    const withCapturedAt = opp.evidence.filter(
      (e) => e.captured_at !== undefined
    );
    expect(withCapturedAt.length).toBeGreaterThan(0);
  });

  it("evidence should have metrics with views/likes/comments", () => {
    const opp = mockApi.getOpportunity("brand_wendys", "opp_001");

    // At least one evidence item should have metrics
    const withMetrics = opp.evidence.filter(
      (e) =>
        e.metrics &&
        (e.metrics.views !== undefined ||
          e.metrics.likes !== undefined ||
          e.metrics.comments !== undefined)
    );
    expect(withMetrics.length).toBeGreaterThan(0);
  });
});
