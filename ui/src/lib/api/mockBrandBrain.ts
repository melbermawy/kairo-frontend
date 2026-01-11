// src/lib/api/mockBrandBrain.ts
// Mock implementations for BrandBrain API endpoints

import {
  type BrandCore,
  type BrandOnboarding,
  type SourceConnection,
  type BrandBrainSnapshot,
  type BrandBrainOverrides,
  type CompileStatus,
  type BrandBrainEvidence,
  type OverridesPatchRequest,
  type CompileStatusValue,
  type CompileStage,
} from "@/contracts";

// ============================================
// MOCK DATA STORES
// ============================================

const mockBrands: BrandCore[] = [
  {
    id: "brand_wendys",
    name: "Wendy's",
    website_url: "https://www.wendys.com",
    created_at: "2024-01-01T00:00:00Z",
  },
];

const mockOnboarding: Map<string, BrandOnboarding> = new Map([
  [
    "brand_wendys",
    {
      brand_id: "brand_wendys",
      tier: 0,
      answers_json: {
        "tier0.what_we_do": "Fast-casual restaurant chain known for fresh, never frozen beef and snarky social media presence",
        "tier0.who_for": "Hungry people who appreciate quality fast food and witty banter",
        "tier0.edge": ["Fresh never frozen beef", "Snarky social voice", "Square patties"],
        "tier0.tone_words": ["Snarky", "Playful", "Confident", "Punchy", "Witty"],
        "tier0.taboos": ["Politics", "Punching down", "Sensitive tragedies", "Fake claims"],
        "tier0.primary_goal": "engagement",
        "tier0.cta_posture": "soft",
      },
      updated_at: new Date().toISOString(),
    },
  ],
]);

const mockSources: Map<string, SourceConnection[]> = new Map([
  [
    "brand_wendys",
    [
      {
        id: "src_wendys_ig",
        brand_id: "brand_wendys",
        platform: "instagram",
        capability: "posts",
        identifier: "https://www.instagram.com/wendys/",
        is_enabled: true,
        settings_json: {},
        updated_at: new Date().toISOString(),
      },
      {
        id: "src_wendys_tiktok",
        brand_id: "brand_wendys",
        platform: "tiktok",
        capability: "profile_videos",
        identifier: "wendys",
        is_enabled: true,
        settings_json: {},
        updated_at: new Date().toISOString(),
      },
    ],
  ],
]);

const mockOverrides: Map<string, BrandBrainOverrides> = new Map([
  [
    "brand_wendys",
    {
      brand_id: "brand_wendys",
      overrides_json: {},
      pinned_paths: [],
      updated_at: new Date().toISOString(),
    },
  ],
]);

// Mock compile runs for polling simulation
const mockCompileRuns: Map<string, { status: CompileStatusValue; stage: CompileStage; percent: number; startedAt: string }> = new Map();

// ============================================
// HELPER: Generate mock snapshot
// ============================================

