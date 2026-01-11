// src/lib/mockApi/types.ts
// Re-export all types inferred from zod schemas

export type {
  Brand,
  EvidenceItem,
  EvidencePlatform,
  EvidenceFormat,
  Opportunity,
  OpportunityWithEvidence,
  OpportunityLifecycle,
  TrendKernel,
  ContentPackage,
  ContentPackageWithEvidence,
  Pattern,
  TodayBoard,
  Variant,
  FormatTaxonomy,
  PatternCategory,
  PatternStatus,
  ConceptDraft,
  PackageChannel,
} from "@/contracts";

// Infer OpportunityType from schema (not exported from contracts yet)
import { OpportunityTypeSchema } from "@/contracts";
import { z } from "zod";

export type OpportunityType = z.infer<typeof OpportunityTypeSchema>;

// Re-export schemas for use in components
export {
  OpportunityTypeSchema,
  OpportunityStatusSchema,
  OpportunityLifecycleSchema,
  TrendKernelSchema,
  EvidencePlatformSchema,
  EvidenceFormatSchema,
  PatternCategorySchema,
  PatternStatusSchema,
  PackageChannelSchema,
  VariantStatusSchema,
  FormatTaxonomySchema,
  QualityBandSchema,
  ConceptDraftSchema,
} from "@/contracts";
