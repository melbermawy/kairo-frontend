"use client";

import { useMemo, MouseEvent } from "react";
import { motion } from "framer-motion";
import { KTag } from "@/components/ui";
import type { UIOpportunity, UIBrandSnapshot } from "@/lib/todayAdapter";
import { getPillarName, getOpportunityPlatforms } from "@/lib/todayAdapter";
import { PlatformIcon } from "./PlatformIcon";

/**
 * OpportunityCardV2 - Pruned for backend convergence
 *
 * Per convergence_plan.md Phase 0:
 * REMOVED (no backend source):
 * - lifecycle badge + sparkline
 * - trend_kernel chip
 * - signals block
 *
 * KEPT (maps to backend):
 * - score pill
 * - type badge
 * - title
 * - why_now (truncated for card display)
 * - platform badges derived from evidence_preview
 * - pillar chip (resolved from snapshot via pillar_id)
 */

interface OpportunityCardV2Props {
  opportunity: UIOpportunity;
  snapshot: UIBrandSnapshot;
  onClick?: () => void;
  onPlatformClick?: (platform: string) => void;
  isSelected?: boolean;
}

// Type badge variants
const typeLabels: Record<string, string> = {
  trend: "Trend",
  evergreen: "Evergreen",
  competitive: "Competitive",
  campaign: "Campaign",
};

const typeStyles: Record<string, "evergreen" | "campaign" | "danger"> = {
  trend: "campaign",
  evergreen: "evergreen",
  competitive: "danger",
  campaign: "campaign",
};

// Platform short labels for badges
const platformLabels: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "IG",
  x: "X",
  linkedin: "LI",
  youtube: "YT",
  reddit: "Reddit",
  web: "Web",
  newsletter: "NL",
  blog: "Blog",
  podcast: "Pod",
};

export function OpportunityCardV2({
  opportunity,
  snapshot,
  onClick,
  onPlatformClick,
  isSelected = false,
}: OpportunityCardV2Props) {
  // Get platforms from evidence preview
  const platforms = useMemo(() => {
    return getOpportunityPlatforms(opportunity);
  }, [opportunity]);

  // Compute platform counts from evidence
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of opportunity.evidencePreview) {
      counts[ev.platform] = (counts[ev.platform] || 0) + 1;
    }
    // Ensure primary channel is represented
    if (!counts[opportunity.primaryChannel]) {
      counts[opportunity.primaryChannel] = 0;
    }
    return counts;
  }, [opportunity]);

  // Resolve pillar name from snapshot
  const pillarName = getPillarName(snapshot, opportunity.pillarId);

  const handlePlatformClick = (e: MouseEvent, platform: string) => {
    e.stopPropagation();
    onPlatformClick?.(platform);
  };

  // Truncate why_now for card display (first ~100 chars)
  const whyNowSummary = useMemo(() => {
    if (!opportunity.whyNow) return null;
    if (opportunity.whyNow.length <= 100) return opportunity.whyNow;
    return opportunity.whyNow.slice(0, 100).trim() + "...";
  }, [opportunity.whyNow]);

  return (
    <motion.button
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-xl p-4
        bg-kairo-bg-card border
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-kairo-bg-app
        ${
          isSelected
            ? "border-kairo-accent-400 shadow-lg ring-1 ring-kairo-accent-200"
            : "border-kairo-border-subtle hover:border-kairo-accent-300 hover:shadow-elevated"
        }
      `}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.995 }}
      aria-pressed={isSelected}
      data-testid="opportunity-card"
    >
      {/* Gradient overlay on hover */}
      <div
        className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
          bg-gradient-to-br from-kairo-accent-500/5 via-transparent to-transparent
          transition-opacity duration-300 pointer-events-none
        `}
      />

      {/* Content */}
      <div className="relative">
        {/* Top row: Score + Type */}
        <div className="flex items-center gap-2 mb-2.5">
          {/* Score pill */}
          <span
            className={`
              inline-flex items-center justify-center w-9 h-6 rounded-full text-[12px] font-semibold
              ${
                opportunity.score >= 80
                  ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
                  : opportunity.score >= 70
                  ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
                  : "bg-kairo-score-low-bg text-kairo-score-low-fg"
              }
            `}
          >
            {Math.round(opportunity.score)}
          </span>

          {/* Type tag */}
          <KTag variant={typeStyles[opportunity.type] || "campaign"} className="text-[10px] px-1.5 py-0.5">
            {typeLabels[opportunity.type] || opportunity.type}
          </KTag>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-medium text-kairo-fg leading-snug mb-1.5 line-clamp-2 group-hover:text-kairo-accent-400 transition-colors">
          {opportunity.title}
        </h3>

        {/* Why now summary (from backend why_now string) */}
        {whyNowSummary && (
          <p className="text-[12px] text-kairo-fg-muted leading-relaxed mb-2.5 line-clamp-2">
            {whyNowSummary}
          </p>
        )}

        {/* Bottom row: Platform badges + Pillar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Platform badges with counts */}
          {platforms.length > 0 && (
            <div className="flex items-center gap-1" data-testid="platform-badges">
              {platforms.slice(0, 3).map((platform) => {
                const count = platformCounts[platform] || 0;
                return (
                  <button
                    key={platform}
                    onClick={(e) => handlePlatformClick(e, platform)}
                    className={`
                      inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full
                      bg-kairo-bg-elevated text-[10px] text-kairo-fg-muted
                      hover:bg-kairo-bg-hover hover:text-kairo-fg
                      transition-colors duration-150
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500
                    `}
                    aria-label={`View ${platformLabels[platform] || platform} evidence (${count})`}
                    data-testid={`card-platform-${platform}`}
                  >
                    <PlatformIcon platform={platform} size="sm" />
                    {count > 0 && <span className="font-medium">{count}</span>}
                  </button>
                );
              })}
              {platforms.length > 3 && (
                <span className="text-[10px] text-kairo-fg-subtle ml-0.5">
                  +{platforms.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Pillar chip (resolved from snapshot) */}
          {pillarName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-kairo-accent-500/10 text-[10px] text-kairo-accent-400 border border-kairo-accent-500/20">
              {pillarName}
            </span>
          )}
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-kairo-accent-500 rounded-r-full"
          layoutId="opportunity-selected-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  );
}

OpportunityCardV2.displayName = "OpportunityCardV2";