function generateMockSnapshot(brandId: string): BrandBrainSnapshot {
  const onboarding = mockOnboarding.get(brandId);
  const answers = onboarding?.answers_json || {};

  return {
    id: `snapshot_${brandId}_${Date.now()}`,
    brand_id: brandId,
    version: 1,
    positioning: {
      what_we_do: {
        value: (answers["tier0.what_we_do"] as string) || "No description provided",
        confidence: 0.95,
        sources: [{ type: "answer", id: "tier0.what_we_do" }],
        locked: false,
        override_value: null,
      },
      who_for: {
        value: (answers["tier0.who_for"] as string) || "General audience",
        confidence: 0.9,
        sources: [{ type: "answer", id: "tier0.who_for" }],
        locked: false,
        override_value: null,
      },
      differentiators: {
        value: (answers["tier0.edge"] as string[]) || ["Quality", "Service"],
        confidence: 0.85,
        sources: [{ type: "answer", id: "tier0.edge" }],
        locked: false,
        override_value: null,
      },
      proof_types: {
        value: ["Customer testimonials", "Product demos", "Behind-the-scenes"],
        confidence: 0.7,
        sources: [{ type: "evidence", id: "ev_001" }],
        locked: false,
        override_value: null,
      },
    },
    voice: {
      tone_tags: {
        value: (answers["tier0.tone_words"] as string[]) || ["Professional", "Friendly"],
        confidence: 0.95,
        sources: [{ type: "answer", id: "tier0.tone_words" }],
        locked: false,
        override_value: null,
      },
      do: {
        value: ["Be direct and punchy", "Use humor strategically", "Respond to trends quickly", "Engage with followers"],
        confidence: 0.8,
        sources: [{ type: "evidence", id: "ev_002" }],
        locked: false,
        override_value: null,
      },
      dont: {
        value: (answers["tier0.taboos"] as string[]) || ["Be offensive", "Make false claims"],
        confidence: 0.95,
        sources: [{ type: "answer", id: "tier0.taboos" }],
        locked: false,
        override_value: null,
      },
      cta_policy: {
        value: answers["tier0.cta_posture"] === "aggressive"
          ? "Include CTA in most posts"
          : answers["tier0.cta_posture"] === "soft"
          ? "CTAs should feel natural, not forced"
          : "Balance promotional and organic content",
        confidence: 0.9,
        sources: [{ type: "answer", id: "tier0.cta_posture" }],
        locked: false,
        override_value: null,
      },
      emoji_policy: {
        value: "Use sparingly for emphasis, avoid overuse",
        confidence: 0.7,
        sources: [{ type: "evidence", id: "ev_003" }],
        locked: false,
        override_value: null,
      },
    },
    pillars: [
      {
        name: {
          value: "Product Quality",
          confidence: 0.9,
          sources: [{ type: "answer", id: "tier0.edge" }],
          locked: false,
          override_value: null,
        },
        description: {
          value: "Highlighting fresh ingredients and quality standards",
          confidence: 0.85,
          sources: [{ type: "evidence", id: "ev_004" }],
          locked: false,
          override_value: null,
        },
        themes: {
          value: ["Fresh never frozen", "Quality ingredients", "Made to order"],
          confidence: 0.8,
          sources: [{ type: "answer", id: "tier0.edge" }],
          locked: false,
          override_value: null,
        },
      },
      {
        name: {
          value: "Brand Voice",
          confidence: 0.95,
          sources: [{ type: "answer", id: "tier0.tone_words" }],
          locked: false,
          override_value: null,
        },
        description: {
          value: "Snarky, witty social presence that engages and entertains",
          confidence: 0.9,
          sources: [{ type: "evidence", id: "ev_005" }],
          locked: false,
          override_value: null,
        },
        themes: {
          value: ["Roasts", "Memes", "Quick comebacks", "Trend hijacking"],
          confidence: 0.85,
          sources: [{ type: "evidence", id: "ev_006" }],
          locked: false,
          override_value: null,
        },
      },
    ],
    constraints: {
      taboos: {
        value: (answers["tier0.taboos"] as string[]) || ["Offensive content", "False claims"],
        confidence: 0.95,
        sources: [{ type: "answer", id: "tier0.taboos" }],
        locked: false,
        override_value: null,
      },
      risk_boundaries: {
        value: ["Avoid direct competitor attacks that could be libelous", "No engagement with political figures"],
        confidence: 0.8,
        sources: [],
        locked: false,
        override_value: null,
      },
    },
    platform_profiles: [
      {
        platform: "instagram",
        tone_adjustment: {
          value: "More visual, slightly more polished than X",
          confidence: 0.8,
          sources: [{ type: "evidence", id: "ev_007" }],
          locked: false,
          override_value: null,
        },
        content_types: {
          value: ["Reels", "Stories", "Carousels"],
          confidence: 0.85,
          sources: [{ type: "evidence", id: "ev_008" }],
          locked: false,
          override_value: null,
        },
      },
      {
        platform: "tiktok",
        tone_adjustment: {
          value: "Trend-forward, meme-heavy, fast-paced",
          confidence: 0.85,
          sources: [{ type: "evidence", id: "ev_009" }],
          locked: false,
          override_value: null,
        },
        content_types: {
          value: ["Short videos", "Trends", "Duets"],
          confidence: 0.9,
          sources: [{ type: "evidence", id: "ev_010" }],
          locked: false,
          override_value: null,
        },
      },
    ],
    examples: {
      canonical_evidence: ["ev_001", "ev_002", "ev_003"],
      user_examples: [],
    },
    meta: {
      compiled_at: new Date().toISOString(),
      evidence_summary: {
        total_count: 47,
        by_platform: {
          instagram: 15,
          tiktok: 20,
          x: 12,
        },
      },
      missing_inputs: [],
    },
  };
}

// ============================================
// MOCK BRANDBRAIN API
// ============================================

