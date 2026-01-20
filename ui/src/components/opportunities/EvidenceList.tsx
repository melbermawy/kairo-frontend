"use client";

import { useMemo, useState, useCallback } from "react";
import type { UIEvidencePreview } from "@/lib/todayAdapter";
import { PlatformIcon } from "./PlatformIcon";

interface EvidenceListProps {
  evidence: UIEvidencePreview[];
  initialPlatformFilter?: string | null;
  onPlatformFilterChange?: (platform: string | null) => void;
  className?: string;
}

// Platform display order preference
const platformOrder = [
  "tiktok",
  "instagram",
  "x",
  "linkedin",
  "reddit",
  "youtube",
  "newsletter",
  "blog",
  "podcast",
  "web",
];

// Platform label map
const platformLabels: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "IG",
  x: "X",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  youtube: "YouTube",
  newsletter: "Newsletter",
  blog: "Blog",
  podcast: "Podcast",
  web: "Web",
};

export function EvidenceList({
  evidence,
  initialPlatformFilter = null,
  onPlatformFilterChange,
  className = "",
}: EvidenceListProps) {
  const [platformFilter, setPlatformFilter] = useState<string | null>(
    initialPlatformFilter
  );

  // Sync filter state with parent if controlled
  const activePlatform = initialPlatformFilter ?? platformFilter;

  const handlePlatformClick = useCallback(
    (platform: string | null) => {
      setPlatformFilter(platform);
      onPlatformFilterChange?.(platform);
    },
    [onPlatformFilterChange]
  );

  // Count evidence by platform
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of evidence) {
      counts[ev.platform] = (counts[ev.platform] || 0) + 1;
    }
    return counts;
  }, [evidence]);

  // Get sorted platforms that have evidence
  const platforms = useMemo(() => {
    const present = Object.keys(platformCounts);
    return platformOrder.filter((p) => present.includes(p));
  }, [platformCounts]);

  // Filter evidence by platform
  const filteredEvidence = useMemo(() => {
    if (!activePlatform) return evidence;
    return evidence.filter((ev) => ev.platform === activePlatform);
  }, [evidence, activePlatform]);

  if (evidence.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-[13px] text-kairo-fg-muted">No evidence available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Platform filter row */}
      {platforms.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3" role="group" aria-label="Filter by platform">
          {/* All button (clear filter) */}
          {activePlatform !== null && (
            <button
              onClick={() => handlePlatformClick(null)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500 bg-kairo-bg-card border-kairo-border-subtle text-kairo-fg-muted hover:text-kairo-fg hover:border-kairo-border-strong"
              aria-label="Show all platforms"
            >
              All
            </button>
          )}

          {platforms.map((platform) => {
            const count = platformCounts[platform] || 0;
            const isActive = activePlatform === platform;

            return (
              <button
                key={platform}
                onClick={() => handlePlatformClick(isActive ? null : platform)}
                className={`
                  inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]
                  border transition-all duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500
                  ${isActive
                    ? "bg-kairo-accent-500/15 border-kairo-accent-500/50 text-kairo-accent-400"
                    : "bg-kairo-bg-card border-kairo-border-subtle text-kairo-fg-muted hover:text-kairo-fg hover:border-kairo-border-strong"
                  }
                `}
                aria-pressed={isActive}
                aria-label={`Filter by ${platformLabels[platform] || platform}, ${count} items`}
                data-testid={`platform-badge-${platform}`}
              >
                <PlatformIcon platform={platform} size="sm" className={isActive ? "text-kairo-accent-400" : ""} />
                <span className="font-medium">{platformLabels[platform] || platform}</span>
                <span className={`text-[9px] ${isActive ? "text-kairo-accent-300" : "text-kairo-fg-subtle"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Evidence count */}
      <p className="text-[11px] text-kairo-fg-subtle mb-2">
        {activePlatform
          ? `Showing ${filteredEvidence.length} of ${evidence.length} items`
          : `${evidence.length} items`}
      </p>

      {/* Evidence tiles - simplified for EvidencePreview */}
      <div className="space-y-2" data-testid="evidence-list">
        {filteredEvidence.map((ev) => (
          <EvidencePreviewTile key={ev.id} evidence={ev} />
        ))}
      </div>

      {/* Empty state when filtered */}
      {filteredEvidence.length === 0 && activePlatform && (
        <div className="text-center py-4">
          <p className="text-[12px] text-kairo-fg-muted">
            No evidence for this platform
          </p>
          <button
            onClick={() => handlePlatformClick(null)}
            className="mt-2 text-[11px] text-kairo-accent-400 hover:text-kairo-accent-300 transition-colors"
          >
            Show all
          </button>
        </div>
      )}
    </div>
  );
}

// Simplified evidence tile for EvidencePreview (from backend DTO)
function EvidencePreviewTile({ evidence }: { evidence: UIEvidencePreview }) {
  // Platform colors for badge background
  const platformBgColors: Record<string, string> = {
    tiktok: "bg-black",
    instagram: "kairo-instagram-gradient",
    x: "bg-black",
    linkedin: "bg-kairo-platform-linkedin-bg",
    reddit: "bg-kairo-platform-reddit-bg",
    youtube: "bg-red-600",
    newsletter: "bg-kairo-bg-elevated",
    blog: "bg-kairo-bg-elevated",
    podcast: "bg-purple-600",
    web: "bg-kairo-bg-elevated",
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden bg-kairo-bg-card border border-kairo-border-subtle"
      data-testid="evidence-tile"
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Platform icon */}
          <div className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${platformBgColors[evidence.platform] || "bg-kairo-bg-elevated"}`}>
            <PlatformIcon platform={evidence.platform} size="sm" className="text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Text snippet */}
            <p className="text-[12px] text-kairo-fg leading-snug line-clamp-2 mb-1">
              {evidence.textSnippet || "View content"}
            </p>

            {/* Meta row: author, transcript indicator */}
            <div className="flex items-center gap-2 text-[10px] text-kairo-fg-subtle">
              <PlatformIcon platform={evidence.platform} size="sm" />
              {evidence.authorRef && (
                <span className="truncate max-w-[100px]">{evidence.authorRef}</span>
              )}
              {evidence.hasTranscript && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Transcript
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Open link */}
          <a
            href={evidence.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1.5 rounded-md text-kairo-fg-subtle hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500"
            aria-label="Open source"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

EvidenceList.displayName = "EvidenceList";
