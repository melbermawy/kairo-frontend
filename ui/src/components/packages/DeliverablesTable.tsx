"use client";

import { useState, useCallback } from "react";
import { KButton, KTag, KCard } from "@/components/ui";
import { VariantDrawer } from "./VariantDrawer";
import type { Variant } from "@/lib/mockApi";

interface DeliverablesTableProps {
  variants: Variant[];
  onDuplicate?: (variantId: string) => void;
  onCreateVariant?: (channel: string, patternId?: string) => void;
}

const channelLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
};

const channelIcons: Record<string, React.ReactNode> = {
  linkedin: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  ),
};

const statusConfig: Record<string, { label: string; variant: "muted" | "campaign" | "evergreen" }> = {
  draft: { label: "Draft", variant: "muted" },
  edited: { label: "Edited", variant: "campaign" },
  approved: { label: "Approved", variant: "evergreen" },
};

// Content type based on channel
const contentTypeLabels: Record<string, string> = {
  tiktok: "Script",
  instagram: "Caption",
  linkedin: "Post",
  x: "Thread",
};

// Extract content preview from variant body
function getContentPreview(body: string, maxLength: number = 120): string {
  // Remove structure markers like HOOK:, CTA:, BEAT 1:, etc.
  const cleaned = body
    .replace(/^(HOOK:|CTA:|BEAT \d+:|INTRO:|OUTRO:|\[\d+:\d+\]|\d+[\.\):])\s*/gim, "")
    .split("\n")
    .filter((line) => line.trim())
    .join(" ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + "...";
}

// Extract CTA if present
function extractCTA(body: string): string | null {
  const ctaMatch = body.match(/CTA:\s*(.+?)(?:\n|$)/i);
  return ctaMatch ? ctaMatch[1].trim() : null;
}

// Extract hook if present
function extractHook(body: string): string | null {
  const hookMatch = body.match(/HOOK:\s*(.+?)(?:\n|$)/i);
  return hookMatch ? hookMatch[1].trim() : null;
}

export function DeliverablesTable({
  variants,
  onDuplicate,
  onCreateVariant,
}: DeliverablesTableProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(1);
  const [selectedChannelLabel, setSelectedChannelLabel] = useState<string>("X");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenVariant = useCallback((variant: Variant, index: number) => {
    setSelectedVariant(variant);
    setSelectedVariantIndex(index);
    setSelectedChannelLabel(channelLabels[variant.channel] || variant.channel);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedVariant(null), 300);
  }, []);

  const handleDuplicate = useCallback((variantId: string) => {
    if (onDuplicate) {
      onDuplicate(variantId);
    }
    console.info("Duplicate variant", variantId);
  }, [onDuplicate]);

  // Group variants by channel for counting
  const channelCounts = variants.reduce((acc, v) => {
    acc[v.channel] = (acc[v.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Assign variant numbers within each channel
  const channelIndexes: Record<string, number> = {};
  const getVariantIndex = (channel: string) => {
    channelIndexes[channel] = (channelIndexes[channel] || 0) + 1;
    return channelIndexes[channel];
  };

  // Stub metadata
  const owner = "Nadia";
  const updatedAt = "2d ago";

  return (
    <KCard className="overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-kairo-border-subtle bg-kairo-bg-elevated/50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-kairo-fg">
            Deliverables
            <span className="ml-2 text-kairo-fg-muted font-normal">({variants.length})</span>
          </h2>
          {onCreateVariant && (
            <KButton
              size="sm"
              variant="ghost"
              onClick={() => onCreateVariant("x")}
              className="text-xs"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Variant
            </KButton>
          )}
        </div>
      </div>

      {/* Table */}
      {variants.length > 0 ? (
        <div className="divide-y divide-kairo-border-subtle">
          {variants.map((variant) => {
            const variantIndex = getVariantIndex(variant.channel);
            const statusInfo = statusConfig[variant.status] || statusConfig.draft;
            const contentType = contentTypeLabels[variant.channel] || "Content";
            const preview = getContentPreview(variant.body);
            const hook = extractHook(variant.body);
            const cta = extractCTA(variant.body);

            return (
              <div
                key={variant.id}
                className="group px-5 py-4 hover:bg-kairo-bg-hover/50 transition-colors cursor-pointer"
                onClick={() => handleOpenVariant(variant, variantIndex)}
              >
                {/* Header row: Platform, Status, Score */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-kairo-fg-muted">
                    {channelIcons[variant.channel] || channelIcons.x}
                  </span>
                  <span className="text-sm font-medium text-kairo-fg">
                    {channelLabels[variant.channel] || variant.channel} v{variantIndex}
                  </span>
                  <span className="text-[10px] text-kairo-fg-subtle uppercase">
                    {contentType}
                  </span>
                  <KTag variant={statusInfo.variant} className="text-[10px] uppercase">
                    {statusInfo.label}
                  </KTag>
                  {variant.score !== undefined && variant.score > 0 && (
                    <span
                      className={[
                        "inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-semibold ml-auto",
                        variant.score >= 80
                          ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
                          : variant.score >= 60
                          ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
                          : "bg-kairo-score-low-bg text-kairo-score-low-fg",
                      ].join(" ")}
                    >
                      {variant.score}
                    </span>
                  )}
                </div>

                {/* Content preview */}
                <div className="pl-7 space-y-1.5">
                  {/* Hook excerpt if present */}
                  {hook && (
                    <p className="text-sm text-kairo-fg font-medium leading-snug line-clamp-1">
                      {hook}
                    </p>
                  )}

                  {/* Body preview */}
                  <p className="text-sm text-kairo-fg-muted leading-relaxed line-clamp-2">
                    {preview}
                  </p>

                  {/* CTA excerpt if present */}
                  {cta && (
                    <p className="text-xs text-kairo-accent-400 italic">
                      CTA: {cta}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-kairo-fg-subtle">
                    <span>{owner}</span>
                    <span className="text-kairo-border-strong">·</span>
                    <span>{updatedAt}</span>
                    <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(variant.id);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-elevated transition-colors"
                      >
                        Duplicate
                      </button>
                      <span className="text-kairo-accent-400 font-medium">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-kairo-fg-muted mb-3">No deliverables yet</p>
          {onCreateVariant && (
            <KButton size="sm" onClick={() => onCreateVariant("x")}>
              Create First Variant
            </KButton>
          )}
        </div>
      )}

      {/* Variant Drawer */}
      <VariantDrawer
        variant={selectedVariant}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onDuplicate={handleDuplicate}
        channelLabel={selectedChannelLabel}
        variantIndex={selectedVariantIndex}
      />
    </KCard>
  );
}

DeliverablesTable.displayName = "DeliverablesTable";
