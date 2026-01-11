"use client";

import { motion } from "framer-motion";
import type { EvidenceItem } from "@/lib/mockApi";
import { PlatformIcon, PlatformBadge } from "./PlatformIcon";

interface EvidenceTileProps {
  evidence: EvidenceItem;
  compact?: boolean;
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

export function EvidenceTile({ evidence, compact = false }: EvidenceTileProps) {
  const hasMetrics =
    evidence.metrics &&
    (evidence.metrics.views ||
      evidence.metrics.likes ||
      evidence.metrics.comments);

  return (
    <motion.a
      href={evidence.canonical_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative block rounded-xl overflow-hidden
        bg-kairo-surface-plain border border-kairo-border-subtle
        hover:border-kairo-aqua-200 hover:shadow-elevated
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-aqua-500
        ${compact ? "p-2.5" : "p-3"}
      `}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Thumbnail area */}
      {evidence.thumbnail_url && !compact && (
        <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 bg-kairo-sand-100">
          <img
            src={evidence.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Platform overlay badge */}
          <div className="absolute top-2 left-2">
            <PlatformBadge platform={evidence.platform} />
          </div>
          {/* Play indicator for videos */}
          {evidence.content_type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-5 h-5 text-white ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compact layout with inline platform */}
      {compact && (
        <div className="flex items-start gap-2.5">
          <div className="shrink-0 pt-0.5">
            <PlatformIcon
              platform={evidence.platform}
              size="md"
              className="text-kairo-ink-500"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-kairo-ink-700 line-clamp-2 leading-snug">
              {evidence.caption || "View content"}
            </p>
            {evidence.author_handle && (
              <p className="text-[11px] text-kairo-ink-400 mt-0.5">
                {evidence.author_handle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Full layout content */}
      {!compact && (
        <>
          {/* Caption */}
          <p className="text-[12px] text-kairo-ink-700 line-clamp-2 leading-snug mb-2">
            {evidence.caption || "View content"}
          </p>

          {/* Author and time */}
          <div className="flex items-center justify-between text-[11px] text-kairo-ink-400">
            <span className="truncate">
              {evidence.author_handle || "Unknown"}
            </span>
            <span className="shrink-0 ml-2">
              {formatTimeAgo(evidence.created_at)}
            </span>
          </div>

          {/* Metrics bar */}
          {hasMetrics && (
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-kairo-border-subtle">
              {evidence.metrics.views && (
                <MetricChip
                  icon={<ViewsIcon />}
                  value={formatMetricNumber(evidence.metrics.views)}
                />
              )}
              {evidence.metrics.likes && (
                <MetricChip
                  icon={<LikesIcon />}
                  value={formatMetricNumber(evidence.metrics.likes)}
                />
              )}
              {evidence.metrics.comments && (
                <MetricChip
                  icon={<CommentsIcon />}
                  value={formatMetricNumber(evidence.metrics.comments)}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* External link indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          className="w-3.5 h-3.5 text-kairo-ink-400"
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
      </div>
    </motion.a>
  );
}

// Metric chip helper
function MetricChip({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-kairo-ink-500">
      {icon}
      {value}
    </span>
  );
}

// Metric icons
function ViewsIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function LikesIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function CommentsIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

EvidenceTile.displayName = "EvidenceTile";
