"use client";

import { useMemo } from "react";
import type { EvidencePlatform, EvidenceItem } from "@/lib/mockApi";
import { PlatformIcon } from "./PlatformIcon";

interface PlatformBadgesRowProps {
  evidence: EvidenceItem[];
  activePlatform?: EvidencePlatform | null;
  onPlatformClick?: (platform: EvidencePlatform | null) => void;
  className?: string;
  size?: "sm" | "md";
}

// Platform display order preference
const platformOrder: EvidencePlatform[] = [
  "tiktok",
  "instagram",
  "x",
  "linkedin",
  "reddit",
  "web",
];

// Platform label map
const platformLabels: Record<EvidencePlatform, string> = {
  tiktok: "TikTok",
  instagram: "IG",
  x: "X",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  web: "Web",
};

export function PlatformBadgesRow({
  evidence,
  activePlatform = null,
  onPlatformClick,
  className = "",
  size = "md",
}: PlatformBadgesRowProps) {
  // Count evidence by platform
  const platformCounts = useMemo(() => {
    const counts: Partial<Record<EvidencePlatform, number>> = {};
    for (const ev of evidence) {
      counts[ev.platform] = (counts[ev.platform] || 0) + 1;
    }
    return counts;
  }, [evidence]);

  // Get sorted platforms that have evidence
  const platforms = useMemo(() => {
    return platformOrder.filter((p) => platformCounts[p]);
  }, [platformCounts]);

  if (platforms.length === 0) return null;

  const isSmall = size === "sm";

  return (
    <div
      className={`flex items-center gap-1.5 flex-wrap ${className}`}
      role="group"
      aria-label="Filter by platform"
    >
      {/* All button (clear filter) */}
      {onPlatformClick && activePlatform !== null && (
        <button
          onClick={() => onPlatformClick(null)}
          className={`
            inline-flex items-center gap-1 rounded-full
            border transition-all duration-150
            focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500
            ${isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}
            bg-kairo-bg-card border-kairo-border-subtle
            text-kairo-fg-muted hover:text-kairo-fg hover:border-kairo-border-strong
          `}
          aria-label="Show all platforms"
        >
          All
        </button>
      )}

      {platforms.map((platform) => {
        const count = platformCounts[platform] || 0;
        const isActive = activePlatform === platform;
        const isClickable = !!onPlatformClick;

        const badgeContent = (
          <>
            <PlatformIcon
              platform={platform}
              size="sm"
              className={isActive ? "text-kairo-accent-400" : ""}
            />
            <span className="font-medium">{platformLabels[platform]}</span>
            <span
              className={`
                ${isSmall ? "text-[9px]" : "text-[10px]"}
                ${isActive ? "text-kairo-accent-300" : "text-kairo-fg-subtle"}
              `}
            >
              {count}
            </span>
          </>
        );

        const baseClasses = `
          inline-flex items-center gap-1 rounded-full
          border transition-all duration-150
          ${isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}
        `;

        const stateClasses = isActive
          ? "bg-kairo-accent-500/15 border-kairo-accent-500/50 text-kairo-accent-400"
          : "bg-kairo-bg-card border-kairo-border-subtle text-kairo-fg-muted hover:text-kairo-fg hover:border-kairo-border-strong";

        if (isClickable) {
          return (
            <button
              key={platform}
              onClick={() => onPlatformClick(isActive ? null : platform)}
              className={`${baseClasses} ${stateClasses} focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500`}
              aria-pressed={isActive}
              aria-label={`Filter by ${platformLabels[platform]}, ${count} items`}
              data-testid={`platform-badge-${platform}`}
            >
              {badgeContent}
            </button>
          );
        }

        return (
          <span
            key={platform}
            className={`${baseClasses} ${stateClasses}`}
            data-testid={`platform-badge-${platform}`}
          >
            {badgeContent}
          </span>
        );
      })}
    </div>
  );
}

PlatformBadgesRow.displayName = "PlatformBadgesRow";
