"use client";

import type { BrandBrainEvidence } from "@/contracts";

interface EvidencePreviewCardProps {
  evidenceId: string;
  evidence: BrandBrainEvidence | undefined;
}

export function EvidencePreviewCard({
  evidenceId,
  evidence,
}: EvidencePreviewCardProps) {
  if (!evidence) {
    return (
      <div className="p-2 rounded bg-kairo-bg-elevated text-[11px] text-kairo-fg-subtle">
        Evidence: {evidenceId}
      </div>
    );
  }

  return (
    <a
      href={evidence.canonical_url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block p-3 rounded-lg bg-kairo-bg-elevated border border-kairo-border-subtle
        hover:border-kairo-accent-500/50 transition-colors
      "
    >
      <div className="flex items-start gap-3">
        {/* Platform icon / indicator */}
        <div className="shrink-0 w-8 h-8 rounded bg-kairo-bg-card flex items-center justify-center">
          <span className="text-[10px] font-medium text-kairo-fg-muted uppercase">
            {evidence.platform.slice(0, 2)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Author / platform */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-medium text-kairo-accent-400 capitalize">
              {evidence.platform}
            </span>
            {evidence.author_ref && (
              <span className="text-[10px] text-kairo-fg-subtle">
                {evidence.author_ref}
              </span>
            )}
          </div>

          {/* Text preview */}
          {evidence.text_primary && (
            <p className="text-[11px] text-kairo-fg-muted line-clamp-2">
              {evidence.text_primary}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-kairo-fg-subtle">
            <span>{evidence.content_type}</span>
            {evidence.published_at && (
              <span>
                {new Date(evidence.published_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* External link indicator */}
        <svg
          className="shrink-0 w-3.5 h-3.5 text-kairo-fg-subtle"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </a>
  );
}

EvidencePreviewCard.displayName = "EvidencePreviewCard";