export const mockBrandBrainApi = {
  // ============================================
  // BRANDS
  // ============================================

  async listBrands(): Promise<BrandCore[]> {
    await simulateDelay(100);
    return [...mockBrands];
  },

  async getBrand(brandId: string): Promise<BrandCore> {
    await simulateDelay(50);
    const brand = mockBrands.find((b) => b.id === brandId);
    if (!brand) {
      throw new Error(`Brand not found: ${brandId}`);
    }
    return { ...brand };
  },

  async createBrand(data: { name: string; website_url?: string }): Promise<BrandCore> {
    await simulateDelay(200);
    const newBrand: BrandCore = {
      id: `brand_${Date.now()}`,
      name: data.name,
      website_url: data.website_url ?? null,
      created_at: new Date().toISOString(),
    };
    mockBrands.push(newBrand);
    return { ...newBrand };
  },

  // ============================================
  // ONBOARDING
  // ============================================

  async getOnboarding(brandId: string): Promise<BrandOnboarding> {
    await simulateDelay(100);
    const onboarding = mockOnboarding.get(brandId);
    if (!onboarding) {
      // Return empty onboarding
      return {
        brand_id: brandId,
        tier: 0,
        answers_json: {},
        updated_at: new Date().toISOString(),
      };
    }
    return { ...onboarding };
  },

  async saveOnboarding(
    brandId: string,
    tier: 0 | 1 | 2,
    answers: Record<string, unknown>
  ): Promise<BrandOnboarding> {
    await simulateDelay(150);
    console.log("[mockBrandBrainApi] saveOnboarding", { brandId, tier, answers });

    const existing = mockOnboarding.get(brandId);
    const updated: BrandOnboarding = {
      brand_id: brandId,
      tier,
      answers_json: {
        ...(existing?.answers_json || {}),
        ...answers,
      },
      updated_at: new Date().toISOString(),
    };
    mockOnboarding.set(brandId, updated);
    return { ...updated };
  },

  // ============================================
  // SOURCE CONNECTIONS
  // ============================================

  async listSources(brandId: string): Promise<SourceConnection[]> {
    await simulateDelay(100);
    return [...(mockSources.get(brandId) || [])];
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
    await simulateDelay(200);
    console.log("[mockBrandBrainApi] createSource", { brandId, data });

    const newSource: SourceConnection = {
      id: `src_${Date.now()}`,
      brand_id: brandId,
      platform: data.platform as SourceConnection["platform"],
      capability: data.capability as SourceConnection["capability"],
      identifier: data.identifier,
      is_enabled: data.is_enabled ?? true,
      settings_json: data.settings_json ?? {},
      updated_at: new Date().toISOString(),
    };

    const sources = mockSources.get(brandId) || [];
    sources.push(newSource);
    mockSources.set(brandId, sources);

    return { ...newSource };
  },

  async updateSource(
    sourceId: string,
    updates: Partial<{
      is_enabled: boolean;
      identifier: string;
      settings_json: Record<string, unknown>;
    }>
  ): Promise<SourceConnection> {
    await simulateDelay(150);
    console.log("[mockBrandBrainApi] updateSource", { sourceId, updates });

    for (const [, sources] of mockSources) {
      const source = sources.find((s) => s.id === sourceId);
      if (source) {
        Object.assign(source, updates, { updated_at: new Date().toISOString() });
        return { ...source };
      }
    }
    throw new Error(`Source not found: ${sourceId}`);
  },

  async deleteSource(sourceId: string): Promise<void> {
    await simulateDelay(150);
    console.log("[mockBrandBrainApi] deleteSource", { sourceId });

    for (const [brandId, sources] of mockSources) {
      const index = sources.findIndex((s) => s.id === sourceId);
      if (index !== -1) {
        sources.splice(index, 1);
        mockSources.set(brandId, sources);
        return;
      }
    }
    throw new Error(`Source not found: ${sourceId}`);
  },

  // ============================================
  // BRANDBRAIN COMPILE
  // ============================================

  async triggerCompile(
    brandId: string,
    forceRefresh = false
  ): Promise<{ compile_run_id: string; status: string }> {
    await simulateDelay(200);
    console.log("[mockBrandBrainApi] triggerCompile", { brandId, forceRefresh });

    const runId = `compile_${Date.now()}`;
    mockCompileRuns.set(runId, {
      status: "QUEUED",
      stage: "QUEUED",
      percent: 0,
      startedAt: new Date().toISOString(),
    });

    // Simulate async progress
    simulateCompileProgress(runId, brandId);

    return { compile_run_id: runId, status: "QUEUED" };
  },

  async getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus> {
    await simulateDelay(50);
    const run = mockCompileRuns.get(compileRunId);
    if (!run) {
      throw new Error(`Compile run not found: ${compileRunId}`);
    }

    return {
      compile_run_id: compileRunId,
      status: run.status,
      progress: {
        stage: run.stage,
        percent: run.percent,
      },
      started_at: run.startedAt,
      updated_at: new Date().toISOString(),
      error: run.status === "FAILED" ? "Mock compile failure" : null,
    };
  },

  // ============================================
  // BRANDBRAIN SNAPSHOT
  // ============================================

  async getLatestSnapshot(brandId: string): Promise<BrandBrainSnapshot> {
    await simulateDelay(150);
    return generateMockSnapshot(brandId);
  },

  async getSnapshotHistory(brandId: string): Promise<BrandBrainSnapshot[]> {
    await simulateDelay(200);
    // Return single snapshot for mock
    return [generateMockSnapshot(brandId)];
  },

  // ============================================
  // BRANDBRAIN OVERRIDES
  // ============================================

  async getOverrides(brandId: string): Promise<BrandBrainOverrides> {
    await simulateDelay(100);
    const overrides = mockOverrides.get(brandId);
    if (!overrides) {
      return {
        brand_id: brandId,
        overrides_json: {},
        pinned_paths: [],
        updated_at: new Date().toISOString(),
      };
    }
    return { ...overrides };
  },

  async patchOverrides(
    brandId: string,
    patch: OverridesPatchRequest
  ): Promise<BrandBrainOverrides> {
    await simulateDelay(150);
    console.log("[mockBrandBrainApi] patchOverrides", { brandId, patch });

    const existing = mockOverrides.get(brandId) || {
      brand_id: brandId,
      overrides_json: {},
      pinned_paths: [],
      updated_at: new Date().toISOString(),
    };

    // Apply set_overrides
    if (patch.set_overrides) {
      Object.assign(existing.overrides_json, patch.set_overrides);
    }

    // Apply remove_overrides
    if (patch.remove_overrides) {
      for (const path of patch.remove_overrides) {
        delete existing.overrides_json[path];
      }
    }

    // Apply pin_paths
    if (patch.pin_paths) {
      for (const path of patch.pin_paths) {
        if (!existing.pinned_paths.includes(path)) {
          existing.pinned_paths.push(path);
        }
      }
    }

    // Apply unpin_paths
    if (patch.unpin_paths) {
      existing.pinned_paths = existing.pinned_paths.filter(
        (p) => !patch.unpin_paths!.includes(p)
      );
    }

    existing.updated_at = new Date().toISOString();
    mockOverrides.set(brandId, existing);

    return { ...existing };
  },

  // ============================================
  // EVIDENCE (for provenance)
  // ============================================

  async getEvidence(evidenceId: string): Promise<BrandBrainEvidence> {
    await simulateDelay(100);
    // Return mock evidence
    return {
      id: evidenceId,
      platform: "instagram",
      content_type: "reel",
      canonical_url: `https://www.instagram.com/p/${evidenceId}/`,
      published_at: new Date().toISOString(),
      author_ref: "@wendys",
      title: null,
      text_primary: "Sample evidence content for provenance display",
      text_secondary: null,
      metrics_json: { views: 50000, likes: 2500 },
      media_json: {},
    };
  },

  async getEvidenceBatch(evidenceIds: string[]): Promise<BrandBrainEvidence[]> {
    await simulateDelay(150);
    return evidenceIds.map((id) => ({
      id,
      platform: "instagram",
      content_type: "reel",
      canonical_url: `https://www.instagram.com/p/${id}/`,
      published_at: new Date().toISOString(),
      author_ref: "@wendys",
      title: null,
      text_primary: "Sample evidence content for provenance display",
      text_secondary: null,
      metrics_json: { views: 50000, likes: 2500 },
      media_json: {},
    }));
  },
};

