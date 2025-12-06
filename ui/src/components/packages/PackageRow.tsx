"use client";

import { KButton, KTag } from "@/components/ui";
import type { DemoPackage, PackageStatus, PackageChannel } from "@/demo/packages";
import Link from "next/link";

interface PackageRowProps {
  pkg: DemoPackage;
  brandId: string;
  opportunityTitle?: string | null;
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

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 14) return "1w ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 60) return "1mo ago";
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function PackageRow({ pkg, brandId, opportunityTitle }: PackageRowProps) {
  const variantCount = pkg.variants.length;

  return (
    <article
      className={[
        "group",
        "rounded-(--kairo-radius-md)",
        "bg-kairo-surface-plain",
        "border border-kairo-border-subtle",
        "px-4 py-2.5",
        "kairo-transition-soft",
        "hover:border-kairo-border-strong hover:shadow-elevated hover:scale-[1.005] hover:bg-kairo-surface-soft",
      ].join(" ")}
    >
      {/* Two-column layout: Left (content) + Right (channels/ownership/actions) */}
      <div className="flex gap-4">
        {/* LEFT SIDE: Package info (two lines) */}
        <div className="flex-1 min-w-0">
          {/* Line 1: Title + Status */}
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/brands/${brandId}/packages/${pkg.id}`}
              className={[
                "text-sm font-semibold text-kairo-ink-900",
                "hover:text-kairo-aqua-600 hover:underline underline-offset-2",
                "transition-colors cursor-pointer",
                "truncate",
              ].join(" ")}
            >
              {pkg.title}
            </Link>
            <KTag variant={statusVariants[pkg.status]} className="shrink-0 uppercase text-[10px] tracking-wide kairo-transition-fast group-hover:opacity-100 opacity-90">
              {statusLabels[pkg.status]}
            </KTag>
          </div>

          {/* Line 2: Meta (origin, persona, pillar, variants) - de-emphasized */}
          <div className="flex items-center gap-1.5 text-xs text-kairo-ink-400">
            {opportunityTitle && (
              <>
                <span>from</span>
                <span className="text-kairo-ink-500 truncate max-w-[200px]">{opportunityTitle}</span>
                <span className="text-kairo-ink-300">·</span>
              </>
            )}
            <span className="truncate">{pkg.persona}</span>
            <span className="text-kairo-ink-300">·</span>
            <span className="truncate">{pkg.pillar}</span>
            {variantCount > 0 && (
              <>
                <span className="text-kairo-ink-300">·</span>
                <span className="shrink-0">
                  {variantCount} variant{variantCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Channels, ownership, actions (two lines) */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          {/* Line 1: Channels + Actions */}
          <div className="flex items-center gap-2">
            {/* Channel chips */}
            <div className="flex items-center gap-1">
              {pkg.channels.map((channel) => (
                <span
                  key={channel}
                  className={[
                    "inline-flex items-center",
                    "px-1.5 py-0.5",
                    "rounded-(--kairo-radius-xs)",
                    "text-xs font-medium",
                    "bg-kairo-sand-75 text-kairo-ink-600",
                    "border border-kairo-border-subtle",
                    "kairo-transition-fast group-hover:bg-kairo-sand-100 group-hover:text-kairo-ink-700",
                  ].join(" ")}
                >
                  {channelLabels[channel]}
                </span>
              ))}
            </div>

            {/* Actions - always visible */}
            <div className="flex items-center gap-1">
              <KButton variant="ghost" size="sm" className="kairo-transition-fast hover:-translate-y-px hover:scale-[1.02]">
                Edit
              </KButton>
              <KButton size="sm" className="kairo-transition-fast hover:-translate-y-px hover:scale-[1.02]">
                Open
              </KButton>
            </div>
          </div>

          {/* Line 2: Owner + Date */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-kairo-ink-600">{pkg.owner}</span>
            <span className="text-kairo-ink-400">·</span>
            <span className="text-kairo-ink-400">{formatRelativeTime(pkg.lastUpdated)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

PackageRow.displayName = "PackageRow";
