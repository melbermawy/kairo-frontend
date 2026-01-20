import { notFound } from "next/navigation";
import { mockApi, NotFoundError, type ContentPackageWithEvidence } from "@/lib/mockApi";
import { PackageDetailClient } from "@/components/packages";

interface PackageDetailPageProps {
  params: Promise<{ brandId: string; packageId: string }>;
  searchParams: Promise<{
    // For concept-based package creation
    one_liner?: string;
    core_argument?: string;
    beats?: string;
    proof_points?: string;
    channels?: string;
    opportunityId?: string;
  }>;
}

export default async function PackageDetailPage({ params, searchParams }: PackageDetailPageProps) {
  const { brandId, packageId } = await params;
  const query = await searchParams;

  let brand;
  let pkg: ContentPackageWithEvidence;

  try {
    brand = mockApi.getBrand(brandId);

    // Check if this is a "new from opportunity" request
    if (packageId.startsWith("new-from-opp-")) {
      pkg = mockApi.getOrCreatePackageFromOpportunity(brandId, packageId);
    }
    // Check if this is a "new from concept" request with query params
    else if (packageId.startsWith("new-from-concept") && query.channels) {
      const conceptData = {
        one_liner: query.one_liner || "",
        core_argument: query.core_argument || "",
        beats: query.beats ? query.beats.split("|") : [],
        proof_points: query.proof_points ? query.proof_points.split("|") : [],
        selected_channels: query.channels ? query.channels.split(",") : ["x"],
        opportunity_id: query.opportunityId || null,
      };
      pkg = mockApi.getOrCreatePackageFromConcept(brandId, packageId, conceptData);
    }
    // Regular package lookup
    else {
      pkg = mockApi.getPackage(brandId, packageId);
    }
  } catch (e) {
    if (e instanceof NotFoundError) {
      notFound();
    }
    throw e;
  }

  // Get opportunity if linked
  let opportunity = null;
  if (pkg.opportunity_id) {
    try {
      opportunity = mockApi.getOpportunity(brandId, pkg.opportunity_id);
    } catch {
      // Opportunity not found, that's ok
    }
  }

  // Get first channel for pattern suggestions
  const firstDeliverable = pkg.deliverables[0];
  const channelForPatterns = firstDeliverable?.channel || "x";
  const suggestedPatterns = mockApi.listPatternsByChannel(channelForPatterns);

  // Build voice object for ContextPanel
  const brandVoice = {
    summary: brand.format_playbook.map((fp) => fp.why_it_works).join(" "),
    toneTags: brand.voice_traits,
    nevers: brand.guardrails.dont,
  };

  // Serialize data for client component
  const pageData = {
    brandId,
    pkg: {
      id: pkg.id,
      title: pkg.title,
      thesis: pkg.thesis,
      outlineBeats: pkg.outline_beats,
      cta: pkg.cta,
      format: pkg.format,
      quality: pkg.quality,
      variants: pkg.variants,
    },
    opportunity: opportunity
      ? {
          id: opportunity.id,
          title: opportunity.title,
          score: opportunity.score,
          type: opportunity.type,
          hook: opportunity.hook,
          why_now: opportunity.why_now,
          why_now_summary: opportunity.why_now_summary,
          lifecycle: opportunity.lifecycle,
          trend_kernel: opportunity.trend_kernel,
          platforms: opportunity.platforms,
          format_target: opportunity.format_target,
          brand_fit: opportunity.brand_fit,
          evidence_ids: opportunity.evidence_ids,
          signals: opportunity.signals,
          status: opportunity.status,
          evidence: opportunity.evidence,
        }
      : null,
    guardrails: brand.guardrails,
    voice: brandVoice,
    patterns: suggestedPatterns,
  };

  return <PackageDetailClient {...pageData} />;
}