// ============================================
// HELPERS
// ============================================

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulate compile progress over time
function simulateCompileProgress(runId: string, brandId: string): void {
  const stages: Array<{ stage: CompileStage; duration: number }> = [
    { stage: "ENSURE_EVIDENCE", duration: 500 },
    { stage: "NORMALIZE", duration: 400 },
    { stage: "BUNDLE", duration: 300 },
    { stage: "LLM", duration: 1500 },
    { stage: "QA", duration: 400 },
    { stage: "MERGE", duration: 300 },
    { stage: "DONE", duration: 100 },
  ];

  let currentStageIndex = 0;
  let currentPercent = 0;

  const run = mockCompileRuns.get(runId);
  if (!run) return;

  run.status = "RUNNING";

  const progressInterval = setInterval(() => {
    const run = mockCompileRuns.get(runId);
    if (!run) {
      clearInterval(progressInterval);
      return;
    }

    currentPercent += 5;
    const stageProgress = (currentStageIndex / stages.length) * 100;
    const withinStageProgress = (currentPercent / 100) * (100 / stages.length);
    run.percent = Math.min(Math.round(stageProgress + withinStageProgress), 100);

    if (currentPercent >= 100) {
      currentPercent = 0;
      currentStageIndex++;
      if (currentStageIndex < stages.length) {
        run.stage = stages[currentStageIndex].stage;
      } else {
        run.status = "SUCCEEDED";
        run.stage = "DONE";
        run.percent = 100;
        clearInterval(progressInterval);
      }
    }
  }, 200);
}
