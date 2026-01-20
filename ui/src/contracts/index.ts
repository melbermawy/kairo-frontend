// src/contracts/index.ts
// Zod schemas for runtime validation of fixture data and API responses
// Based on: docs/fixtures/wendys_pack_spec.md

import { z } from "zod";

// Re-export all BrandBrain contracts
export * from "./brandbrain";

// ============================================
// FORMAT TAXONOMY
// ============================================

export const FormatTaxonomySchema = z.enum([
  "shortform_video",
  "meme_static",
  "carousel",
  "thread",
  "comment_stunt",
  "founder_voice_post",
]);

export type FormatTaxonomy = z.infer<typeof FormatTaxonomySchema>;

// ============================================
// EVIDENCE ITEM
// ============================================

export const EvidencePlatformSchema = z.enum([
  "tiktok",
  "instagram",
  "x",
  "linkedin",
  "reddit",
  "web",
]);

export const EvidenceContentTypeSchema = z.enum([
  "video",
  "image",
  "text",
  "link",
]);

export const EvidenceFormatSchema = z.enum([
  "short_video",
  "meme",
  "thread",
  "carousel",
  "post",
]);

export const ClusterKeyTypeSchema = z.enum([
  "audio_id",
  "hashtag",
  "phrase",
  "entity",
]);

export const ClusterKeyRoleSchema = z.enum(["primary", "secondary"]);

export const ClusterKeySchema = z.object({
  type: ClusterKeyTypeSchema,
  value: z.string(),
  role: ClusterKeyRoleSchema,
});

export const EvidenceMetricsSchema = z.object({
  views: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
});

export const EvidenceExtractedSchema = z.object({
  entities: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  audio_title: z.string().optional(),
});

export const EvidenceItemSchema = z.object({
  id: z.string(),
  platform: EvidencePlatformSchema,
  content_type: EvidenceContentTypeSchema,
  format: EvidenceFormatSchema.optional(),
  canonical_url: z.string().url(),
  thumbnail_url: z.string().url().nullable().optional(),
  author_handle: z.string().nullable().optional(),
  created_at: z.string(), // ISO 8601
  captured_at: z.string().optional(), // When Kairo captured this evidence
  caption: z.string().optional(),
  metrics: EvidenceMetricsSchema,
  cluster_keys: z.array(ClusterKeySchema),
  extracted: EvidenceExtractedSchema.optional(),
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type EvidencePlatform = z.infer<typeof EvidencePlatformSchema>;
export type EvidenceFormat = z.infer<typeof EvidenceFormatSchema>;

// ============================================
// BRAND
// ============================================

export const FormatPlaybookEntrySchema = z.object({
  format: FormatTaxonomySchema,
  why_it_works: z.string(),
  examples: z.array(z.string()),
});

export const BrandGuardrailsSchema = z.object({
  do: z.array(z.string()),
  dont: z.array(z.string()),
});

export const BrandSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  vertical: z.string(),
  voice_traits: z.array(z.string()),
  pillars: z.array(z.string()),
  personas: z.array(z.string()),
  guardrails: BrandGuardrailsSchema,
  format_playbook: z.array(FormatPlaybookEntrySchema),
});

export type Brand = z.infer<typeof BrandSchema>;

// ============================================
// OPPORTUNITY
// ============================================

export const OpportunityTypeSchema = z.enum(["trend", "evergreen", "competitive"]);

export const OpportunityStatusSchema = z.enum([
  "new",
  "saved",
  "packaged",
  "dismissed",
]);

export const OpportunityLifecycleSchema = z.enum([
  "seed",
  "rising",
  "peaking",
  "declining",
  "evergreen",
  "active",
]);

export const TrendKernelKindSchema = z.enum(["audio", "hashtag", "phrase"]);

export const TrendKernelSchema = z.object({
  kind: TrendKernelKindSchema,
  value: z.string(),
});

export const BrandFitSchema = z.object({
  persona: z.string(),
  pillar: z.string(),
  voice_reason: z.string(),
});

export const OpportunitySignalsSchema = z.object({
  velocity_label: z.string(),
  lifecycle: z.string(),
  confidence: z.string(),
});

