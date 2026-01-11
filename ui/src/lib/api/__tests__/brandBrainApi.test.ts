// src/lib/api/__tests__/brandBrainApi.test.ts
// Tests for BrandBrain API - onboarding autosave, compile polling, overrides

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockBrandBrainApi } from "../mockBrandBrain";

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
      expect(result.status).toBe("QUEUED");
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
      expect(status.progress.percent).toBeGreaterThanOrEqual(0);

      // Advance time to progress through stages
      await vi.advanceTimersByTimeAsync(5000);

      statusPromise = mockBrandBrainApi.getCompileStatus(brandId, compile_run_id);
      await vi.advanceTimersByTimeAsync(100);
      status = await statusPromise;

      // Should have progressed
      expect(status.progress.percent).toBeGreaterThan(0);
    });

    it("should reach SUCCEEDED status after completion", async () => {
      const brandId = "brand_wendys";

      // Start compile
      const compilePromise = mockBrandBrainApi.triggerCompile(brandId);
      await vi.advanceTimersByTimeAsync(250);
      const { compile_run_id } = await compilePromise;

      // Wait for completion
      // Mock compile: 7 stages × 20 increments × 200ms = 28s, plus buffer
      await vi.advanceTimersByTimeAsync(30000);

      const statusPromise = mockBrandBrainApi.getCompileStatus(brandId, compile_run_id);
      await vi.advanceTimersByTimeAsync(100);
      const status = await statusPromise;

      expect(status.status).toBe("SUCCEEDED");
      expect(status.progress.stage).toBe("DONE");
      expect(status.progress.percent).toBe(100);
    });
  });

  describe("Overrides patch payload correctness", () => {
    it("should correctly apply set_overrides", async () => {
      const brandId = "brand_wendys";

      const patchPromise = mockBrandBrainApi.patchOverrides(brandId, {
        set_overrides: {
          "voice.tone_tags": ["Custom", "Values"],
        },
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await patchPromise;

      expect(result.overrides_json["voice.tone_tags"]).toEqual(["Custom", "Values"]);
    });

    it("should correctly apply pin_paths", async () => {
      const brandId = "brand_wendys";

      const patchPromise = mockBrandBrainApi.patchOverrides(brandId, {
        set_overrides: {
          "positioning.what_we_do": "Pinned value",
        },
        pin_paths: ["positioning.what_we_do"],
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await patchPromise;

      expect(result.pinned_paths).toContain("positioning.what_we_do");
      expect(result.overrides_json["positioning.what_we_do"]).toBe("Pinned value");
    });

    it("should correctly apply unpin_paths", async () => {
      const brandId = "brand_wendys";

      // First pin
      const pin1Promise = mockBrandBrainApi.patchOverrides(brandId, {
        pin_paths: ["voice.do"],
      });
      await vi.advanceTimersByTimeAsync(200);
      await pin1Promise;

      // Then unpin
      const unpinPromise = mockBrandBrainApi.patchOverrides(brandId, {
        unpin_paths: ["voice.do"],
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await unpinPromise;

      expect(result.pinned_paths).not.toContain("voice.do");
    });

    it("should correctly apply remove_overrides", async () => {
      const brandId = "brand_wendys";

      // First set
      const setPromise = mockBrandBrainApi.patchOverrides(brandId, {
        set_overrides: {
          "constraints.taboos": ["Custom taboo"],
        },
      });
      await vi.advanceTimersByTimeAsync(200);
      await setPromise;

      // Then remove
      const removePromise = mockBrandBrainApi.patchOverrides(brandId, {
        remove_overrides: ["constraints.taboos"],
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await removePromise;

      expect(result.overrides_json["constraints.taboos"]).toBeUndefined();
    });

    it("should handle combined operations in single patch", async () => {
      const brandId = "brand_wendys";

      const patchPromise = mockBrandBrainApi.patchOverrides(brandId, {
        set_overrides: {
          "voice.emoji_policy": "No emojis allowed",
        },
        pin_paths: ["voice.emoji_policy"],
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

  describe("Snapshot retrieval", () => {
    it("should return a valid snapshot structure", async () => {
      const brandId = "brand_wendys";

      const snapshotPromise = mockBrandBrainApi.getLatestSnapshot(brandId);
      await vi.advanceTimersByTimeAsync(200);
      const snapshot = await snapshotPromise;

      // Check required sections exist
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
    });

    it("should include meta information", async () => {
      const brandId = "brand_wendys";

      const snapshotPromise = mockBrandBrainApi.getLatestSnapshot(brandId);
      await vi.advanceTimersByTimeAsync(200);
      const snapshot = await snapshotPromise;

      expect(snapshot.meta.compiled_at).toBeDefined();
      expect(snapshot.meta.evidence_summary).toBeDefined();
      expect(snapshot.meta.evidence_summary.total_count).toBeGreaterThanOrEqual(0);
    });
  });
});
