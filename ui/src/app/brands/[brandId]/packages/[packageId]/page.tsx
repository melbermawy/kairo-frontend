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
    <div className="space-y-4 sm:space-y-6">
      {/* Header section - mobile-first: stacked, then row on larger screens */}
      <header className="space-y-2">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-xl font-semibold text-kairo-fg leading-tight">
            {pkg.title}
          </h1>
          <KTag variant={bandVariants[pkg.quality.band] || "muted"} className="uppercase text-[10px] sm:text-xs w-fit">
            {bandLabels[pkg.quality.band] || pkg.quality.band}
          </KTag>
        </div>

        {/* Meta row: opportunity link + format + channels - wraps naturally on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-kairo-fg-muted flex-wrap">
          {opportunityTitle && (
            <>
              <span className="text-kairo-fg-subtle">From:</span>
              <Link
                href={`/brands/${brandId}/today`}
                className="text-kairo-accent-400 hover:text-kairo-accent-300 hover:underline truncate max-w-[150px] sm:max-w-none"
              >
                {opportunityTitle}
              </Link>
              <span className="text-kairo-border-strong">·</span>
            </>
          )}
          <span className="capitalize">{pkg.format.replace(/_/g, " ")}</span>
          <span className="text-kairo-border-strong">·</span>
          <div className="flex items-center gap-1 flex-wrap">
            {channels.map((channel) => (
              <span
                key={channel}
                className={[
                  "inline-flex items-center",
                  "px-1.5 py-0.5",
                  "rounded-(--kairo-radius-xs)",
                  "text-[10px] sm:text-xs",
                  "bg-kairo-bg-elevated text-kairo-fg-muted",
                  "border border-kairo-border-subtle",
                ].join(" ")}
              >
                {channelLabels[channel] || channel}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Responsive workspace grid:
          - Mobile: single column, variants first (main content)
          - Tablet (md): 2 columns - variants + right sidebar
          - Desktop (lg): 3 columns - sidebar | variants | sidebar
      */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[260px_1fr_240px] gap-4 sm:gap-5">
        {/* LEFT COLUMN: Package + Opportunity summary (hidden on mobile/tablet, shown on lg) */}
        <aside className="hidden lg:block space-y-4 order-1">
          <PackageSummaryCard pkg={adaptedPkg} />

          {opportunity && (
            <SourceOpportunityCard opportunity={opportunity} brandId={brandId} />
          )}
        </aside>

        {/* CENTER COLUMN: Channel variants workspace - always first on mobile */}
        <main className="order-1 md:order-1 lg:order-2">
          <ChannelVariantsPanel channels={channels} variants={pkg.variants} />
        </main>

        {/* RIGHT COLUMN: Brand brain & pattern hints */}
        <aside className="order-2 lg:order-3">
          <BrandBrainPanel voice={brandVoice} patterns={suggestedPatterns} />
        </aside>

        {/* Mobile/Tablet only: Package summary below other content */}
        <div className="lg:hidden order-3 space-y-4">
          <PackageSummaryCard pkg={adaptedPkg} />
          {opportunity && (
            <SourceOpportunityCard opportunity={opportunity} brandId={brandId} />
          )}
        </div>
      </div>
    </div>
  );
}
