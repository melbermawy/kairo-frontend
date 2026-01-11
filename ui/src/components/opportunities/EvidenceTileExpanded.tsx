"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EvidenceItem } from "@/lib/mockApi";
import { PlatformIcon } from "./PlatformIcon";

interface EvidenceTileExpandedProps {
  evidence: EvidenceItem;
  isExpanded?: boolean;
  onToggle?: () => void;
}

function formatMetricNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Platform colors for badge background
const platformBgColors: Record<string, string> = {
  tiktok: "bg-black",
  instagram: "kairo-instagram-gradient",
  x: "bg-black",
  linkedin: "bg-kairo-platform-linkedin-bg",
  reddit: "bg-kairo-platform-reddit-bg",
  web: "bg-kairo-bg-elevated",
};

export function EvidenceTileExpanded({
  evidence,
  isExpanded = false,
  onToggle,
}: EvidenceTileExpandedProps) {
  const hasMetrics =
    evidence.metrics &&
    (evidence.metrics.views ||
      evidence.metrics.likes ||
      evidence.metrics.comments ||
      evidence.metrics.shares);

  return (
    <div
      className={`
        relative rounded-lg overflow-hidden
        bg-kairo-bg-card border border-kairo-border-subtle
        transition-all duration-200
        ${isExpanded ? "ring-1 ring-kairo-accent-500/30" : ""}
      `}
      data-testid="evidence-tile"
    >
      {/* Compact view (always visible) */}
      <button
        onClick={onToggle}
        className="w-full text-left p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500 focus-visible:ring-inset"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-3">
          {/* Thumbnail or platform icon */}
          {evidence.thumbnail_url ? (
            <div className="shrink-0 w-16 h-12 rounded-md overflow-hidden bg-kairo-bg-elevated">
              <img
                src={evidence.thumbnail_url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {evidence.content_type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`shrink-0 w-10 h-10 rounded-md flex items-center justify-center ${platformBgColors[evidence.platform] || "bg-kairo-bg-elevated"}`}>
              <PlatformIcon platform={evidence.platform} size="md" className="text-white" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Caption snippet */}
            <p className="text-[12px] text-kairo-fg leading-snug line-clamp-2 mb-1">
              {evidence.caption || "View content"}
            </p>

            {/* Meta row: author, time, format */}
            <div className="flex items-center gap-2 text-[10px] text-kairo-fg-subtle">
              <PlatformIcon platform={evidence.platform} size="sm" />
              {evidence.author_handle && (
                <span className="truncate max-w-[100px]">{evidence.author_handle}</span>
              )}
              <span>·</span>
              <span>{formatTimeAgo(evidence.captured_at || evidence.created_at)}</span>
              {evidence.format && (
                <>
                  <span>·</span>
                  <span className="capitalize">{evidence.format.replace("_", " ")}</span>
                </>
              )}
            </div>
          </div>

          {/* Metrics chips */}
          {hasMetrics && (
            <div className="shrink-0 flex flex-col items-end gap-1">
              {evidence.metrics.views && (
                <MetricPill icon={<ViewsIcon />} value={formatMetricNumber(evidence.metrics.views)} />
              )}
              {evidence.metrics.likes && (
                <MetricPill icon={<LikesIcon />} value={formatMetricNumber(evidence.metrics.likes)} />
              )}
            </div>
          )}

          {/* Expand chevron */}
          <div className="shrink-0 self-center">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <svg
                className="w-4 h-4 text-kairo-fg-subtle"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-kairo-border-subtle">
              {/* Full caption */}
              {evidence.caption && (
                <div className="pt-3">
                  <h4 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1">
                    Full Caption
                  </h4>
                  <p className="text-[12px] text-kairo-fg-muted leading-relaxed">
                    {evidence.caption}
                  </p>
                </div>
              )}

              {/* All metrics */}
              {hasMetrics && (
                <div className="pt-3">
                  <h4 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
                    Metrics
                  </h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    {evidence.metrics.views !== undefined && (
                      <MetricDisplay label="Views" value={formatMetricNumber(evidence.metrics.views)} />
                    )}
                    {evidence.metrics.likes !== undefined && (
                      <MetricDisplay label="Likes" value={formatMetricNumber(evidence.metrics.likes)} />
                    )}
                    {evidence.metrics.comments !== undefined && (
                      <MetricDisplay label="Comments" value={formatMetricNumber(evidence.metrics.comments)} />
                    )}
                    {evidence.metrics.shares !== undefined && (
                      <MetricDisplay label="Shares" value={formatMetricNumber(evidence.metrics.shares)} />
                    )}
                  </div>
                </div>
              )}

              {/* Extracted data */}
              {evidence.extracted && (
                <div className="pt-3">
                  {evidence.extracted.hashtags && evidence.extracted.hashtags.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1">
                        Hashtags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {evidence.extracted.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded bg-kairo-bg-elevated text-[10px] text-kairo-fg-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {evidence.extracted.audio_title && (
                    <div className="mb-2">
                      <h4 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1">
                        Audio
                      </h4>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-kairo-bg-elevated text-[10px] text-kairo-fg-muted">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        {evidence.extracted.audio_title}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Open source link */}
              <div className="pt-3">
                <a
                  href={evidence.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-kairo-bg-elevated text-[11px] text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Open source
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper components
function MetricPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-kairo-bg-elevated text-[9px] text-kairo-fg-subtle">
      {icon}
      {value}
    </span>
  );
}

function MetricDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[14px] font-semibold text-kairo-fg">{value}</span>
      <span className="text-[9px] text-kairo-fg-subtle">{label}</span>
    </div>
  );
}

// Icons
function ViewsIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function LikesIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

EvidenceTileExpanded.displayName = "EvidenceTileExpanded";
