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
  brand_id: z.string(),
  tier: OnboardingTierSchema,
  answers_json: z.record(z.string(), z.unknown()),
  updated_at: z.string(),
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
  settings_json: z.record(z.string(), z.unknown()),
  updated_at: z.string(),
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

export const FieldSourceSchema = z.union([
  FieldSourceAnswerSchema,
  FieldSourceEvidenceSchema,
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
  brand_id: z.string(),
  overrides_json: z.record(z.string(), z.unknown()), // field_path -> override value
  pinned_paths: z.array(z.string()),
  updated_at: z.string(),
});

export type BrandBrainOverrides = z.infer<typeof BrandBrainOverridesSchema>;

// Override patch request
export const OverridesPatchRequestSchema = z.object({
  set_overrides: z.record(z.string(), z.unknown()).optional(),
  remove_overrides: z.array(z.string()).optional(),
  pin_paths: z.array(z.string()).optional(),
  unpin_paths: z.array(z.string()).optional(),
});

export type OverridesPatchRequest = z.infer<typeof OverridesPatchRequestSchema>;

// ============================================
// COMPILE STATUS
// ============================================

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

export const CompileStatusValueSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export type CompileStatusValue = z.infer<typeof CompileStatusValueSchema>;

export const CompileProgressSchema = z.object({
  stage: CompileStageSchema,
  percent: z.number().min(0).max(100),
});

export const CompileStatusSchema = z.object({
  compile_run_id: z.string(),
  status: CompileStatusValueSchema,
  progress: CompileProgressSchema,
  started_at: z.string(),
  updated_at: z.string(),
  error: z.string().nullable(),
});

export type CompileStatus = z.infer<typeof CompileStatusSchema>;

// Compile request
export const CompileRequestSchema = z.object({
  force_refresh: z.boolean().optional(),
});

export type CompileRequest = z.infer<typeof CompileRequestSchema>;

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
