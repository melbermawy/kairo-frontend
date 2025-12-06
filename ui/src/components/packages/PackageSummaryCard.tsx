import { KCard, KTag } from "@/components/ui";
import type { DemoPackage, PackageStatus, PackageChannel } from "@/demo/packages";

interface PackageSummaryCardProps {
  pkg: DemoPackage;
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

export function PackageSummaryCard({ pkg }: PackageSummaryCardProps) {
  return (
    <KCard className="p-4">
      {/* Title + Status */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-kairo-ink-900 leading-snug">
          {pkg.title}
        </h3>
        <KTag variant={statusVariants[pkg.status]} className="shrink-0 uppercase text-xs">
          {statusLabels[pkg.status]}
        </KTag>
      </div>

      {/* Thesis / Core argument */}
      <div className="mb-4">
        <p className="text-xs font-medium text-kairo-ink-500 uppercase tracking-wide mb-1">
          Core Argument
        </p>
        <p className="text-sm text-kairo-ink-700 leading-relaxed">
          {pkg.thesis}
        </p>
      </div>

      {/* Supporting points */}
      <div className="mb-4">
        <p className="text-xs font-medium text-kairo-ink-500 uppercase tracking-wide mb-2">
          Key Points
        </p>
        <ul className="space-y-1.5">
          {pkg.supportingPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-kairo-ink-600">
              <span className="text-kairo-ink-400 shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Meta row */}
      <div className="pt-3 border-t border-kairo-border-subtle">
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-kairo-ink-500">
          <span className="font-medium">{pkg.persona}</span>
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
                  "bg-kairo-sand-75 text-kairo-ink-600",
                  "border border-kairo-border-subtle",
                ].join(" ")}
              >
                {channelLabels[channel]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </KCard>
  );
}

PackageSummaryCard.displayName = "PackageSummaryCard";
