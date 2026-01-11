"use client";

import { useState } from "react";
import { KButton, KCard, KTag } from "@/components/ui";
import type { Variant } from "@/lib/mockApi";

interface ChannelVariantsPanelProps {
  channels: string[];
  variants: Variant[];
}

const channelLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
};

const variantStatusVariants: Record<string, "muted" | "campaign" | "evergreen"> = {
  draft: "muted",
  edited: "campaign",
  approved: "evergreen",
};

export function ChannelVariantsPanel({ channels, variants }: ChannelVariantsPanelProps) {
  const [activeChannel, setActiveChannel] = useState<string>(channels[0] || "x");

  const filteredVariants = variants.filter(
    (v) => v.channel === activeChannel
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Section header */}
      <h2 className="text-base sm:text-lg font-semibold text-kairo-fg">Channel Plans</h2>

      {/* Channel tabs - scrollable on mobile */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="flex items-center gap-1 p-1 bg-kairo-bg-elevated rounded-(--kairo-radius-md) w-fit min-w-full sm:min-w-0">
          {channels.map((channel) => {
            const isActive = activeChannel === channel;
            const variantCount = variants.filter(
              (v) => v.channel === channel
            ).length;

            return (
              <button
                key={channel}
                onClick={() => setActiveChannel(channel)}
                className={[
                  "inline-flex items-center gap-1 sm:gap-1.5",
                  "px-2.5 sm:px-3 py-1.5",
                  "rounded-(--kairo-radius-sm)",
                  "text-xs sm:text-sm font-medium",
                  "transition-all duration-100",
                  "whitespace-nowrap",
                  isActive
                    ? "bg-kairo-accent-500/10 text-kairo-accent-400 shadow-soft"
                    : "text-kairo-fg-muted hover:text-kairo-fg",
                ].join(" ")}
              >
                {channelLabels[channel] || channel}
                <span
                  className={[
                    "text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    isActive
                      ? "bg-kairo-accent-500/20 text-kairo-accent-400"
                      : "bg-kairo-bg-hover text-kairo-fg-subtle",
                  ].join(" ")}
                >
                  {variantCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variants list */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredVariants.length > 0 ? (
          filteredVariants.map((variant, index) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              index={index + 1}
              channel={activeChannel}
            />
          ))
        ) : (
          <EmptyVariantsState channel={channelLabels[activeChannel] || activeChannel} />
        )}

        {/* Add variant button */}
        <button
          className={[
            "w-full py-2.5 sm:py-3 px-3 sm:px-4",
            "border border-dashed border-kairo-border-subtle",
            "rounded-(--kairo-radius-md)",
            "text-xs sm:text-sm text-kairo-fg-muted",
            "hover:border-kairo-accent-400 hover:text-kairo-accent-400",
            "transition-colors",
          ].join(" ")}
        >
          + Add {channelLabels[activeChannel] || activeChannel} variant
        </button>
      </div>
    </div>
  );
}

interface VariantCardProps {
  variant: Variant;
  index: number;
  channel: string;
}

function VariantCard({ variant, index, channel }: VariantCardProps) {
  const firstLine = variant.body.split("\n")[0];
  const updatedAt = "2d ago"; // Stub since not in current data
  const owner = "Nadia"; // Stub owner

  return (
    <KCard className="p-3 sm:p-4">
      {/* Mobile: stacked layout, Desktop: side-by-side */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          {/* Variant header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-kairo-fg">
              {channelLabels[channel] || channel} v{index}
            </span>
            <KTag variant={variantStatusVariants[variant.status] || "muted"} className="uppercase text-[10px] sm:text-xs">
              {variant.status}
            </KTag>
            {variant.score !== undefined && variant.score > 0 && (
              <span className="text-[10px] sm:text-xs text-kairo-fg-muted">
                Score: {variant.score}
              </span>
            )}
          </div>

          {/* Summary / first line */}
          <p className="text-xs sm:text-sm text-kairo-fg-muted line-clamp-2 mb-2">
            {firstLine}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-kairo-fg-subtle flex-wrap">
            {variant.notes && (
              <>
                <span className="truncate max-w-[120px] sm:max-w-[200px]">{variant.notes}</span>
                <span className="text-kairo-border-strong">·</span>
              </>
            )}
            <span>Last edited by {owner}</span>
            <span className="text-kairo-border-strong">·</span>
            <span>{updatedAt}</span>
          </div>
        </div>

        {/* Actions - full width on mobile, inline on desktop */}
        <div className="flex items-center gap-1.5 sm:gap-1 shrink-0 w-full sm:w-auto">
          <KButton
            variant="ghost"
            size="sm"
            onClick={() => console.info("Duplicate variant", variant.id)}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            Duplicate
          </KButton>
          <KButton
            size="sm"
            onClick={() => console.info("Open editor for variant", variant.id)}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            Open editor
          </KButton>
        </div>
      </div>
    </KCard>
  );
}

function EmptyVariantsState({ channel }: { channel: string }) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center",
        "py-8 sm:py-10 px-4 sm:px-6",
        "rounded-(--kairo-radius-md)",
        "border border-dashed border-kairo-border-subtle",
        "bg-kairo-bg-elevated",
      ].join(" ")}
    >
      <p className="text-xs sm:text-sm text-kairo-fg-muted text-center mb-3">
        No {channel} variants yet
      </p>
      <KButton size="sm" className="text-xs sm:text-sm">Create first variant</KButton>
    </div>
  );
}

ChannelVariantsPanel.displayName = "ChannelVariantsPanel";
