"use client";

import { useState, useEffect, useMemo } from "react";
import { KCard, KButton } from "@/components/ui";
import type {
  BrandBrainSnapshot,
  BrandBrainOverrides,
  FieldSource,
} from "@/contracts";
import { getQuestionMeta } from "@/contracts";
import { ProvenanceList } from "./ProvenanceList";

interface FieldEditPanelProps {
  path: string;
  snapshot: BrandBrainSnapshot;
  overrides: BrandBrainOverrides | null;
  isSaving: boolean;
  onSave: (path: string, value: unknown, pin: boolean) => void;
  onRemoveOverride: (path: string) => void;
  onClose: () => void;
}

// Helper to get a nested value from snapshot
function getFieldNode(snapshot: BrandBrainSnapshot, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = snapshot;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === "object") {
      // Handle array indices
      if (/^\d+$/.test(part)) {
        current = (current as unknown[])[parseInt(part, 10)];
      } else {
        current = (current as Record<string, unknown>)[part];
      }
    } else {
      return undefined;
    }
  }

  return current;
}

export function FieldEditPanel({
  path,
  snapshot,
  overrides,
  isSaving,
  onSave,
  onRemoveOverride,
  onClose,
}: FieldEditPanelProps) {
  const fieldNode = getFieldNode(snapshot, path) as {
    value: unknown;
    confidence: number;
    sources: FieldSource[];
    locked: boolean;
    override_value: unknown;
  } | undefined;

  const [editValue, setEditValue] = useState<string>("");
  const [isPinned, setIsPinned] = useState(false);

  // Current state
  const hasOverride = overrides?.overrides_json[path] !== undefined;
  const currentlyPinned = overrides?.pinned_paths.includes(path) ?? false;
  const displayValue = fieldNode?.override_value ?? fieldNode?.value;
  const isArray = Array.isArray(fieldNode?.value);

  // Initialize edit value
  useEffect(() => {
    if (fieldNode) {
      const val = fieldNode.override_value ?? fieldNode.value;
      if (Array.isArray(val)) {
        setEditValue(val.join(", "));
      } else {
        setEditValue(String(val ?? ""));
      }
      setIsPinned(currentlyPinned);
    }
  }, [fieldNode, currentlyPinned, path]);

  // Parse label from path
  const label = useMemo(() => {
    const parts = path.split(".");
    const lastPart = parts[parts.length - 1];
    return lastPart
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [path]);

  // Handle save
  const handleSave = () => {
    let value: unknown = editValue;
    if (isArray) {
      value = editValue
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    onSave(path, value, isPinned);
  };

  if (!fieldNode) {
    return (
      <KCard className="p-5">
        <p className="text-[13px] text-kairo-fg-muted">Field not found</p>
      </KCard>
    );
  }

  return (
    <KCard className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h4 className="text-[14px] font-semibold text-kairo-fg">{label}</h4>
          <p className="text-[11px] text-kairo-fg-subtle">{path}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-kairo-bg-elevated text-kairo-fg-muted hover:text-kairo-fg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Current inferred value */}
      <div className="mb-4">
        <label className="block text-[11px] font-medium text-kairo-fg-muted uppercase tracking-wide mb-1">
          Inferred Value
        </label>
        <div className="p-2 rounded bg-kairo-bg-elevated text-[12px] text-kairo-fg-muted">
          {isArray
            ? (fieldNode.value as string[]).join(", ") || "None"
            : String(fieldNode.value) || "None"}
        </div>
        <p className="text-[10px] text-kairo-fg-subtle mt-1">
          Confidence: {Math.round(fieldNode.confidence * 100)}%
        </p>
      </div>

      {/* Override input */}
      <div className="mb-4">
        <label className="block text-[11px] font-medium text-kairo-fg-muted uppercase tracking-wide mb-1">
          Override Value
        </label>
        {isArray ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter comma-separated values..."
            rows={3}
            className="
              w-full px-3 py-2 rounded-lg text-[13px]
              bg-kairo-bg-elevated border border-kairo-border-subtle
              text-kairo-fg placeholder:text-kairo-fg-subtle
              focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
              resize-none
            "
          />
        ) : (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter override value..."
            rows={3}
            className="
              w-full px-3 py-2 rounded-lg text-[13px]
              bg-kairo-bg-elevated border border-kairo-border-subtle
              text-kairo-fg placeholder:text-kairo-fg-subtle
              focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
              resize-none
            "
          />
        )}
        {isArray && (
          <p className="text-[10px] text-kairo-fg-subtle mt-1">
            Separate items with commas
          </p>
        )}
      </div>

      {/* Pin toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`
              relative w-9 h-5 rounded-full transition-colors
              ${isPinned ? "bg-kairo-accent-500" : "bg-kairo-bg-elevated"}
            `}
          >
            <span
              className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                ${isPinned ? "left-4" : "left-0.5"}
              `}
            />
          </button>
          <span className="text-[12px] text-kairo-fg">
            Pin this field
          </span>
        </label>
        <p className="text-[10px] text-kairo-fg-subtle mt-1 ml-11">
          Pinned fields keep their override value after recompile.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-6">
        <KButton onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Override"}
        </KButton>
        {hasOverride && (
          <KButton
            variant="secondary"
            onClick={() => onRemoveOverride(path)}
            disabled={isSaving}
          >
            Remove Override
          </KButton>
        )}
      </div>

      {/* Provenance */}
      <div className="border-t border-kairo-border-subtle pt-4">
        <h5 className="text-[11px] font-medium text-kairo-fg-muted uppercase tracking-wide mb-3">
          Sources
        </h5>
        <ProvenanceList sources={fieldNode.sources} />
      </div>
    </KCard>
  );
}

FieldEditPanel.displayName = "FieldEditPanel";
