// src/lib/api/__tests__/brandBrainApi.test.ts
// Tests for BrandBrain API - onboarding autosave, compile polling, overrides
// Updated for backend-compatible response shapes

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockBrandBrainApi } from "../mockBrandBrain";
import { transformBackendSnapshot } from "@/contracts";

describe("BrandBrain API", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Onboarding autosave", () => {
    it("should save onboarding answers and return updated data", async () => {
      const brandId = "brand_wendys";
      const answers = {
        "tier0.what_we_do": "Test description",
        "tier0.who_for": "Test audience",
      };

      const resultPromise = mockBrandBrainApi.saveOnboarding(brandId, 0, answers);
      await vi.advanceTimersByTimeAsync(200);
      const result = await resultPromise;

      expect(result.brand_id).toBe(brandId);
      expect(result.tier).toBe(0);
      expect(result.answers_json["tier0.what_we_do"]).toBe("Test description");
      expect(result.answers_json["tier0.who_for"]).toBe("Test audience");
      expect(result.updated_at).toBeDefined();
    });

    it("should merge new answers with existing ones", async () => {
      const brandId = "brand_wendys";

      // First save
      const save1Promise = mockBrandBrainApi.saveOnboarding(brandId, 0, {
        "tier0.what_we_do": "First value",
      });
      await vi.advanceTimersByTimeAsync(200);
      await save1Promise;

      // Second save with different key
      const save2Promise = mockBrandBrainApi.saveOnboarding(brandId, 0, {
        "tier0.who_for": "Second value",
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await save2Promise;

      // Both values should exist
      expect(result.answers_json["tier0.what_we_do"]).toBeDefined();
      expect(result.answers_json["tier0.who_for"]).toBe("Second value");
    });

    it("should upgrade tier based on answer keys", async () => {
      const brandId = "brand_wendys";

      // Save with tier1 keys
      const resultPromise = mockBrandBrainApi.saveOnboarding(brandId, 1, {
        "tier1.priority_platforms": ["instagram", "tiktok"],
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await resultPromise;

      expect(result.tier).toBe(1);
    });
  });

  describe("Compile polling state transitions", () => {
    it("should return compile_run_id when triggering compile", async () => {
      const brandId = "brand_wendys";

      const resultPromise = mockBrandBrainApi.triggerCompile(brandId);
      await vi.advanceTimersByTimeAsync(250);
      const result = await resultPromise;

      expect(result.compile_run_id).toBeDefined();
      expect(result.compile_run_id).toMatch(/^compile_/);
      // Backend returns PENDING, not QUEUED
      expect(result.status).toBe("PENDING");
    });

    it("should transition through compile stages", async () => {
      const brandId = "brand_wendys";

      // Start compile
      const compilePromise = mockBrandBrainApi.triggerCompile(brandId);
      await vi.advanceTimersByTimeAsync(250);
      const { compile_run_id } = await compilePromise;

      // Check initial status
      let statusPromise = mockBrandBrainApi.getCompileStatus(brandId, compile_run_id);
      await vi.advanceTimersByTimeAsync(100);
      let status = await statusPromise;

      expect(status.status).toBe("RUNNING");
      // Backend uses sources_completed/sources_total, not percent
      expect(status.progress?.sources_completed).toBeGreaterThanOrEqual(0);
      expect(status.progress?.sources_total).toBeGreaterThan(0);

      // Advance time to progress through stages
      await vi.advanceTimersByTimeAsync(5000);

      statusPromise = mockBrandBrainApi.getCompileStatus(brandId, compile_run_id);
      await vi.advanceTimersByTimeAsync(100);
      status = await statusPromise;

      // Should have progressed
      expect(status.progress?.sources_completed).toBeGreaterThan(0);
    });

    it("should reach SUCCEEDED status after completion", async () => {
      const brandId = "brand_wendys";

      // Start compile
      const compilePromise = mockBrandBrainApi.triggerCompile(brandId);
      await vi.advanceTimersByTimeAsync(250);
      const { compile_run_id } = await compilePromise;

      // Wait for completion
      // Mock compile: 7 stages × 5 source updates × 200ms = 7s, plus buffer
      await vi.advanceTimersByTimeAsync(10000);

      const statusPromise = mockBrandBrainApi.getCompileStatus(brandId, compile_run_id);
      await vi.advanceTimersByTimeAsync(100);
      const status = await statusPromise;

      expect(status.status).toBe("SUCCEEDED");
      // SUCCEEDED status includes snapshot
      expect(status.snapshot).toBeDefined();
      expect(status.snapshot?.snapshot_id).toBeDefined();
    });
  });

  describe("Overrides patch payload correctness (backend semantics)", () => {
    it("should correctly apply overrides_json merge", async () => {
      const brandId = "brand_wendys";

      // Backend semantics: overrides_json merges with existing
      const patchPromise = mockBrandBrainApi.patchOverrides(brandId, {
        overrides_json: {
          "voice.tone_tags": ["Custom", "Values"],
        },
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await patchPromise;

      expect(result.overrides_json["voice.tone_tags"]).toEqual(["Custom", "Values"]);
    });

    it("should correctly apply pinned_paths replacement", async () => {
      const brandId = "brand_wendys";

      // Backend semantics: pinned_paths replaces entire list
      const patchPromise = mockBrandBrainApi.patchOverrides(brandId, {
        overrides_json: {
          "positioning.what_we_do": "Pinned value",
        },
        pinned_paths: ["positioning.what_we_do"],
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await patchPromise;

      expect(result.pinned_paths).toContain("positioning.what_we_do");
      expect(result.overrides_json["positioning.what_we_do"]).toBe("Pinned value");
    });

    it("should correctly remove overrides with null value", async () => {
      const brandId = "brand_wendys";

      // First set
      const setPromise = mockBrandBrainApi.patchOverrides(brandId, {
        overrides_json: {
          "constraints.taboos": ["Custom taboo"],
        },
      });
      await vi.advanceTimersByTimeAsync(200);
      await setPromise;

      // Backend semantics: null value deletes the key
      const removePromise = mockBrandBrainApi.patchOverrides(brandId, {
        overrides_json: {
          "constraints.taboos": null,
        },
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await removePromise;

      expect(result.overrides_json["constraints.taboos"]).toBeUndefined();
    });

    it("should replace pinned_paths entirely", async () => {
      const brandId = "brand_wendys";

      // First set some pins
      const pin1Promise = mockBrandBrainApi.patchOverrides(brandId, {
        pinned_paths: ["voice.do", "voice.dont"],
      });
      await vi.advanceTimersByTimeAsync(200);
      const result1 = await pin1Promise;
      expect(result1.pinned_paths).toContain("voice.do");
      expect(result1.pinned_paths).toContain("voice.dont");

      // Backend semantics: pinned_paths replaces entire list
      const pin2Promise = mockBrandBrainApi.patchOverrides(brandId, {
        pinned_paths: ["voice.emoji_policy"],
      });
      await vi.advanceTimersByTimeAsync(200);
      const result2 = await pin2Promise;

      // Old pins should be gone, only new one exists
      expect(result2.pinned_paths).not.toContain("voice.do");
      expect(result2.pinned_paths).not.toContain("voice.dont");
      expect(result2.pinned_paths).toContain("voice.emoji_policy");
    });

    it("should handle combined operations in single patch", async () => {
      const brandId = "brand_wendys";

      const patchPromise = mockBrandBrainApi.patchOverrides(brandId, {
        overrides_json: {
          "voice.emoji_policy": "No emojis allowed",
        },
        pinned_paths: ["voice.emoji_policy"],
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await patchPromise;

      expect(result.overrides_json["voice.emoji_policy"]).toBe("No emojis allowed");
      expect(result.pinned_paths).toContain("voice.emoji_policy");
    });
  });

  describe("Source connections", () => {
    it("should create a new source connection", async () => {
      const brandId = "brand_wendys";

      const createPromise = mockBrandBrainApi.createSource(brandId, {
        platform: "youtube",
        capability: "channel_videos",
        identifier: "https://youtube.com/@test",
        is_enabled: true,
      });
      await vi.advanceTimersByTimeAsync(250);
      const result = await createPromise;

      expect(result.id).toBeDefined();
      expect(result.platform).toBe("youtube");
      expect(result.capability).toBe("channel_videos");
      expect(result.identifier).toBe("https://youtube.com/@test");
      expect(result.is_enabled).toBe(true);
    });

    it("should update source enabled state", async () => {
      const brandId = "brand_wendys";

      // Get existing sources
      const listPromise = mockBrandBrainApi.listSources(brandId);
      await vi.advanceTimersByTimeAsync(150);
      const sources = await listPromise;

      if (sources.length > 0) {
        const source = sources[0];
        const originalEnabled = source.is_enabled;

        const updatePromise = mockBrandBrainApi.updateSource(source.id, {
          is_enabled: !originalEnabled,
        });
        await vi.advanceTimersByTimeAsync(200);
        const updated = await updatePromise;

        expect(updated.is_enabled).toBe(!originalEnabled);
      }
    });
  });

  describe("Snapshot retrieval (backend wrapped format)", () => {
    it("should return a valid backend snapshot response", async () => {
      const brandId = "brand_wendys";

      const snapshotPromise = mockBrandBrainApi.getLatestSnapshot(brandId);
      await vi.advanceTimersByTimeAsync(200);
      const backendResponse = await snapshotPromise;

      // Backend returns wrapped format
      expect(backendResponse.snapshot_id).toBeDefined();
      expect(backendResponse.brand_id).toBe(brandId);
      expect(backendResponse.snapshot_json).toBeDefined();
      expect(backendResponse.created_at).toBeDefined();
    });

    it("should transform to frontend format correctly", async () => {
      const brandId = "brand_wendys";

      const snapshotPromise = mockBrandBrainApi.getLatestSnapshot(brandId);
      await vi.advanceTimersByTimeAsync(200);
      const backendResponse = await snapshotPromise;

      // Transform to frontend format
      const snapshot = transformBackendSnapshot(backendResponse);

      // Check required sections exist in transformed snapshot
      expect(snapshot).not.toBeNull();
      if (snapshot) {
        expect(snapshot.positioning).toBeDefined();
        expect(snapshot.voice).toBeDefined();
        expect(snapshot.pillars).toBeDefined();
        expect(snapshot.constraints).toBeDefined();
        expect(snapshot.platform_profiles).toBeDefined();
        expect(snapshot.examples).toBeDefined();
        expect(snapshot.meta).toBeDefined();

        // Check FieldNode structure
        expect(snapshot.positioning.what_we_do.value).toBeDefined();
        expect(snapshot.positioning.what_we_do.confidence).toBeDefined();
        expect(snapshot.positioning.what_we_do.sources).toBeDefined();
        expect(typeof snapshot.positioning.what_we_do.locked).toBe("boolean");

        // Check meta from created_at
        expect(snapshot.meta.compiled_at).toBeDefined();
      }
    });
  });

  describe("Snapshot history (paginated format)", () => {
    it("should return paginated history response", async () => {
      const brandId = "brand_wendys";

      const historyPromise = mockBrandBrainApi.getSnapshotHistory(brandId);
      await vi.advanceTimersByTimeAsync(200);
      const history = await historyPromise;

      // Backend returns paginated format
      expect(history.snapshots).toBeDefined();
      expect(Array.isArray(history.snapshots)).toBe(true);
      expect(history.page).toBeDefined();
      expect(history.page_size).toBeDefined();
      expect(history.total).toBeDefined();
    });
  });
});
