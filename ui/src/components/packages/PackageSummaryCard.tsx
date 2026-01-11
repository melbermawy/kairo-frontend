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
    <KCard className="p-6">
      {/* Title + Quality band */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold text-kairo-ink-900 leading-snug">
          {pkg.title}
        </h3>
        <KTag variant={bandVariants[pkg.quality.band] || "muted"} className="shrink-0 uppercase text-xs">
          {bandLabels[pkg.quality.band] || pkg.quality.band}
        </KTag>
      </div>

      {/* Thesis / Core argument */}
      <div className="mb-5">
        <p className="text-xs font-medium text-kairo-ink-500 uppercase tracking-wide mb-1.5">
          Core Argument
        </p>
        <p className="text-sm text-kairo-ink-700 leading-relaxed">
          {pkg.thesis}
        </p>
      </div>

      {/* Supporting points / Outline beats */}
      {points.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium text-kairo-ink-500 uppercase tracking-wide mb-2">
            Key Points
          </p>
          <ul className="space-y-1.5">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-kairo-ink-600">
                <span className="text-kairo-ink-400 shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta row */}
      <div className="pt-3 border-t border-kairo-border-subtle">
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-kairo-ink-500">
          <span className="font-medium capitalize">{pkg.format.replace(/_/g, " ")}</span>
          {pkg.persona && (
            <>
              <span className="text-kairo-ink-300">·</span>
              <span>{pkg.persona}</span>
            </>
          )}
          {pkg.pillar && (
            <>
              <span className="text-kairo-ink-300">·</span>
              <span>{pkg.pillar}</span>
            </>
          )}
          {uniqueChannels.length > 0 && (
            <>
              <span className="text-kairo-ink-300">·</span>
              <div className="flex items-center gap-1">
                {uniqueChannels.map((channel) => (
                  <span
                    key={channel}
                    className={[
                      "inline-flex items-center",
                      "px-1.5 py-0.5",
                      "rounded-(--kairo-radius-xs)",
                      "bg-kairo-sand-75 text-kairo-ink-600",
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
