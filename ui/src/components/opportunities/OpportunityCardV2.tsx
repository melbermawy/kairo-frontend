"use client";

import { useMemo, MouseEvent } from "react";
import { motion } from "framer-motion";
import { KTag } from "@/components/ui";
import type { Opportunity, OpportunityWithEvidence, OpportunityType, OpportunityLifecycle, EvidencePlatform } from "@/lib/mockApi";
import { PlatformIcon } from "./PlatformIcon";
import { LifecycleSparkline } from "./Sparkline";

interface OpportunityCardV2Props {
  opportunity: Opportunity | OpportunityWithEvidence;
  onClick?: () => void;
  onPlatformClick?: (platform: EvidencePlatform) => void;
  isSelected?: boolean;
}

// Lifecycle badge colors and labels - using tokenized colors for dark mode
const lifecycleConfig: Record<
  OpportunityLifecycle,
  { label: string; className: string }
> = {
  seed: { label: "Seed", className: "bg-kairo-lifecycle-seed-bg text-kairo-lifecycle-seed-fg" },
  rising: { label: "Rising", className: "bg-kairo-lifecycle-rising-bg text-kairo-lifecycle-rising-fg" },
  peaking: { label: "Peaking", className: "bg-kairo-lifecycle-peaking-bg text-kairo-lifecycle-peaking-fg" },
  declining: { label: "Declining", className: "bg-kairo-lifecycle-declining-bg text-kairo-lifecycle-declining-fg" },
  evergreen: { label: "Evergreen", className: "bg-kairo-lifecycle-evergreen-bg text-kairo-lifecycle-evergreen-fg" },
  active: { label: "Active", className: "bg-kairo-lifecycle-active-bg text-kairo-lifecycle-active-fg" },
};

// Type badge variants
const typeLabels: Record<OpportunityType, string> = {
  trend: "Trend",
  evergreen: "Evergreen",
  competitive: "Competitive",
};

const typeStyles: Record<OpportunityType, "evergreen" | "campaign" | "danger"> = {
  trend: "campaign",
  evergreen: "evergreen",
  competitive: "danger",
};

// Platform short labels for badges
const platformLabels: Record<EvidencePlatform, string> = {
  tiktok: "TikTok",
  instagram: "IG",
  x: "X",
  linkedin: "LI",
  reddit: "Reddit",
  web: "Web",
};

export function OpportunityCardV2({
  opportunity,
  onClick,
  onPlatformClick,
  isSelected = false,
}: OpportunityCardV2Props) {
  const lifecycle = opportunity.lifecycle || "active";
  const lifecycleInfo = lifecycleConfig[lifecycle];
  const platforms = opportunity.platforms || [];

  // Compute platform counts from evidence if available
  const platformCounts = useMemo(() => {
    const counts: Partial<Record<EvidencePlatform, number>> = {};
    if ("evidence" in opportunity && opportunity.evidence) {
      for (const ev of opportunity.evidence) {
        counts[ev.platform] = (counts[ev.platform] || 0) + 1;
      }
    } else {
      // Fallback: each platform counts as 1
      for (const p of platforms) {
        counts[p as EvidencePlatform] = 1;
      }
    }
    return counts;
  }, [opportunity, platforms]);

  const handlePlatformClick = (e: MouseEvent, platform: EvidencePlatform) => {
    e.stopPropagation();
    onPlatformClick?.(platform);
  };

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
        {/* Top row: Score + Type + Lifecycle */}
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
            {opportunity.score}
          </span>

          {/* Type tag */}
          <KTag variant={typeStyles[opportunity.type]} className="text-[10px] px-1.5 py-0.5">
            {typeLabels[opportunity.type]}
          </KTag>

          {/* Lifecycle badge */}
          <span
            className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium
              ${lifecycleInfo.className}
            `}
          >
            <LifecycleSparkline lifecycle={lifecycle} className="mr-0.5" />
            {lifecycleInfo.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-medium text-kairo-fg leading-snug mb-1.5 line-clamp-2 group-hover:text-kairo-accent-400 transition-colors">
          {opportunity.title}
        </h3>

        {/* Why now summary */}
        {opportunity.why_now_summary && (
          <p className="text-[12px] text-kairo-fg-muted leading-relaxed mb-2.5 line-clamp-2">
            {opportunity.why_now_summary}
          </p>
        )}

        {/* Bottom row: Platform badges + Trend kernel + Pillar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Platform badges with counts */}
          {platforms.length > 0 && (
            <div className="flex items-center gap-1" data-testid="platform-badges">
              {platforms.slice(0, 3).map((platform) => {
                const p = platform as EvidencePlatform;
                const count = platformCounts[p] || 1;
                return (
                  <button
                    key={platform}
                    onClick={(e) => handlePlatformClick(e, p)}
                    className={`
                      inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full
                      bg-kairo-bg-elevated text-[10px] text-kairo-fg-muted
                      hover:bg-kairo-bg-hover hover:text-kairo-fg
                      transition-colors duration-150
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500
                    `}
                    aria-label={`View ${platformLabels[p]} evidence (${count})`}
                    data-testid={`card-platform-${platform}`}
                  >
                    <PlatformIcon platform={p} size="sm" />
                    <span className="font-medium">{count}</span>
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

          {/* Trend kernel chip */}
          {opportunity.trend_kernel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-kairo-bg-elevated text-[10px] text-kairo-fg-muted">
              {opportunity.trend_kernel.kind === "audio" && <AudioIcon />}
              {opportunity.trend_kernel.kind === "hashtag" && <HashtagIcon />}
              {opportunity.trend_kernel.kind === "phrase" && <PhraseIcon />}
              <span className="max-w-[80px] truncate">
                {opportunity.trend_kernel.value}
              </span>
            </span>
          )}

          {/* Pillar chip */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-kairo-accent-500/10 text-[10px] text-kairo-accent-400 border border-kairo-accent-500/20">
            {opportunity.brand_fit.pillar}
          </span>
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

// Trend kernel icons
function AudioIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

function HashtagIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  );
}

function PhraseIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

OpportunityCardV2.displayName = "OpportunityCardV2";
