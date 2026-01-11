"use client";

import { KButton, KTag } from "@/components/ui";
import type { ContentPackage } from "@/lib/mockApi";
import Link from "next/link";

interface PackageRowProps {
  pkg: ContentPackage;
  brandId: string;
  opportunityTitle?: string | null;
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

export function PackageRow({ pkg, brandId, opportunityTitle }: PackageRowProps) {
  const variantCount = pkg.variants.length;
  const channels = [...new Set(pkg.deliverables.map((d) => d.channel))];

  return (
    <article
      className={[
        "group",
        "rounded-(--kairo-radius-md)",
        "bg-kairo-surface-plain",
        "border border-kairo-border-subtle",
        "px-4 py-4.5",
        "kairo-transition-soft",
        "hover:border-kairo-border-strong hover:shadow-elevated hover:scale-[1.005] hover:bg-kairo-surface-soft",
      ].join(" ")}
    >
      {/* Two-column layout: Left (content) + Right (channels/ownership/actions) */}
      <div className="flex gap-4">
        {/* LEFT SIDE: Package info (two lines) */}
        <div className="flex-1 min-w-0">
          {/* Line 1: Title + Quality band */}
          <div className="flex items-center gap-2 mb-1.5">
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
            <KTag
              variant={bandVariants[pkg.quality.band] || "muted"}
              className="shrink-0 uppercase text-[10px] tracking-wide kairo-transition-fast group-hover:opacity-100 opacity-90"
            >
              {bandLabels[pkg.quality.band] || pkg.quality.band}
            </KTag>
          </div>

          {/* Line 2: Meta (origin, format, variants) */}
          <div className="flex items-center gap-1.5 text-xs text-kairo-ink-400">
            {opportunityTitle && (
              <>
                <span>from</span>
                <span className="text-kairo-ink-500 truncate max-w-[200px]">{opportunityTitle}</span>
                <span className="text-kairo-ink-300">·</span>
              </>
            )}
            <span className="truncate capitalize">{pkg.format.replace(/_/g, " ")}</span>
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

        {/* RIGHT SIDE: Channels, actions */}
        <div className="shrink-0 flex flex-col items-end gap-2.5">
          {/* Line 1: Channels + Actions */}
          <div className="flex items-center gap-2.5">
            {/* Channel chips */}
            <div className="flex items-center gap-1">
              {channels.map((channel) => (
                <span
                  key={channel}
                  className={[
                    "inline-flex items-center",
                    "px-1.5 py-0.5",
                    "rounded-(--kairo-radius-xs)",
                    "text-xs font-medium",
                    "bg-kairo-ink-50 text-kairo-ink-600",
                    "border border-kairo-ink-150",
                    "kairo-transition-fast group-hover:bg-kairo-bg-hover group-hover:text-kairo-accent-600 group-hover:border-kairo-accent-400",
                  ].join(" ")}
                >
                  {channelLabels[channel] || channel}
                </span>
              ))}
            </div>

            {/* Actions - always visible */}
            <div className="flex items-center gap-1">
              <Link href={`/brands/${brandId}/packages/${pkg.id}`}>
                <KButton variant="ghost" size="sm" className="kairo-transition-fast hover:-translate-y-px hover:scale-[1.02]">
                  Edit
                </KButton>
              </Link>
              <Link href={`/brands/${brandId}/packages/${pkg.id}`}>
                <KButton size="sm" className="kairo-transition-fast hover:-translate-y-px hover:scale-[1.02]">
                  Open
                </KButton>
              </Link>
            </div>
          </div>

          {/* Line 2: Quality score */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-kairo-ink-600">Score: {pkg.quality.score}</span>
            {pkg.quality.issues.length > 0 && (
              <>
                <span className="text-kairo-ink-400">·</span>
                <span className="text-kairo-ink-400">{pkg.quality.issues.length} issue{pkg.quality.issues.length !== 1 ? "s" : ""}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

PackageRow.displayName = "PackageRow";
