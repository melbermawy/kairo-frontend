"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import Link from "next/link";
import { KCard, KTag } from "@/components/ui";
import type { OpportunityWithEvidence } from "@/lib/mockApi";

interface PackageBriefProps {
  title: string;
  thesis: string;
  outlineBeats: string[];
  cta: string;
  format: string;
  quality: {
    band: string;
    score: number;
    issues: string[];
  };
  guardrails?: {
    do: string[];
    dont: string[];
  };
  opportunity?: OpportunityWithEvidence | null;
  brandId: string;
  onUpdate?: (updates: {
    title?: string;
    thesis?: string;
    outlineBeats?: string[];
    cta?: string;
  }) => void;
}

const bandVariants: Record<string, "muted" | "campaign" | "evergreen"> = {
  good: "evergreen",
  partial: "campaign",
  needs_work: "muted",
};

const bandLabels: Record<string, string> = {
  good: "Ready",
  partial: "In Progress",
  needs_work: "Needs Work",
};

export function PackageBrief({
  title,
  thesis,
  outlineBeats,
  cta,
  format,
  quality,
  guardrails,
  opportunity,
  brandId,
  onUpdate,
}: PackageBriefProps) {
  // Editable state
  const [editingField, setEditingField] = useState<"title" | "thesis" | "cta" | "beat" | null>(null);
  const [editingBeatIndex, setEditingBeatIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const isEditable = !!onUpdate;

  const startEditing = useCallback((field: "title" | "thesis" | "cta", value: string) => {
    if (!onUpdate) return;
    setEditingField(field);
    setEditValue(value);
    setEditingBeatIndex(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onUpdate]);

  const startEditingBeat = useCallback((index: number, value: string) => {
    if (!onUpdate) return;
    setEditingField("beat");
    setEditingBeatIndex(index);
    setEditValue(value);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onUpdate]);

  const saveEdit = useCallback(() => {
    if (!editingField || !onUpdate) return;

    if (editingField === "title") {
      onUpdate({ title: editValue });
    } else if (editingField === "thesis") {
      onUpdate({ thesis: editValue });
    } else if (editingField === "cta") {
      onUpdate({ cta: editValue });
    } else if (editingField === "beat" && editingBeatIndex !== null) {
      const newBeats = [...outlineBeats];
      newBeats[editingBeatIndex] = editValue;
      onUpdate({ outlineBeats: newBeats });
    }

    setEditingField(null);
    setEditingBeatIndex(null);
    setEditValue("");
  }, [editingField, editingBeatIndex, editValue, onUpdate, outlineBeats]);

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setEditingBeatIndex(null);
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

  return (
    <KCard className="p-5">
      {/* Header: Title + Quality */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          {editingField === "title" ? (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="w-full text-base font-semibold text-kairo-fg bg-kairo-bg-elevated border border-kairo-accent-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-kairo-accent-400"
            />
          ) : (
            <h2
              onClick={() => startEditing("title", title)}
              className={[
                "text-base font-semibold text-kairo-fg leading-snug",
                isEditable && "cursor-pointer hover:bg-kairo-bg-hover rounded px-1 -mx-1 transition-colors",
              ].filter(Boolean).join(" ")}
              title={isEditable ? "Click to edit" : undefined}
            >
              {title}
            </h2>
          )}
          <p className="text-xs text-kairo-fg-muted mt-1 capitalize">
            {format.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={[
              "inline-flex items-center justify-center w-9 h-7 rounded-md text-sm font-bold",
              quality.score >= 80
                ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
                : quality.score >= 60
                ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
                : "bg-kairo-score-low-bg text-kairo-score-low-fg",
            ].join(" ")}
          >
            {quality.score}
          </span>
          <KTag variant={bandVariants[quality.band] || "muted"} className="text-[10px] uppercase">
            {bandLabels[quality.band] || quality.band}
          </KTag>
        </div>
      </div>

      {/* Core Argument (Hook) */}
      <section className="mb-4">
        <h3 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
          Core Argument
        </h3>
        {editingField === "thesis" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            rows={3}
            className="w-full text-sm text-kairo-fg leading-relaxed bg-kairo-bg-elevated border border-kairo-accent-400 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-kairo-accent-400 resize-none"
          />
        ) : (
          <p
            onClick={() => startEditing("thesis", thesis)}
            className={[
              "text-sm text-kairo-fg leading-relaxed",
              isEditable && "cursor-pointer hover:bg-kairo-bg-hover rounded px-1 -mx-1 py-0.5 transition-colors",
            ].filter(Boolean).join(" ")}
            title={isEditable ? "Click to edit" : undefined}
          >
            {thesis}
          </p>
        )}
      </section>

      {/* Proof Plan (Outline Beats) */}
      {outlineBeats.length > 0 && (
        <section className="mb-4">
          <h3 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
            Proof Plan
          </h3>
          <ol className="space-y-1">
            {outlineBeats.map((beat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-kairo-fg-muted">
                <span className="text-kairo-fg-subtle shrink-0 w-4 text-right">{idx + 1}.</span>
                {editingField === "beat" && editingBeatIndex === idx ? (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-sm text-kairo-fg-muted bg-kairo-bg-elevated border border-kairo-accent-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-kairo-accent-400"
                  />
                ) : (
                  <span
                    onClick={() => startEditingBeat(idx, beat)}
                    className={[
                      isEditable && "cursor-pointer hover:bg-kairo-bg-hover rounded px-1 -mx-1 transition-colors",
                    ].filter(Boolean).join(" ")}
                    title={isEditable ? "Click to edit" : undefined}
                  >
                    {beat}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* CTA Posture */}
      <section className="mb-4">
        <h3 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
          CTA Posture
        </h3>
        {editingField === "cta" ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="w-full text-sm text-kairo-fg bg-kairo-bg-elevated border border-kairo-accent-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-kairo-accent-400"
          />
        ) : (
          <p
            onClick={() => startEditing("cta", cta)}
            className={[
              "text-sm text-kairo-fg",
              isEditable && "cursor-pointer hover:bg-kairo-bg-hover rounded px-1 -mx-1 py-0.5 transition-colors",
            ].filter(Boolean).join(" ")}
            title={isEditable ? "Click to edit" : undefined}
          >
            {cta}
          </p>
        )}
      </section>

      {/* Guardrails (condensed) */}
      {guardrails && guardrails.dont.length > 0 && (
        <section className="mb-4 pt-3 border-t border-kairo-border-subtle">
          <h3 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
            Guardrails
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {guardrails.dont.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-kairo-error-bg/30 text-kairo-error-fg border border-kairo-error-bg/50"
              >
                <span className="text-[10px]">✕</span>
                {item}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Source Opportunity Link */}
      {opportunity && (
        <section className="pt-3 border-t border-kairo-border-subtle">
          <h3 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
            Source
          </h3>
          <Link
            href={`/brands/${brandId}/today`}
            className="group flex items-center gap-2 p-2 -mx-2 rounded-md hover:bg-kairo-bg-hover transition-colors"
          >
            <span
              className={[
                "inline-flex items-center justify-center w-7 h-5 rounded text-xs font-semibold",
                opportunity.score >= 80
                  ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
                  : opportunity.score >= 70
                  ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
                  : "bg-kairo-score-low-bg text-kairo-score-low-fg",
              ].join(" ")}
            >
              {opportunity.score}
            </span>
            <span className="flex-1 text-sm text-kairo-accent-400 group-hover:text-kairo-accent-300 truncate">
              {opportunity.title}
            </span>
            <svg className="w-4 h-4 text-kairo-fg-subtle group-hover:text-kairo-accent-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      )}

      {/* Quality Issues */}
      {quality.issues.length > 0 && (
        <section className="mt-4 pt-3 border-t border-kairo-border-subtle">
          <h3 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
            Issues ({quality.issues.length})
          </h3>
          <ul className="space-y-1">
            {quality.issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-kairo-warning-fg">
                <span className="shrink-0">!</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </KCard>
  );
}

PackageBrief.displayName = "PackageBrief";
