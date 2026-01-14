// src/lib/api/mockBrandBrain.ts
// Mock implementations for BrandBrain API endpoints

import {
  type BrandCore,
  type BrandOnboarding,
  type SourceConnection,
  type BrandBrainSnapshot,
  type BrandBrainOverrides,
  type CompileStatus,
  type CompileTriggerResponse,
  type BackendSnapshotResponse,
  type SnapshotHistoryResponse,
  type BrandBrainEvidence,
  type OverridesPatchRequest,
  type CompileStatusValue,
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
// Uses backend-compatible shape: { status, stage, sources_completed, sources_total }
const mockCompileRuns: Map<string, {
  status: CompileStatusValue;
  stage: string;
  sources_completed: number;
  sources_total: number;
  startedAt: string;
}> = new Map();

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
    return [...mockBrands];
  },

  async getBrand(brandId: string): Promise<BrandCore> {
    const brand = mockBrands.find((b) => b.id === brandId);
    if (!brand) {
      throw new Error(`Brand not found: ${brandId}`);
    }
    return { ...brand };
  },

  async createBrand(data: { name: string; website_url?: string }): Promise<BrandCore> {
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
  ): Promise<CompileTriggerResponse> {
    console.log("[mockBrandBrainApi] triggerCompile", { brandId, forceRefresh });

    const runId = `compile_${Date.now()}`;
    mockCompileRuns.set(runId, {
      status: "PENDING",
      stage: "queued",
      sources_completed: 0,
      sources_total: 5,
      startedAt: new Date().toISOString(),
    });

    // Simulate async progress
    simulateCompileProgress(runId, brandId);

    // Return backend-compatible format
    return {
      compile_run_id: runId,
      status: "PENDING",
      poll_url: `/api/brands/${brandId}/brandbrain/compile/${runId}/status`,
    };
  },

  async getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus> {
    const run = mockCompileRuns.get(compileRunId);
    if (!run) {
      throw new Error(`Compile run not found: ${compileRunId}`);
    }

    // Return backend-compatible format
    const baseResponse: CompileStatus = {
      compile_run_id: compileRunId,
      status: run.status,
    };

    // Add progress for PENDING/RUNNING states
    if (run.status === "PENDING" || run.status === "RUNNING") {
      baseResponse.progress = {
        stage: run.stage,
        sources_completed: run.sources_completed,
        sources_total: run.sources_total,
      };
    }

    // Add snapshot for SUCCEEDED state
    if (run.status === "SUCCEEDED") {
      const snapshot = generateMockSnapshot(brandId);
      baseResponse.snapshot = {
        snapshot_id: snapshot.id,
        created_at: new Date().toISOString(),
        snapshot_json: snapshot as unknown as Record<string, unknown>,
      };
      baseResponse.evidence_status = {
        total: 47,
        completed: 47,
        failed: 0,
      };
    }

    // Add error for FAILED state
    if (run.status === "FAILED") {
      baseResponse.error = "Mock compile failure";
      baseResponse.evidence_status = {
        total: 47,
        completed: 30,
        failed: 17,
      };
    }

    return baseResponse;
  },

  // ============================================
  // BRANDBRAIN SNAPSHOT
  // ============================================

  async getLatestSnapshot(brandId: string): Promise<BackendSnapshotResponse> {
    // Return backend-compatible wrapped format
    const snapshot = generateMockSnapshot(brandId);
    return {
      snapshot_id: snapshot.id,
      brand_id: brandId,
      snapshot_json: snapshot as unknown as Record<string, unknown>,
      created_at: new Date().toISOString(),
      compile_run_id: `compile_${Date.now() - 10000}`,
    };
  },

  async getSnapshotHistory(brandId: string): Promise<SnapshotHistoryResponse> {
    // Return backend-compatible paginated format
    const snapshot = generateMockSnapshot(brandId);
    return {
      snapshots: [
        {
          snapshot_id: snapshot.id,
          created_at: new Date().toISOString(),
          diff_summary: {},
        },
      ],
      page: 1,
      page_size: 10,
      total: 1,
    };
  },

  // ============================================
  // BRANDBRAIN OVERRIDES
  // ============================================

  async getOverrides(brandId: string): Promise<BrandBrainOverrides> {
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
    console.log("[mockBrandBrainApi] patchOverrides", { brandId, patch });

    const existing = mockOverrides.get(brandId) || {
      brand_id: brandId,
      overrides_json: {},
      pinned_paths: [],
      updated_at: null,
    };

    // Backend semantics: overrides_json merges; null value deletes a key
    if (patch.overrides_json) {
      for (const [path, value] of Object.entries(patch.overrides_json)) {
        if (value === null) {
          delete existing.overrides_json[path];
        } else {
          existing.overrides_json[path] = value;
        }
      }
    }

    // Backend semantics: pinned_paths replaces entire list
    if (patch.pinned_paths !== undefined) {
      existing.pinned_paths = [...patch.pinned_paths];
    }

    existing.updated_at = new Date().toISOString();
    mockOverrides.set(brandId, existing);

    return { ...existing };
  },

  // ============================================
  // EVIDENCE (for provenance)
  // ============================================

  async getEvidence(evidenceId: string): Promise<BrandBrainEvidence> {
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

  // ============================================
  // BOOTSTRAP (combined fetches)
  // ============================================

  async getStrategyBootstrap(brandId: string): Promise<{
    brand: BrandCore;
    snapshot: BackendSnapshotResponse | null;
    overrides: BrandBrainOverrides | null;
    hasSnapshot: boolean;
  }> {
    const [brand, snapshot, overrides] = await Promise.all([
      this.getBrand(brandId),
      this.getLatestSnapshot(brandId).catch(() => null),
      this.getOverrides(brandId).catch(() => null),
    ]);

    return {
      brand,
      snapshot,
      overrides,
      hasSnapshot: snapshot !== null,
    };
  },

  async getOnboardingBootstrap(brandId: string): Promise<{
    brand: BrandCore;
    onboarding: BrandOnboarding;
    sources: SourceConnection[];
  }> {
    const [brand, onboarding, sources] = await Promise.all([
      this.getBrand(brandId),
      this.getOnboarding(brandId),
      this.listSources(brandId),
    ]);

    return { brand, onboarding, sources };
  },

  async hasSnapshot(brandId: string): Promise<boolean> {
    // In mock mode, any brand that exists can have a snapshot generated
    return mockBrands.some((b) => b.id === brandId);
  },
};

