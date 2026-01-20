"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { KCard, KTag } from "@/components/ui";

// This component accepts an adapted package that may have extra fields
interface AdaptedPackage {
  id: string;
  title: string;
  thesis: string;
  format: string;
  quality: {
    band: string;
    score: number;
    issues: string[];
  };
  supportingPoints?: string[];
  outline_beats?: string[];
  persona?: string;
  pillar?: string;
  channels?: string[];
  deliverables?: { channel: string; variant_id: string; label: string }[];
  variants: { id: string; channel: string }[];
}

interface PackageSummaryCardProps {
  pkg: AdaptedPackage;
  onUpdate?: (updates: Partial<Pick<AdaptedPackage, "title" | "thesis" | "supportingPoints">>) => void;
}

const bandVariants: Record<string, "muted" | "campaign" | "default" | "evergreen"> = {
  good: "evergreen",
  partial: "campaign",
  needs_work: "muted",
};

const bandLabels: Record<string, string> = {
  good: "Good",
  partial: "In Progress",
  needs_work: "Needs Work",
};

const channelLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export function PackageSummaryCard({ pkg, onUpdate }: PackageSummaryCardProps) {
  // Use supportingPoints if available, otherwise outline_beats
  const points = pkg.supportingPoints || pkg.outline_beats || [];

  // Get channels from deliverables or channels prop
  const channels = pkg.channels || (pkg.deliverables?.map((d) => d.channel) ?? []);
  const uniqueChannels = [...new Set(channels)];

  // Editable state
  const [editingField, setEditingField] = useState<"title" | "thesis" | "point" | null>(null);
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const startEditing = useCallback((field: "title" | "thesis", value: string) => {
    if (!onUpdate) return; // Only allow editing if onUpdate is provided
    setEditingField(field);
    setEditValue(value);
    setEditingPointIndex(null);
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onUpdate]);

  const startEditingPoint = useCallback((index: number, value: string) => {
    if (!onUpdate) return;
    setEditingField("point");
    setEditingPointIndex(index);
    setEditValue(value);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onUpdate]);

  const saveEdit = useCallback(() => {
    if (!editingField || !onUpdate) return;

    if (editingField === "title") {
      onUpdate({ title: editValue });
    } else if (editingField === "thesis") {
      onUpdate({ thesis: editValue });
    } else if (editingField === "point" && editingPointIndex !== null) {
      const newPoints = [...points];
      newPoints[editingPointIndex] = editValue;
      onUpdate({ supportingPoints: newPoints });
    }

    setEditingField(null);
    setEditingPointIndex(null);
    setEditValue("");
  }, [editingField, editingPointIndex, editValue, onUpdate, points]);

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setEditingPointIndex(null);
    setEditValue("");
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  const isEditable = !!onUpdate;

  return (
    <KCard className="p-4 sm:p-5">
      {/* Title + Quality band */}
      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
        {editingField === "title" ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 text-xs sm:text-sm font-semibold text-kairo-fg leading-snug bg-kairo-bg-elevated border border-kairo-accent-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-kairo-accent-400"
          />
        ) : (
          <h3
            onClick={() => startEditing("title", pkg.title)}
            className={[
              "text-xs sm:text-sm font-semibold text-kairo-fg leading-snug",
              isEditable && "cursor-pointer hover:bg-kairo-bg-hover rounded px-1 -mx-1 transition-colors",
            ].filter(Boolean).join(" ")}
            title={isEditable ? "Click to edit" : undefined}
          >
            {pkg.title}
          </h3>
        )}
        <KTag variant={bandVariants[pkg.quality.band] || "muted"} className="shrink-0 uppercase text-[10px] sm:text-xs">
          {bandLabels[pkg.quality.band] || pkg.quality.band}
        </KTag>
      </div>

      {/* Thesis / Core argument */}
      <div className="mb-4 sm:mb-5">
        <p className="text-[10px] sm:text-xs font-medium text-kairo-fg-subtle uppercase tracking-wide mb-1 sm:mb-1.5">
          Core Argument
        </p>
        {editingField === "thesis" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            rows={3}
            className="w-full text-xs sm:text-sm text-kairo-fg-muted leading-relaxed bg-kairo-bg-elevated border border-kairo-accent-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-kairo-accent-400 resize-none"
          />
        ) : (
          <p
            onClick={() => startEditing("thesis", pkg.thesis)}
            className={[
              "text-xs sm:text-sm text-kairo-fg-muted leading-relaxed",
              isEditable && "cursor-pointer hover:bg-kairo-bg-hover rounded px-1 -mx-1 py-0.5 transition-colors",
            ].filter(Boolean).join(" ")}
            title={isEditable ? "Click to edit" : undefined}
          >
            {pkg.thesis}
          </p>
        )}
      </div>

      {/* Supporting points / Outline beats */}
      {points.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <p className="text-[10px] sm:text-xs font-medium text-kairo-fg-subtle uppercase tracking-wide mb-1.5 sm:mb-2">
            Key Points
          </p>
          <ul className="space-y-1 sm:space-y-1.5">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-kairo-fg-muted">
                <span className="text-kairo-fg-subtle shrink-0 mt-0.5">•</span>
                {editingField === "point" && editingPointIndex === idx ? (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-[11px] sm:text-xs text-kairo-fg-muted bg-kairo-bg-elevated border border-kairo-accent-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-kairo-accent-400"
                  />
                ) : (
                  <span
                    onClick={() => startEditingPoint(idx, point)}
                    className={[
                      isEditable && "cursor-pointer hover:bg-kairo-bg-hover rounded px-1 -mx-1 transition-colors",
                    ].filter(Boolean).join(" ")}
                    title={isEditable ? "Click to edit" : undefined}
                  >
                    {point}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta row */}
      <div className="pt-2.5 sm:pt-3 border-t border-kairo-border-subtle">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap text-[10px] sm:text-xs text-kairo-fg-muted">
          <span className="font-medium capitalize">{pkg.format.replace(/_/g, " ")}</span>
          {pkg.persona && (
            <>
              <span className="text-kairo-border-strong">·</span>
              <span>{pkg.persona}</span>
            </>
          )}
          {pkg.pillar && (
            <>
              <span className="text-kairo-border-strong">·</span>
              <span>{pkg.pillar}</span>
            </>
          )}
          {uniqueChannels.length > 0 && (
            <>
              <span className="text-kairo-border-strong">·</span>
              <div className="flex items-center gap-1 flex-wrap">
                {uniqueChannels.map((channel) => (
                  <span
                    key={channel}
                    className={[
                      "inline-flex items-center",
                      "px-1 sm:px-1.5 py-0.5",
                      "rounded-(--kairo-radius-xs)",
                      "text-[10px] sm:text-xs",
                      "bg-kairo-bg-elevated text-kairo-fg-muted",
                      "border border-kairo-border-subtle",
                    ].join(" ")}
                  >
                    {channelLabels[channel] || channel}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </KCard>
  );
}

PackageSummaryCard.displayName = "PackageSummaryCard";
