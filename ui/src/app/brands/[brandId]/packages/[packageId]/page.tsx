import { notFound } from "next/navigation";
import Link from "next/link";
import { KTag } from "@/components/ui";
import {
  ChannelVariantsPanel,
  BrandBrainPanel,
  SourceOpportunityCard,
  PackageSummaryCard,
} from "@/components/packages";
import { mockApi, NotFoundError, type ContentPackageWithEvidence } from "@/lib/mockApi";

interface PackageDetailPageProps {
  params: Promise<{ brandId: string; packageId: string }>;
}

// Map quality band to tag variants
const bandVariants: Record<string, "muted" | "campaign" | "default" | "evergreen"> = {
  good: "evergreen",
  partial: "campaign",
  needs_work: "muted",
};

const bandLabels: Record<string, string> = {
  good: "Good",
  partial: "In Progress",
  needs_work: "Needs Work",
};

const channelLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { brandId, packageId } = await params;

  let brand;
  let pkg: ContentPackageWithEvidence;

  try {
    brand = mockApi.getBrand(brandId);
    pkg = mockApi.getPackage(brandId, packageId);
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

  const opportunityTitle = mockApi.getOpportunityTitle(pkg.opportunity_id);

  // Get first channel for pattern suggestions
  const firstDeliverable = pkg.deliverables[0];
  const channelForPatterns = firstDeliverable?.channel || "x";
  const suggestedPatterns = mockApi.listPatternsByChannel(channelForPatterns);

  // Get unique channels from deliverables
  const channels = [...new Set(pkg.deliverables.map((d) => d.channel))];

  // Build voice object for BrandBrainPanel
  const brandVoice = {
    summary: brand.format_playbook.map((fp) => fp.why_it_works).join(" "),
    toneTags: brand.voice_traits,
    nevers: brand.guardrails.dont,
    primaryChannel: channels[0] || "x",
    primaryPersona: brand.personas[0] || "social manager",
  };

  // Adapt package for existing components
  // TODO(spec): adapt to spec structure
  const adaptedPkg = {
    ...pkg,
    // Map new fields to old component expectations
    persona: pkg.variants[0]?.channel || "social manager",
    pillar: pkg.format,
    channels: channels,
    supportingPoints: pkg.outline_beats,
    status: pkg.quality.band === "good" ? "published" : pkg.quality.band === "partial" ? "in_review" : "draft",
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <header className="space-y-2">
        {/* Title row */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold text-kairo-ink-900">
            {pkg.title}
          </h1>
          <KTag variant={bandVariants[pkg.quality.band] || "muted"} className="uppercase text-xs">
            {bandLabels[pkg.quality.band] || pkg.quality.band}
          </KTag>
        </div>

        {/* Meta row: opportunity link + format + channels */}
        <div className="flex items-center gap-2 text-sm text-kairo-ink-500 flex-wrap">
          {opportunityTitle && (
            <>
              <span className="text-kairo-ink-400">From:</span>
              <Link
                href={`/brands/${brandId}/today`}
                className="text-kairo-aqua-600 hover:text-kairo-aqua-700 hover:underline"
              >
                {opportunityTitle}
              </Link>
              <span className="text-kairo-ink-300">·</span>
            </>
          )}
          <span className="capitalize">{pkg.format.replace(/_/g, " ")}</span>
          <span className="text-kairo-ink-300">·</span>
          <div className="flex items-center gap-1">
            {channels.map((channel) => (
              <span
                key={channel}
                className={[
                  "inline-flex items-center",
                  "px-1.5 py-0.5",
                  "rounded-(--kairo-radius-xs)",
                  "text-xs",
                  "bg-kairo-sand-75 text-kairo-ink-600",
                  "border border-kairo-border-subtle",
                ].join(" ")}
              >
                {channelLabels[channel] || channel}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 3-column workspace grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-5">
        {/* LEFT COLUMN: Package + Opportunity summary */}
        <aside className="space-y-4 order-2 lg:order-1">
          <PackageSummaryCard pkg={adaptedPkg} />

          {opportunity && (
            <SourceOpportunityCard opportunity={opportunity} brandId={brandId} />
          )}
        </aside>

        {/* CENTER COLUMN: Channel variants workspace */}
        <main className="order-1 lg:order-2">
          <ChannelVariantsPanel channels={channels} variants={pkg.variants} />
        </main>

        {/* RIGHT COLUMN: Brand brain & pattern hints */}
        <aside className="order-3">
          <BrandBrainPanel voice={brandVoice} patterns={suggestedPatterns} />
        </aside>
      </div>
    </div>
  );
}
