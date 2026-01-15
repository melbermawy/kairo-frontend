// src/contracts/brandbrain.ts
// Zod schemas for BrandBrain onboarding, snapshots, and overrides
// Based on: docs/BRANDBRAIN_FRONTEND_SPEC.md

import { z } from "zod";

// ============================================
// BRAND CORE (backend minimal Brand)
// ============================================

export const BrandCoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  website_url: z.string().url().nullable().optional(),
  created_at: z.string().optional(),
});

export type BrandCore = z.infer<typeof BrandCoreSchema>;

// ============================================
// ONBOARDING
// ============================================

export const OnboardingTierSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);

export type OnboardingTier = z.infer<typeof OnboardingTierSchema>;

export const BrandOnboardingSchema = z.object({
  brand_id: z.string().optional(), // optional in bootstrap responses
  tier: OnboardingTierSchema,
  answers_json: z.record(z.string(), z.unknown()),
  updated_at: z.string().nullable().optional(), // null when never updated
});

export type BrandOnboarding = z.infer<typeof BrandOnboardingSchema>;

// Tier 0 answer keys (required)
export const Tier0AnswersSchema = z.object({
  "tier0.what_we_do": z.string().optional(),
  "tier0.who_for": z.string().optional(),
  "tier0.edge": z.array(z.string()).optional(),
  "tier0.tone_words": z.array(z.string()).optional(),
  "tier0.taboos": z.array(z.string()).optional(),
  "tier0.primary_goal": z.string().optional(),
  "tier0.cta_posture": z.string().optional(),
});

export type Tier0Answers = z.infer<typeof Tier0AnswersSchema>;

// Tier 1 answer keys (recommended)
export const Tier1AnswersSchema = z.object({
  "tier1.priority_platforms": z.array(z.string()).optional(),
  "tier1.pillars_seed": z.array(z.string()).optional(),
  "tier1.good_examples": z.array(z.string()).optional(),
  "tier1.key_pages": z.array(z.string()).optional(),
});

export type Tier1Answers = z.infer<typeof Tier1AnswersSchema>;

// Tier 2 answer keys (optional power)
export const PlatformRulesSchema = z.object({
  hashtag_rules: z.string().optional(),
  formatting_rules: z.string().optional(),
  posting_frequency: z.string().optional(),
});

export const Tier2AnswersSchema = z.object({
  "tier2.platform_rules": z.record(z.string(), PlatformRulesSchema).optional(),
  "tier2.proof_claims": z.array(z.string()).optional(),
  "tier2.risk_boundaries": z.array(z.string()).optional(),
});

export type Tier2Answers = z.infer<typeof Tier2AnswersSchema>;

// Primary goal options for Tier 0
export const PrimaryGoalOptions = [
  { value: "awareness", label: "Brand Awareness" },
  { value: "engagement", label: "Community Engagement" },
  { value: "leads", label: "Lead Generation" },
  { value: "sales", label: "Direct Sales" },
  { value: "thought_leadership", label: "Thought Leadership" },
] as const;

