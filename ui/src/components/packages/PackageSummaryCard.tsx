import { KCard, KTag } from "@/components/ui";

// This component accepts an adapted package that may have extra fields
interface AdaptedPackage {
  id: string;
  title: string;
  thesis: string;
  format: string;
  quality: {
    band: string;
    score: number;
    issues: string[];
  };
  supportingPoints?: string[];
  outline_beats?: string[];
  persona?: string;
  pillar?: string;
  channels?: string[];
  deliverables?: { channel: string; variant_id: string; label: string }[];
  variants: { id: string; channel: string }[];
}

interface PackageSummaryCardProps {
  pkg: AdaptedPackage;
}

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

export function PackageSummaryCard({ pkg }: PackageSummaryCardProps) {
  // Use supportingPoints if available, otherwise outline_beats
  const points = pkg.supportingPoints || pkg.outline_beats || [];

  // Get channels from deliverables or channels prop
  const channels = pkg.channels || (pkg.deliverables?.map((d) => d.channel) ?? []);
  const uniqueChannels = [...new Set(channels)];

  return (
    <KCard className="p-4 sm:p-5">
      {/* Title + Quality band */}
      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-kairo-fg leading-snug">
          {pkg.title}
        </h3>
        <KTag variant={bandVariants[pkg.quality.band] || "muted"} className="shrink-0 uppercase text-[10px] sm:text-xs">
          {bandLabels[pkg.quality.band] || pkg.quality.band}
        </KTag>
      </div>

      {/* Thesis / Core argument */}
      <div className="mb-4 sm:mb-5">
        <p className="text-[10px] sm:text-xs font-medium text-kairo-fg-subtle uppercase tracking-wide mb-1 sm:mb-1.5">
          Core Argument
        </p>
        <p className="text-xs sm:text-sm text-kairo-fg-muted leading-relaxed">
          {pkg.thesis}
        </p>
      </div>

      {/* Supporting points / Outline beats */}
      {points.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <p className="text-[10px] sm:text-xs font-medium text-kairo-fg-subtle uppercase tracking-wide mb-1.5 sm:mb-2">
            Key Points
          </p>
          <ul className="space-y-1 sm:space-y-1.5">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-kairo-fg-muted">
                <span className="text-kairo-fg-subtle shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta row */}
      <div className="pt-2.5 sm:pt-3 border-t border-kairo-border-subtle">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap text-[10px] sm:text-xs text-kairo-fg-muted">
          <span className="font-medium capitalize">{pkg.format.replace(/_/g, " ")}</span>
          {pkg.persona && (
            <>
              <span className="text-kairo-border-strong">·</span>
              <span>{pkg.persona}</span>
            </>
          )}
          {pkg.pillar && (
            <>
              <span className="text-kairo-border-strong">·</span>
              <span>{pkg.pillar}</span>
            </>
          )}
          {uniqueChannels.length > 0 && (
            <>
              <span className="text-kairo-border-strong">·</span>
              <div className="flex items-center gap-1 flex-wrap">
                {uniqueChannels.map((channel) => (
                  <span
                    key={channel}
                    className={[
                      "inline-flex items-center",
                      "px-1 sm:px-1.5 py-0.5",
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
            </>
          )}
        </div>
      </div>
    </KCard>
  );
}

PackageSummaryCard.displayName = "PackageSummaryCard";
