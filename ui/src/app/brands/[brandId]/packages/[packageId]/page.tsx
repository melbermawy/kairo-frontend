import { notFound } from "next/navigation";
import Link from "next/link";
import { KTag } from "@/components/ui";
import {
  ChannelVariantsPanel,
  BrandBrainPanel,
  SourceOpportunityCard,
  PackageSummaryCard,
} from "@/components/packages";
import { demoClient, type PackageStatus, type PackageChannel } from "@/lib/demoClient";

interface PackageDetailPageProps {
  params: Promise<{ brandId: string; packageId: string }>;
}

const statusVariants: Record<PackageStatus, "muted" | "campaign" | "default" | "evergreen"> = {
  draft: "muted",
  in_review: "campaign",
  scheduled: "default",
  published: "evergreen",
};

const statusLabels: Record<PackageStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  scheduled: "Scheduled",
  published: "Published",
};

const channelLabels: Record<PackageChannel, string> = {
  linkedin: "LinkedIn",
  x: "X",
  youtube_script: "YouTube",
};

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { brandId, packageId } = await params;
  const brand = demoClient.getBrand(brandId);
  const pkg = demoClient.getPackage(packageId);

  if (!brand || !pkg || pkg.brandId !== brandId) {
    notFound();
  }

  const opportunity = pkg.opportunityId ? demoClient.getOpportunity(pkg.opportunityId) : null;
  const opportunityTitle = demoClient.getOpportunityTitle(pkg.opportunityId);

  // Get patterns relevant to first channel for suggestions
  const firstChannel = pkg.channels[0];
  const channelForPatterns = firstChannel === "linkedin" ? "LinkedIn" : firstChannel === "x" ? "X" : "YouTube Shorts";
  const suggestedPatterns = demoClient.listPatternsByChannel(channelForPatterns);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <header className="space-y-2">
        {/* Title row */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold text-kairo-ink-900">
            {pkg.title}
          </h1>
          <KTag variant={statusVariants[pkg.status]} className="uppercase text-xs">
            {statusLabels[pkg.status]}
          </KTag>
        </div>

        {/* Meta row: opportunity link + persona/pillar + channels */}
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
          <span>{pkg.persona}</span>
          <span className="text-kairo-ink-300">·</span>
          <span>{pkg.pillar}</span>
          <span className="text-kairo-ink-300">·</span>
          <div className="flex items-center gap-1">
            {pkg.channels.map((channel) => (
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
                {channelLabels[channel]}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 3-column workspace grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-5">
        {/* LEFT COLUMN: Package + Opportunity summary */}
        <aside className="space-y-4 order-2 lg:order-1">
          <PackageSummaryCard pkg={pkg} />

          {opportunity && (
            <SourceOpportunityCard opportunity={opportunity} brandId={brandId} />
          )}
        </aside>

        {/* CENTER COLUMN: Channel variants workspace */}
        <main className="order-1 lg:order-2">
          <ChannelVariantsPanel channels={pkg.channels} variants={pkg.variants} />
        </main>

        {/* RIGHT COLUMN: Brand brain & pattern hints */}
        <aside className="order-3">
          <BrandBrainPanel voice={brand.voice} patterns={suggestedPatterns} />
        </aside>
      </div>
    </div>
  );
}