// CTA posture options for Tier 0
export const CtaPostureOptions = [
  { value: "soft", label: "Soft (minimal CTAs)" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive (frequent CTAs)" },
] as const;

// ============================================
// SOURCE CONNECTION
// ============================================

export const SourcePlatformSchema = z.enum([
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "web",
]);

export type SourcePlatform = z.infer<typeof SourcePlatformSchema>;

export const SourceCapabilitySchema = z.enum([
  "posts",
  "reels",
  "company_posts",
  "profile_posts",
  "profile_videos",
  "channel_videos",
  "crawl_pages",
]);

export type SourceCapability = z.infer<typeof SourceCapabilitySchema>;

export const SourceConnectionSchema = z.object({
  id: z.string(),
  brand_id: z.string(),
  platform: SourcePlatformSchema,
  capability: SourceCapabilitySchema,
  identifier: z.string(),
  is_enabled: z.boolean(),
  settings_json: z.record(z.string(), z.unknown()).nullable(), // null when no settings
  created_at: z.string().optional(), // backend may use created_at or updated_at
  updated_at: z.string().optional(), // backend may use updated_at
});

export type SourceConnection = z.infer<typeof SourceConnectionSchema>;

// Platform to capability mapping for UI
export const PlatformCapabilities: Record<SourcePlatform, SourceCapability[]> = {
  instagram: ["posts", "reels"],
  linkedin: ["company_posts", "profile_posts"],
  tiktok: ["profile_videos"],
  youtube: ["channel_videos"],
  web: ["crawl_pages"],
};

// ============================================
// FIELD NODE (snapshot leaf primitive)
// ============================================

export const FieldSourceAnswerSchema = z.object({
  type: z.literal("answer"),
  id: z.string(),
});

export const FieldSourceEvidenceSchema = z.object({
  type: z.literal("evidence"),
  id: z.string(),
});

// Backend may also return "llm" as source type
export const FieldSourceLlmSchema = z.object({
  type: z.literal("llm"),
  id: z.string(),
});

export const FieldSourceSchema = z.union([
  FieldSourceAnswerSchema,
  FieldSourceEvidenceSchema,
  FieldSourceLlmSchema,
]);

export type FieldSource = z.infer<typeof FieldSourceSchema>;

// Generic FieldNode schema factory
export function createFieldNodeSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema,
    confidence: z.number().min(0).max(1),
    sources: z.array(FieldSourceSchema),
    locked: z.boolean(),
    override_value: valueSchema.nullable(),
  });
}

// Common FieldNode types
export const StringFieldNodeSchema = createFieldNodeSchema(z.string());
export const StringArrayFieldNodeSchema = createFieldNodeSchema(z.array(z.string()));
export const NumberFieldNodeSchema = createFieldNodeSchema(z.number());

export type StringFieldNode = z.infer<typeof StringFieldNodeSchema>;
export type StringArrayFieldNode = z.infer<typeof StringArrayFieldNodeSchema>;

// ============================================
// BRANDBRAIN SNAPSHOT
// ============================================

// Positioning section
export const PositioningSectionSchema = z.object({
  what_we_do: StringFieldNodeSchema,
  who_for: StringFieldNodeSchema,
  differentiators: StringArrayFieldNodeSchema,
  proof_types: StringArrayFieldNodeSchema,
});

// Voice section
export const VoiceSectionSchema = z.object({
  tone_tags: StringArrayFieldNodeSchema,
  do: StringArrayFieldNodeSchema,
  dont: StringArrayFieldNodeSchema,
  cta_policy: StringFieldNodeSchema,
  emoji_policy: StringFieldNodeSchema,
});

// Pillar item
export const PillarNodeSchema = z.object({
  name: StringFieldNodeSchema,
  description: StringFieldNodeSchema,
  themes: StringArrayFieldNodeSchema,
});

// Constraints section
export const ConstraintsSectionSchema = z.object({
  taboos: StringArrayFieldNodeSchema,
  risk_boundaries: StringArrayFieldNodeSchema,
});

// Platform profile
export const PlatformProfileSchema = z.object({
  platform: z.string(),
  tone_adjustment: StringFieldNodeSchema.optional(),
  hashtag_strategy: StringFieldNodeSchema.optional(),
  content_types: StringArrayFieldNodeSchema.optional(),
  posting_cadence: StringFieldNodeSchema.optional(),
});

// Examples section
export const ExamplesSectionSchema = z.object({
  canonical_evidence: z.array(z.string()), // evidence IDs
  user_examples: z.array(z.string()),
});

// Meta section (read-only)
export const MetaSectionSchema = z.object({
  compiled_at: z.string(),
  evidence_summary: z.object({
    total_count: z.number(),
    by_platform: z.record(z.string(), z.number()),
  }),
  missing_inputs: z.array(z.string()),
});

