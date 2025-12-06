"use client";

import { useState } from "react";
import { KButton, KCard, KTag } from "@/components/ui";
import type { DemoVariant, PackageChannel } from "@/demo/packages";

interface ChannelVariantsPanelProps {
  channels: PackageChannel[];
  variants: DemoVariant[];
}

const channelLabels: Record<PackageChannel, string> = {
  linkedin: "LinkedIn",
  x: "X",
  youtube_script: "YouTube",
};

const variantStatusVariants: Record<DemoVariant["status"], "muted" | "campaign" | "evergreen"> = {
  draft: "muted",
  edited: "campaign",
  approved: "evergreen",
};

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 14) return "1w ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function ChannelVariantsPanel({ channels, variants }: ChannelVariantsPanelProps) {
  const [activeChannel, setActiveChannel] = useState<PackageChannel>(channels[0] || "linkedin");

  // Map channel names to the format used in variants
  const channelDisplayMap: Record<PackageChannel, string> = {
    linkedin: "LinkedIn",
    x: "X",
    youtube_script: "YouTube",
  };

  const filteredVariants = variants.filter(
    (v) => v.channel === channelDisplayMap[activeChannel]
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
            (v) => v.channel === channelDisplayMap[channel]
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
              {channelLabels[channel]}
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
          <EmptyVariantsState channel={channelLabels[activeChannel]} />
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
          + Add {channelLabels[activeChannel]} variant
        </button>
      </div>
    </div>
  );
}

interface VariantCardProps {
  variant: DemoVariant;
  index: number;
  channel: PackageChannel;
}

function VariantCard({ variant, index, channel }: VariantCardProps) {
  const firstLine = variant.body.split("\n")[0];
  // Stub updated time since variants don't have it in current data
  const updatedAt = "2d ago";
  const owner = "Nadia"; // Stub owner

  return (
    <KCard className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Variant header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-kairo-ink-900">
              {channelLabels[channel]} v{index}
            </span>
            <KTag variant={variantStatusVariants[variant.status]} className="uppercase text-xs">
              {variant.status}
            </KTag>
          </div>

          {/* Summary / first line */}
          <p className="text-sm text-kairo-ink-700 line-clamp-2 mb-2">
            {firstLine}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-1.5 text-xs text-kairo-ink-500">
            <span>Pattern: {variant.pattern}</span>
            <span className="text-kairo-ink-300">·</span>
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