// ============================================
// HELPERS
// ============================================

// NOTE: No simulateDelay() in mock API methods.
// Artificial delays block server-side rendering and add 300-500ms+ to page loads.
// Mock mode should return in-memory data synchronously.
// If you need to test loading states, do so in client-side tests.

// Simulate compile progress over time (runs in background, doesn't block)
// Uses backend-compatible stage names (lowercase) and sources_completed/sources_total
function simulateCompileProgress(runId: string, _brandId: string): void {
  const stages = [
    "evidence_gathering",
    "normalizing",
    "bundling",
    "llm_processing",
    "qa_check",
    "merging",
    "done",
  ];

  let currentStageIndex = 0;
  let sourcesCompleted = 0;
  const sourcesTotal = 5;

  const run = mockCompileRuns.get(runId);
  if (!run) return;

  run.status = "RUNNING";

  const progressInterval = setInterval(() => {
    const run = mockCompileRuns.get(runId);
    if (!run) {
      clearInterval(progressInterval);
      return;
    }

    sourcesCompleted = Math.min(sourcesCompleted + 1, sourcesTotal);
    run.sources_completed = sourcesCompleted;

    if (sourcesCompleted >= sourcesTotal) {
      sourcesCompleted = 0;
      currentStageIndex++;
      if (currentStageIndex < stages.length) {
        run.stage = stages[currentStageIndex];
      } else {
        run.status = "SUCCEEDED";
        run.stage = "done";
        run.sources_completed = sourcesTotal;
        clearInterval(progressInterval);
      }
    }
  }, 200);
}