export const OpportunitySchema = z.object({
  id: z.string(),
  type: OpportunityTypeSchema,
  score: z.number().min(0).max(100),
  title: z.string(),
  hook: z.string(),
  why_now: z.array(z.string()),
  why_now_summary: z.string().optional(), // Single line summary for cards
  lifecycle: OpportunityLifecycleSchema.optional(),
  trend_kernel: TrendKernelSchema.optional(),
  platforms: z.array(EvidencePlatformSchema).optional(), // Derived from evidence
  format_target: z.array(FormatTaxonomySchema),
  brand_fit: BrandFitSchema,
  evidence_ids: z.array(z.string()),
  signals: OpportunitySignalsSchema,
  status: OpportunityStatusSchema,
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export type OpportunityLifecycle = z.infer<typeof OpportunityLifecycleSchema>;
export type TrendKernel = z.infer<typeof TrendKernelSchema>;

// Hydrated opportunity with full evidence objects
export const OpportunityWithEvidenceSchema = OpportunitySchema.extend({
  evidence: z.array(EvidenceItemSchema),
});

export type OpportunityWithEvidence = z.infer<typeof OpportunityWithEvidenceSchema>;

// ============================================
// CONCEPT DRAFT (for concept builder)
// ============================================

export const ConceptDraftSchema = z.object({
  one_liner: z.string(),
  core_argument: z.string(),
  beats: z.array(z.string()),
  proof_points: z.array(z.string()),
  selected_channels: z.array(z.enum(["x", "linkedin", "instagram", "tiktok"])),
  opportunity_id: z.string().nullable().optional(),
});

export type ConceptDraft = z.infer<typeof ConceptDraftSchema>;

// ============================================
// CONTENT PACKAGE
// ============================================

export const PackageChannelSchema = z.enum([
  "x",
  "linkedin",
  "instagram",
  "tiktok",
]);

export const VariantStatusSchema = z.enum(["draft", "edited", "approved"]);

export const VariantSchema = z.object({
  id: z.string(),
  channel: PackageChannelSchema,
  status: VariantStatusSchema,
  body: z.string(),
  notes: z.string().optional(),
  score: z.number().optional(),
});

export type Variant = z.infer<typeof VariantSchema>;
export type PackageChannel = z.infer<typeof PackageChannelSchema>;

export const DeliverableSchema = z.object({
  channel: PackageChannelSchema,
  variant_id: z.string(),
  label: z.string(),
});

export const QualityBandSchema = z.enum(["good", "partial", "needs_work"]);

export const QualitySchema = z.object({
  score: z.number(),
  band: QualityBandSchema,
  issues: z.array(z.string()),
});

export const ContentPackageSchema = z.object({
  id: z.string(),
  opportunity_id: z.string().nullable(),
  title: z.string(),
  thesis: z.string(),
  outline_beats: z.array(z.string()),
  cta: z.string(),
  format: FormatTaxonomySchema,
  deliverables: z.array(DeliverableSchema),
  variants: z.array(VariantSchema),
  evidence_refs: z.array(z.string()),
  quality: QualitySchema,
});

export type ContentPackage = z.infer<typeof ContentPackageSchema>;

// Hydrated package with full evidence objects
export const ContentPackageWithEvidenceSchema = ContentPackageSchema.extend({
  evidence: z.array(EvidenceItemSchema),
});

export type ContentPackageWithEvidence = z.infer<
  typeof ContentPackageWithEvidenceSchema
>;

// ============================================
// PATTERN (kept from existing, may need spec alignment)
// ============================================

export const PatternStatusSchema = z.enum([
  "active",
  "experimental",
  "deprecated",
]);

export const PatternCategorySchema = z.enum([
  "evergreen",
  "launch",
  "education",
  "engagement",
]);

export const PatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  structure: z.string(),
  beats: z.array(z.string()),
  exampleHook: z.string(),
  usageCount: z.number(),
  avgEngagement: z.number(),
  channels: z.array(z.string()),
  performanceHint: z.string(),
  status: PatternStatusSchema,
  category: PatternCategorySchema,
  lastUsedDaysAgo: z.number(),
});

export type Pattern = z.infer<typeof PatternSchema>;
export type PatternCategory = z.infer<typeof PatternCategorySchema>;
export type PatternStatus = z.infer<typeof PatternStatusSchema>;

// ============================================
// TODAY BOARD (composed DTO for the Today page)
// ============================================

export const TodayBoardSchema = z.object({
  brand: BrandSchema,
  opportunities: z.array(OpportunitySchema),
  // Metrics computed from packages
  metrics: z.object({
    packagesInProgress: z.number(),
    postsScheduled: z.number(),
    publishedThisWeek: z.number(),
  }),
});

export type TodayBoard = z.infer<typeof TodayBoardSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate data against a schema and throw ContractError on failure.
 * Use this in mockApi to ensure we return valid shapes.
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new ContractError(`${context}: ${issues}`);
  }
  return result.data;
}

/**
 * Error thrown when data doesn't match expected contract.
 */
export class ContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractError";
  }
}
