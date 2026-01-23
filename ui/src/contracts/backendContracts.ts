/**
 * Backend API Contracts - Single Source of Truth
 *
 * These types match the backend DTOs EXACTLY as defined in kairo/hero/dto.py.
 * DO NOT add fields that don't exist in the backend.
 * DO NOT rename fields.
 * DO NOT add enrichment or invented semantics.
 *
 * Per convergence_plan.md Phase 1.
 */

import { z } from "zod";

// =============================================================================
// ENUMS (match backend kairo/core/enums.py)
// =============================================================================

export const TodayBoardStateSchema = z.enum([
  "not_generated_yet",
  "generating",
  "ready",
  "insufficient_evidence",
  "error",
]);
export type TodayBoardState = z.infer<typeof TodayBoardStateSchema>;

export const OpportunityTypeSchema = z.enum([
  "trend",
  "evergreen",
  "competitive",
  "campaign",
]);
export type OpportunityType = z.infer<typeof OpportunityTypeSchema>;

export const ChannelSchema = z.enum([
  "linkedin",
  "x",
  "instagram",
  "tiktok",
  "youtube",
  "newsletter",
  "blog",
  "podcast",
]);
export type Channel = z.infer<typeof ChannelSchema>;

export const CreatedViaSchema = z.enum([
  "ai_suggested",
  "manual",
  "import",
]);
export type CreatedVia = z.infer<typeof CreatedViaSchema>;

// =============================================================================
// EVIDENCE PREVIEW DTO (PR-5)
// =============================================================================

export const EvidencePreviewDTOSchema = z.object({
  id: z.string().uuid(),
  platform: z.string(),
  canonical_url: z.string(),
  author_ref: z.string(),
  text_snippet: z.string(),
  has_transcript: z.boolean(),
});
export type EvidencePreviewDTO = z.infer<typeof EvidencePreviewDTOSchema>;

// =============================================================================
// OPPORTUNITY DTO
// =============================================================================

export const OpportunityDTOSchema = z.object({
  id: z.string().uuid(),
  brand_id: z.string().uuid(),
  title: z.string(),
  angle: z.string(),
  why_now: z.string(), // Single string, NOT array
  type: OpportunityTypeSchema,
  primary_channel: ChannelSchema,
  score: z.number(),
  score_explanation: z.string().nullable().optional(),
  source: z.string().optional().default(""),
  source_url: z.string().nullable().optional(),
  persona_id: z.string().uuid().nullable().optional(),
  pillar_id: z.string().uuid().nullable().optional(),
  suggested_channels: z.array(ChannelSchema).optional().default([]),
  evidence_ids: z.array(z.string().uuid()).optional().default([]),
  evidence_preview: z.array(EvidencePreviewDTOSchema).optional().default([]),
  is_pinned: z.boolean().optional().default(false),
  is_snoozed: z.boolean().optional().default(false),
  snoozed_until: z.string().nullable().optional(),
  created_via: CreatedViaSchema.optional().default("ai_suggested"),
  created_at: z.string(),
  updated_at: z.string(),
});
export type OpportunityDTO = z.infer<typeof OpportunityDTOSchema>;

// =============================================================================
// BRAND SNAPSHOT DTO
// =============================================================================

export const PersonaDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.string().nullable().optional(),
  summary: z.string().optional().default(""),
  priorities: z.array(z.string()).optional().default([]),
  pains: z.array(z.string()).optional().default([]),
  success_metrics: z.array(z.string()).optional().default([]),
  channel_biases: z.record(z.string(), z.string()).optional().default({}),
});
export type PersonaDTO = z.infer<typeof PersonaDTOSchema>;

export const PillarDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string().nullable().optional(),
  description: z.string().optional().default(""),
  priority_rank: z.number().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});
export type PillarDTO = z.infer<typeof PillarDTOSchema>;

export const BrandSnapshotDTOSchema = z.object({
  brand_id: z.string().uuid(),
  brand_name: z.string(),
  positioning: z.string().nullable().optional(),
  pillars: z.array(PillarDTOSchema).optional().default([]),
  personas: z.array(PersonaDTOSchema).optional().default([]),
  voice_tone_tags: z.array(z.string()).optional().default([]),
  taboos: z.array(z.string()).optional().default([]),
});
export type BrandSnapshotDTO = z.infer<typeof BrandSnapshotDTOSchema>;

// =============================================================================
// EVIDENCE SHORTFALL DTO
// =============================================================================

export const EvidenceShortfallDTOSchema = z.object({
  required_items: z.number(),
  found_items: z.number(),
  required_platforms: z.array(z.string()).optional().default([]),
  found_platforms: z.array(z.string()).optional().default([]),
  missing_platforms: z.array(z.string()).optional().default([]),
  transcript_coverage: z.number().optional().default(0),
  min_transcript_coverage: z.number().optional().default(0.3),
});
export type EvidenceShortfallDTO = z.infer<typeof EvidenceShortfallDTOSchema>;

// =============================================================================
// TODAY BOARD META DTO
// =============================================================================

export const TodayBoardMetaDTOSchema = z.object({
  generated_at: z.string(),
  source: z.string().optional().default("hero_f1_v2"),
  state: TodayBoardStateSchema,
  job_id: z.string().nullable().optional(),
  // Phase 3: Progress tracking for UI indicators
  progress_stage: z.string().nullable().optional(),
  progress_detail: z.string().nullable().optional(),
  ready_reason: z.string().nullable().optional(),
  cache_hit: z.boolean().optional().default(false),
  cache_key: z.string().nullable().optional(),
  cache_ttl_seconds: z.number().nullable().optional(),
  degraded: z.boolean().optional().default(false),
  reason: z.string().nullable().optional(),
  remediation: z.string().nullable().optional(),
  evidence_shortfall: EvidenceShortfallDTOSchema.nullable().optional(),
  total_candidates: z.number().nullable().optional(),
  opportunity_count: z.number().optional().default(0),
  notes: z.array(z.string()).optional().default([]),
  wall_time_ms: z.number().nullable().optional(),
  evidence_fetch_ms: z.number().nullable().optional(),
  llm_synthesis_ms: z.number().nullable().optional(),
  llm_scoring_ms: z.number().nullable().optional(),
  dominant_pillar: z.string().nullable().optional(),
  dominant_persona: z.string().nullable().optional(),
  channel_mix: z.record(z.string(), z.number()).optional().default({}),
});
export type TodayBoardMetaDTO = z.infer<typeof TodayBoardMetaDTOSchema>;

// =============================================================================
// TODAY BOARD DTO (main response)
// =============================================================================

export const TodayBoardDTOSchema = z.object({
  brand_id: z.string().uuid(),
  snapshot: BrandSnapshotDTOSchema,
  opportunities: z.array(OpportunityDTOSchema),
  meta: TodayBoardMetaDTOSchema,
});
export type TodayBoardDTO = z.infer<typeof TodayBoardDTOSchema>;

// =============================================================================
// REGENERATE RESPONSE DTO
// =============================================================================

export const RegenerateResponseDTOSchema = z.object({
  status: z.literal("accepted"),
  job_id: z.string(),
  poll_url: z.string(),
});
export type RegenerateResponseDTO = z.infer<typeof RegenerateResponseDTOSchema>;

// =============================================================================
// VALIDATION HELPER
// =============================================================================

export function validateTodayBoardResponse(data: unknown): TodayBoardDTO {
  return TodayBoardDTOSchema.parse(data);
}
