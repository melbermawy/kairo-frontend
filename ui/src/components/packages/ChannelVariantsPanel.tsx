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
    <div className="space-y-4">
      {/* Section header */}
      <h2 className="text-lg font-semibold text-kairo-ink-900">Channel Plans</h2>

      {/* Channel tabs */}
      <div className="flex items-center gap-1 p-1 bg-kairo-sand-50 rounded-(--kairo-radius-md) w-fit">
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
                "inline-flex items-center gap-1.5",
                "px-3 py-1.5",
                "rounded-(--kairo-radius-sm)",
                "text-sm font-medium",
                "transition-all duration-100",
                isActive
                  ? "bg-kairo-aqua-50 text-kairo-aqua-600 shadow-soft"
                  : "text-kairo-ink-500 hover:text-kairo-ink-700",
              ].join(" ")}
            >
              {channelLabels[channel] || channel}
              <span
                className={[
                  "text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  isActive
                    ? "bg-kairo-aqua-100 text-kairo-aqua-600"
                    : "bg-kairo-sand-100 text-kairo-ink-400",
                ].join(" ")}
              >
                {variantCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Variants list */}
      <div className="space-y-3">
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
            "w-full py-3 px-4",
            "border border-dashed border-kairo-border-subtle",
            "rounded-(--kairo-radius-md)",
            "text-sm text-kairo-ink-500",
            "hover:border-kairo-aqua-300 hover:text-kairo-aqua-600",
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
    <KCard className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Variant header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-kairo-ink-900">
              {channelLabels[channel] || channel} v{index}
            </span>
            <KTag variant={variantStatusVariants[variant.status] || "muted"} className="uppercase text-xs">
              {variant.status}
            </KTag>
            {variant.score && (
              <span className="text-xs text-kairo-ink-500">
                Score: {variant.score}
              </span>
            )}
          </div>

          {/* Summary / first line */}
          <p className="text-sm text-kairo-ink-700 line-clamp-2 mb-2">
            {firstLine}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-1.5 text-xs text-kairo-ink-500">
            {variant.notes && (
              <>
                <span className="truncate max-w-[200px]">{variant.notes}</span>
                <span className="text-kairo-ink-300">·</span>
              </>
            )}
            <span>Last edited by {owner}</span>
            <span className="text-kairo-ink-300">·</span>
            <span>{updatedAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <KButton variant="ghost" size="sm" onClick={() => console.info("Duplicate variant", variant.id)}>
            Duplicate
          </KButton>
          <KButton size="sm" onClick={() => console.info("Open editor for variant", variant.id)}>
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
        "py-10 px-6",
        "rounded-(--kairo-radius-md)",
        "border border-dashed border-kairo-border-subtle",
        "bg-kairo-surface-soft",
      ].join(" ")}
    >
      <p className="text-sm text-kairo-ink-500 text-center mb-3">
        No {channel} variants yet
      </p>
      <KButton size="sm">Create first variant</KButton>
    </div>
  );
}

ChannelVariantsPanel.displayName = "ChannelVariantsPanel";