// Full snapshot schema
export const BrandBrainSnapshotSchema = z.object({
  id: z.string(),
  brand_id: z.string(),
  version: z.number(),
  positioning: PositioningSectionSchema,
  voice: VoiceSectionSchema,
  pillars: z.array(PillarNodeSchema),
  constraints: ConstraintsSectionSchema,
  platform_profiles: z.array(PlatformProfileSchema),
  examples: ExamplesSectionSchema,
  meta: MetaSectionSchema,
});

export type BrandBrainSnapshot = z.infer<typeof BrandBrainSnapshotSchema>;

// ============================================
// BRANDBRAIN OVERRIDES
// ============================================

export const BrandBrainOverridesSchema = z.object({
  brand_id: z.string().optional(), // optional in bootstrap responses
  overrides_json: z.record(z.string(), z.unknown()), // field_path -> override value
  pinned_paths: z.array(z.string()),
  updated_at: z.string().nullable().optional(), // can be null if never updated
});

export type BrandBrainOverrides = z.infer<typeof BrandBrainOverridesSchema>;

// Override patch request - matches backend semantics:
// - overrides_json merges; null value deletes a key
// - pinned_paths replaces entire list
export const OverridesPatchRequestSchema = z.object({
  overrides_json: z.record(z.string(), z.unknown()).optional(), // path: value | null (null deletes)
  pinned_paths: z.array(z.string()).optional(), // replaces entire list
});

export type OverridesPatchRequest = z.infer<typeof OverridesPatchRequestSchema>;

// ============================================
// COMPILE STATUS (matches backend contract)
// ============================================

