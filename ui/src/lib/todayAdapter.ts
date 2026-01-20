/**
 * Today Board Adapter Layer
 *
 * Maps backend TodayBoardDTO to slim UI types for rendering.
 * Per convergence_plan.md Phase 1:
 * - No enrichment, no invented fields
 * - Thin mapping only for label display (e.g., angle -> "Hook" label is UI concern)
 *
 * This adapter exists because:
 * 1. UI components need slightly different field names (snake_case -> camelCase)
 * 2. Some UI components expect optional fields to have defaults
 * 3. We want to isolate UI from backend schema changes
 */

import type {
  TodayBoardDTO,
  OpportunityDTO,
  EvidencePreviewDTO,
  BrandSnapshotDTO,
  TodayBoardMetaDTO,
  TodayBoardState,
  Channel,
} from "@/contracts/backendContracts";

// =============================================================================
// UI TYPES (slim versions for rendering)
// These match what the pruned components will expect
// =============================================================================

/**
 * Evidence preview for UI - matches backend exactly, just typed for components.
 */
export interface UIEvidencePreview {
  id: string;
  platform: string;
  canonicalUrl: string;
  authorRef: string;
  textSnippet: string;
  hasTranscript: boolean;
}

/**
 * Opportunity for UI rendering - only fields from backend DTO.
 * NO lifecycle, NO trend_kernel, NO signals, NO brand_fit object.
 */
export interface UIOpportunity {
  id: string;
  brandId: string;
  title: string;
  angle: string; // Backend field (UI can display as "Hook" label)
  whyNow: string; // Single string, not array
  type: "trend" | "evergreen" | "competitive" | "campaign";
  primaryChannel: Channel;
  suggestedChannels: Channel[];
  score: number;
  scoreExplanation: string | null;
  // Evidence
  evidenceIds: string[];
  evidencePreview: UIEvidencePreview[];
  // IDs for pillar/persona lookup (not inline objects)
  personaId: string | null;
  pillarId: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Brand snapshot for UI - provides context for pillar/persona resolution.
 */
export interface UIBrandSnapshot {
  brandId: string;
  brandName: string;
  positioning: string | null;
  pillars: Array<{ id: string; name: string }>;
  personas: Array<{ id: string; name: string }>;
  voiceToneTags: string[];
}

/**
 * Today board meta for UI - state machine info.
 */
export interface UITodayBoardMeta {
  state: TodayBoardState;
  generatedAt: string;
  jobId: string | null;
  opportunityCount: number;
  cacheHit: boolean;
  // Degraded state info
  degraded: boolean;
  remediation: string | null;
  notes: string[];
}

/**
 * Complete Today board for UI.
 */
export interface UITodayBoard {
  brandId: string;
  snapshot: UIBrandSnapshot;
  opportunities: UIOpportunity[];
  meta: UITodayBoardMeta;
}

// =============================================================================
// ADAPTER FUNCTIONS
// =============================================================================

/**
 * Convert backend EvidencePreviewDTO to UI format.
 */
export function adaptEvidencePreview(dto: EvidencePreviewDTO): UIEvidencePreview {
  return {
    id: dto.id,
    platform: dto.platform,
    canonicalUrl: dto.canonical_url,
    authorRef: dto.author_ref,
    textSnippet: dto.text_snippet,
    hasTranscript: dto.has_transcript,
  };
}

/**
 * Convert backend OpportunityDTO to UI format.
 */
export function adaptOpportunity(dto: OpportunityDTO): UIOpportunity {
  return {
    id: dto.id,
    brandId: dto.brand_id,
    title: dto.title,
    angle: dto.angle,
    whyNow: dto.why_now,
    type: dto.type,
    primaryChannel: dto.primary_channel,
    suggestedChannels: dto.suggested_channels || [],
    score: dto.score,
    scoreExplanation: dto.score_explanation ?? null,
    evidenceIds: dto.evidence_ids || [],
    evidencePreview: (dto.evidence_preview || []).map(adaptEvidencePreview),
    personaId: dto.persona_id ?? null,
    pillarId: dto.pillar_id ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

/**
 * Convert backend BrandSnapshotDTO to UI format.
 */
export function adaptBrandSnapshot(dto: BrandSnapshotDTO): UIBrandSnapshot {
  return {
    brandId: dto.brand_id,
    brandName: dto.brand_name,
    positioning: dto.positioning ?? null,
    pillars: (dto.pillars || []).map((p) => ({ id: p.id, name: p.name })),
    personas: (dto.personas || []).map((p) => ({ id: p.id, name: p.name })),
    voiceToneTags: dto.voice_tone_tags || [],
  };
}

/**
 * Convert backend TodayBoardMetaDTO to UI format.
 */
export function adaptTodayBoardMeta(dto: TodayBoardMetaDTO): UITodayBoardMeta {
  return {
    state: dto.state,
    generatedAt: dto.generated_at,
    jobId: dto.job_id ?? null,
    opportunityCount: dto.opportunity_count || 0,
    cacheHit: dto.cache_hit || false,
    degraded: dto.degraded || false,
    remediation: dto.remediation ?? null,
    notes: dto.notes || [],
  };
}

/**
 * Convert backend TodayBoardDTO to UI format.
 * This is the main entry point for the adapter.
 */
export function adaptTodayBoard(dto: TodayBoardDTO): UITodayBoard {
  return {
    brandId: dto.brand_id,
    snapshot: adaptBrandSnapshot(dto.snapshot),
    opportunities: dto.opportunities.map(adaptOpportunity),
    meta: adaptTodayBoardMeta(dto.meta),
  };
}

// =============================================================================
// HELPER: Resolve pillar/persona names from snapshot
// =============================================================================

/**
 * Get pillar name by ID from snapshot.
 */
export function getPillarName(
  snapshot: UIBrandSnapshot,
  pillarId: string | null
): string | null {
  if (!pillarId) return null;
  const pillar = snapshot.pillars.find((p) => p.id === pillarId);
  return pillar?.name ?? null;
}

/**
 * Get persona name by ID from snapshot.
 */
export function getPersonaName(
  snapshot: UIBrandSnapshot,
  personaId: string | null
): string | null {
  if (!personaId) return null;
  const persona = snapshot.personas.find((p) => p.id === personaId);
  return persona?.name ?? null;
}

/**
 * Get all unique platforms from opportunity evidence.
 */
export function getOpportunityPlatforms(opp: UIOpportunity): string[] {
  const platforms = new Set<string>();
  // Add primary channel
  platforms.add(opp.primaryChannel);
  // Add platforms from evidence
  for (const ev of opp.evidencePreview) {
    platforms.add(ev.platform);
  }
  return Array.from(platforms);
}