// Backend status values: PENDING | RUNNING | SUCCEEDED | FAILED
export const CompileStatusValueSchema = z.enum([
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export type CompileStatusValue = z.infer<typeof CompileStatusValueSchema>;

// Backend progress shape: { stage?, sources_completed, sources_total }
export const CompileProgressSchema = z.object({
  stage: z.string().optional(),
  sources_completed: z.number(),
  sources_total: z.number(),
});

export type CompileProgress = z.infer<typeof CompileProgressSchema>;

// Evidence status item (detail about each source refresh)
export const EvidenceStatusItemSchema = z.object({
  source: z.string().optional(),
  reason: z.string().optional(),
  apify_run_id: z.string().optional(),
  apify_run_status: z.string().optional(),
  raw_items_count: z.number().optional(),
  normalized_created: z.number().optional(),
  normalized_updated: z.number().optional(),
  error: z.string().optional(),
}).passthrough();

// Evidence status (returned in compile status responses)
// Backend returns arrays of EvidenceStatusItem, not counts
export const EvidenceStatusSchema = z.object({
  total: z.number().optional(),
  completed: z.number().optional(),
  failed: z.union([z.number(), z.array(EvidenceStatusItemSchema)]).optional(),
  reused: z.union([z.number(), z.array(EvidenceStatusItemSchema)]).optional(),
  refreshed: z.union([z.number(), z.array(EvidenceStatusItemSchema)]).optional(),
  skipped: z.union([z.number(), z.array(EvidenceStatusItemSchema)]).optional(),
}).passthrough();

// Normalized evidence status for UI consumption
export interface NormalizedEvidenceStatus {
  failedCount: number;
  reusedCount: number;
  refreshedCount: number;
  skippedCount: number;
  totalCount: number;
}

// Helper to normalize evidence_status from backend response
export function normalizeEvidenceStatus(raw: z.infer<typeof EvidenceStatusSchema> | undefined): NormalizedEvidenceStatus {
  if (!raw) {
    return { failedCount: 0, reusedCount: 0, refreshedCount: 0, skippedCount: 0, totalCount: 0 };
  }

  const getCount = (val: unknown): number => {
    if (typeof val === "number") return val;
    if (Array.isArray(val)) return val.length;
    return 0;
  };

  const failedCount = getCount(raw.failed);
  const reusedCount = getCount(raw.reused);
  const refreshedCount = getCount(raw.refreshed);
  const skippedCount = getCount(raw.skipped);

  return {
    failedCount,
    reusedCount,
    refreshedCount,
    skippedCount,
    totalCount: raw.total ?? (failedCount + reusedCount + refreshedCount + skippedCount),
  };
}

// Backend compile status response (GET /compile/{id}/status)
// Shape varies by status:
// - PENDING/RUNNING: { compile_run_id, status, progress }
// - SUCCEEDED: { compile_run_id, status, evidence_status, snapshot }
// - FAILED: { compile_run_id, status, error, evidence_status }
export const CompileStatusSchema = z.object({
  compile_run_id: z.string(),
  status: CompileStatusValueSchema,
  progress: CompileProgressSchema.optional(),
  evidence_status: EvidenceStatusSchema.optional(),
  snapshot: z.object({
    snapshot_id: z.string(),
    created_at: z.string(),
    snapshot_json: z.record(z.string(), z.unknown()),
  }).optional(),
  error: z.string().optional(),
});

export type CompileStatus = z.infer<typeof CompileStatusSchema>;

// Compile trigger response (POST /compile)
// 202 kickoff: { compile_run_id, status: "PENDING"|"QUEUED", poll_url }
// 200 short-circuit: { compile_run_id, status: "UNCHANGED", snapshot: {...} }
export const CompileTriggerResponseSchema = z.object({
  compile_run_id: z.string(),
  status: z.string(), // "PENDING" | "QUEUED" | "UNCHANGED"
  poll_url: z.string().optional(),
  snapshot: z.object({
    snapshot_id: z.string(),
    brand_id: z.string(),
    created_at: z.string(),
    snapshot_json: z.record(z.string(), z.unknown()),
  }).optional(),
});

export type CompileTriggerResponse = z.infer<typeof CompileTriggerResponseSchema>;

// Compile request
export const CompileRequestSchema = z.object({
  force_refresh: z.boolean().optional(),
});

export type CompileRequest = z.infer<typeof CompileRequestSchema>;

// ============================================
// SNAPSHOT HISTORY (matches backend contract)
// ============================================

export const SnapshotHistoryItemSchema = z.object({
  snapshot_id: z.string(),
  created_at: z.string(),
  diff_summary: z.record(z.string(), z.unknown()).optional(),
});

export type SnapshotHistoryItem = z.infer<typeof SnapshotHistoryItemSchema>;

export const SnapshotHistoryResponseSchema = z.object({
  snapshots: z.array(SnapshotHistoryItemSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
});

export type SnapshotHistoryResponse = z.infer<typeof SnapshotHistoryResponseSchema>;

// ============================================
// BACKEND SNAPSHOT RESPONSE (wrapped format)
// ============================================

// Backend returns snapshot_json as a wrapper around the actual snapshot content
export const BackendSnapshotResponseSchema = z.object({
  snapshot_id: z.string(),
  brand_id: z.string(),
  snapshot_json: z.record(z.string(), z.unknown()), // contains the actual playbook content
  created_at: z.string(),
  compile_run_id: z.string().optional(),
});

export type BackendSnapshotResponse = z.infer<typeof BackendSnapshotResponseSchema>;

// Legacy compile stage enum (kept for UI stage labels, mapped from backend string)
export const CompileStageSchema = z.enum([
  "QUEUED",
  "ENSURE_EVIDENCE",
  "NORMALIZE",
  "BUNDLE",
  "LLM",
  "QA",
  "MERGE",
  "DONE",
]);

export type CompileStage = z.infer<typeof CompileStageSchema>;

// ============================================
// EVIDENCE (for provenance viewer)
// ============================================

export const BrandBrainEvidenceSchema = z.object({
  id: z.string(),
  platform: z.string(),
  content_type: z.string(),
  canonical_url: z.string().url(),
  published_at: z.string().nullable(),
  author_ref: z.string().nullable(),
  title: z.string().nullable(),
  text_primary: z.string().nullable(),
  text_secondary: z.string().nullable(),
  metrics_json: z.record(z.string(), z.unknown()),
  media_json: z.record(z.string(), z.unknown()),
});

export type BrandBrainEvidence = z.infer<typeof BrandBrainEvidenceSchema>;

// ============================================
// QUESTION CATALOG (for provenance display)
// ============================================

export interface QuestionMeta {
  id: string;
  label: string;
  tier: OnboardingTier;
  type: "text" | "array" | "enum";
}

export const QuestionCatalog: QuestionMeta[] = [
  // Tier 0
  { id: "tier0.what_we_do", label: "What does your brand do?", tier: 0, type: "text" },
  { id: "tier0.who_for", label: "Who is your target audience?", tier: 0, type: "text" },
  { id: "tier0.edge", label: "What makes you different?", tier: 0, type: "array" },
  { id: "tier0.tone_words", label: "Tone/voice words", tier: 0, type: "array" },
  { id: "tier0.taboos", label: "Topics to avoid", tier: 0, type: "array" },
  { id: "tier0.primary_goal", label: "Primary goal", tier: 0, type: "enum" },
  { id: "tier0.cta_posture", label: "CTA approach", tier: 0, type: "enum" },
  // Tier 1
  { id: "tier1.priority_platforms", label: "Priority platforms", tier: 1, type: "array" },
  { id: "tier1.pillars_seed", label: "Content pillars (seed)", tier: 1, type: "array" },
  { id: "tier1.good_examples", label: "Good content examples", tier: 1, type: "array" },
  { id: "tier1.key_pages", label: "Key website pages", tier: 1, type: "array" },
  // Tier 2
  { id: "tier2.proof_claims", label: "Proof claims", tier: 2, type: "array" },
  { id: "tier2.risk_boundaries", label: "Risk boundaries", tier: 2, type: "array" },
];

// Helper to get question metadata by ID
export function getQuestionMeta(questionId: string): QuestionMeta | undefined {
  return QuestionCatalog.find((q) => q.id === questionId);
}

// ============================================
// BRAND BOOTSTRAP (single-request page data)
// ============================================

/**
 * Lightweight snapshot reference for bootstrap response.
 * Does NOT include full snapshot_json - just metadata to know if snapshot exists.
 */
export const SnapshotRefSchema = z.object({
  snapshot_id: z.string(),
  created_at: z.string(),
  has_data: z.boolean(),
});

export type SnapshotRef = z.infer<typeof SnapshotRefSchema>;

/**
 * Backend unified bootstrap response: GET /api/brands/:id/bootstrap
 * Returns all data needed for both onboarding and strategy pages in one request.
 *
 * Note: `latest` is a lightweight reference - to get full snapshot_json,
 * fetch /api/brands/:id/brandbrain/latest separately when needed.
 */
export const BrandBootstrapResponseSchema = z.object({
  brand: BrandCoreSchema,
  onboarding: BrandOnboardingSchema,
  sources: z.array(SourceConnectionSchema),
  overrides: BrandBrainOverridesSchema.nullable(),
  latest: SnapshotRefSchema.nullable(), // null if no snapshot exists
});

export type BrandBootstrapResponse = z.infer<typeof BrandBootstrapResponseSchema>;

// ============================================
// SNAPSHOT TRANSFORMATION HELPERS
// ============================================

// Default field node factory for missing fields
function createDefaultStringFieldNode(value: string = ""): StringFieldNode {
  return {
    value,
    confidence: 0,
    sources: [],
    locked: false,
    override_value: null,
  };
}

function createDefaultStringArrayFieldNode(value: string[] = []): StringArrayFieldNode {
  return {
    value,
    confidence: 0,
    sources: [],
    locked: false,
    override_value: null,
  };
}

// Default sections for missing snapshot data
const DEFAULT_POSITIONING: BrandBrainSnapshot["positioning"] = {
  what_we_do: createDefaultStringFieldNode(),
  who_for: createDefaultStringFieldNode(),
  differentiators: createDefaultStringArrayFieldNode(),
  proof_types: createDefaultStringArrayFieldNode(),
};

const DEFAULT_VOICE: BrandBrainSnapshot["voice"] = {
  tone_tags: createDefaultStringArrayFieldNode(),
  do: createDefaultStringArrayFieldNode(),
  dont: createDefaultStringArrayFieldNode(),
  cta_policy: createDefaultStringFieldNode(),
  emoji_policy: createDefaultStringFieldNode(),
};

const DEFAULT_CONSTRAINTS: BrandBrainSnapshot["constraints"] = {
  taboos: createDefaultStringArrayFieldNode(),
  risk_boundaries: createDefaultStringArrayFieldNode(),
};

/**
 * Normalize a value to a StringFieldNode.
 * Handles various backend formats:
 * - Already a FieldNode: { value, confidence, sources, locked, override_value }
 * - Plain string
 * - Undefined/null
 */
function normalizeStringFieldNode(raw: unknown, defaultValue: string = ""): StringFieldNode {
  if (!raw) {
    return createDefaultStringFieldNode(defaultValue);
  }

  // Already a FieldNode-like object
  if (typeof raw === "object" && "value" in raw && typeof (raw as Record<string, unknown>).value === "string") {
    const obj = raw as Record<string, unknown>;
    return {
      value: obj.value as string,
      confidence: (obj.confidence as number) ?? 0.5,
      sources: Array.isArray(obj.sources) ? obj.sources as FieldSource[] : [],
      locked: (obj.locked as boolean) ?? false,
      override_value: (obj.override_value as string | null) ?? null,
    };
  }

  // Plain string
  if (typeof raw === "string") {
    return createDefaultStringFieldNode(raw);
  }

  return createDefaultStringFieldNode(defaultValue);
}

/**
 * Normalize a value to a StringArrayFieldNode.
 * Handles various backend formats:
 * - Already a FieldNode: { value: string[], confidence, sources, ... }
 * - Plain string array
 * - Array of { value, confidence } objects (backend differentiators format)
 * - Undefined/null
 */
function normalizeStringArrayFieldNode(raw: unknown, defaultValue: string[] = []): StringArrayFieldNode {
  if (!raw) {
    return createDefaultStringArrayFieldNode(defaultValue);
  }

  // Already a FieldNode-like object with value array
  if (typeof raw === "object" && !Array.isArray(raw) && "value" in raw) {
    const obj = raw as Record<string, unknown>;
    const value = Array.isArray(obj.value) ? obj.value as string[] : [];
    return {
      value,
      confidence: (obj.confidence as number) ?? 0.5,
      sources: Array.isArray(obj.sources) ? obj.sources as FieldSource[] : [],
      locked: (obj.locked as boolean) ?? false,
      override_value: (obj.override_value as string[] | null) ?? null,
    };
  }

  // Plain string array
  if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
    return createDefaultStringArrayFieldNode(raw as string[]);
  }

  // Array of { value, confidence } objects (backend differentiators format)
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && "value" in (raw[0] as object)) {
    const values = raw.map((item) => {
      const obj = item as Record<string, unknown>;
      return typeof obj.value === "string" ? obj.value : String(obj.value ?? "");
    });
    // Use average confidence if available
    const confidences = raw
      .map((item) => (item as Record<string, unknown>).confidence as number | undefined)
      .filter((c): c is number => typeof c === "number");
    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0.5;
    return {
      value: values,
      confidence: avgConfidence,
      sources: [],
      locked: false,
      override_value: null,
    };
  }

  return createDefaultStringArrayFieldNode(defaultValue);
}

/**
 * Transform backend snapshot response to frontend BrandBrainSnapshot format.
 * Backend returns: { snapshot_id, brand_id, snapshot_json: {...}, created_at }
 * Frontend expects: { id, brand_id, version, positioning, voice, ... meta: { compiled_at } }
 *
 * The snapshot_json from backend contains the actual playbook content.
 * We extract it and add meta information from the wrapper.
 *
 * NOTE: Backend schema differs from frontend schema:
 * - Backend puts taboos, risk_boundaries under voice
 * - Backend puts proof_types, content_pillars under content
 * - Backend returns differentiators as array of { value, confidence }
 * - Backend returns tone_tags as plain string array
 * We normalize all these formats to the frontend schema.
 */
export function transformBackendSnapshot(
  response: BackendSnapshotResponse
): BrandBrainSnapshot | null {
  if (!response?.snapshot_json) return null;

  const content = response.snapshot_json;
  const rawPositioning = content.positioning as Record<string, unknown> | undefined;
  const rawVoice = content.voice as Record<string, unknown> | undefined;
  const rawConstraints = content.constraints as Record<string, unknown> | undefined;
  const rawContent = content.content as Record<string, unknown> | undefined;

  // Build meta from wrapper + content
  const contentMeta = content.meta as Record<string, unknown> | undefined;
  const evidenceSummary = contentMeta?.evidence_summary as Record<string, unknown> | undefined;
  const meta = {
    compiled_at: response.created_at,
    evidence_summary: {
      total_count: (evidenceSummary?.total_count as number) ?? (evidenceSummary?.item_count as number) ?? 0,
      by_platform: (evidenceSummary?.by_platform as Record<string, number>) ?? {},
    },
    missing_inputs: (contentMeta?.missing_inputs as string[]) ?? [],
  };

  // Build positioning with normalization for different backend formats
  // Backend may have proof_types under content instead of positioning
  const positioning: BrandBrainSnapshot["positioning"] = {
    what_we_do: normalizeStringFieldNode(rawPositioning?.what_we_do),
    who_for: normalizeStringFieldNode(rawPositioning?.who_for),
    differentiators: normalizeStringArrayFieldNode(rawPositioning?.differentiators),
    proof_types: normalizeStringArrayFieldNode(
      rawPositioning?.proof_types ?? rawContent?.proof_types
    ),
  };

  // Build voice with normalization
  // Backend may have tone_tags as plain string array
  const voice: BrandBrainSnapshot["voice"] = {
    tone_tags: normalizeStringArrayFieldNode(rawVoice?.tone_tags),
    do: normalizeStringArrayFieldNode(rawVoice?.do),
    dont: normalizeStringArrayFieldNode(rawVoice?.dont),
    cta_policy: normalizeStringFieldNode(rawVoice?.cta_policy),
    emoji_policy: normalizeStringFieldNode(rawVoice?.emoji_policy),
  };

  // Build constraints with normalization
  // Backend may have taboos and risk_boundaries under voice instead of constraints
  const constraints: BrandBrainSnapshot["constraints"] = {
    taboos: normalizeStringArrayFieldNode(
      rawConstraints?.taboos ?? rawVoice?.taboos
    ),
    risk_boundaries: normalizeStringArrayFieldNode(
      rawConstraints?.risk_boundaries ?? rawVoice?.risk_boundaries
    ),
  };

  // Build pillars from content.content_pillars if available
  // Backend format: { name, description } objects
  let pillars: BrandBrainSnapshot["pillars"] = [];
  const rawPillars = content.pillars ?? rawContent?.content_pillars;
  if (Array.isArray(rawPillars)) {
    pillars = rawPillars.map((pillar, index) => {
      const p = pillar as Record<string, unknown>;
      return {
        name: normalizeStringFieldNode(p.name),
        description: normalizeStringFieldNode(p.description),
        themes: normalizeStringArrayFieldNode(p.themes),
      };
    });
  }

  // Build the snapshot with all normalized fields
  const snapshot: BrandBrainSnapshot = {
    id: response.snapshot_id,
    brand_id: response.brand_id,
    version: (content.version as number) ?? 1,
    positioning,
    voice,
    pillars,
    constraints,
    platform_profiles: (content.platform_profiles as BrandBrainSnapshot["platform_profiles"]) ?? [],
    examples: (content.examples as BrandBrainSnapshot["examples"]) ?? {
      canonical_evidence: [],
      user_examples: [],
    },
    meta,
  };

  // Validate the result (should pass now with normalization)
  const result = BrandBrainSnapshotSchema.safeParse(snapshot);
  if (!result.success) {
    console.warn("Snapshot transformation validation failed:", result.error.issues);
    // Return the snapshot anyway for graceful degradation
    return snapshot;
  }

  return result.data;
}
