"use client";

import { KTag } from "@/components/ui";
import type { StringFieldNode, StringArrayFieldNode } from "@/contracts";

type AnyFieldNode = StringFieldNode | StringArrayFieldNode;

interface FieldNodeViewProps {
  path: string;
  label: string;
  node: AnyFieldNode;
  isOverridden: boolean;
  isPinned: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function FieldNodeView({
  path,
  label,
  node,
  isOverridden,
  isPinned,
  isSelected,
  onClick,
}: FieldNodeViewProps) {
  // Get display value (override or original)
  const displayValue = node.override_value ?? node.value;
  const isArray = Array.isArray(displayValue);

  // Confidence indicator
  const confidenceColor =
    node.confidence >= 0.8
      ? "bg-kairo-success-fg"
      : node.confidence >= 0.5
      ? "bg-kairo-warning-fg"
      : "bg-kairo-error-fg";

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border transition-all
        ${
          isSelected
            ? "bg-kairo-accent-500/10 border-kairo-accent-500"
            : "bg-kairo-bg-elevated border-kairo-border-subtle hover:border-kairo-border-strong"
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-medium text-kairo-fg-muted uppercase tracking-wide">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {/* Confidence indicator */}
          <span
            className={`w-1.5 h-1.5 rounded-full ${confidenceColor}`}
            title={`Confidence: ${Math.round(node.confidence * 100)}%`}
          />

          {/* Override/pin badges */}
          {isPinned && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-kairo-accent-500/20 text-kairo-accent-400">
              Pinned
            </span>
          )}
          {isOverridden && !isPinned && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-kairo-warning-bg text-kairo-warning-fg">
              Override
            </span>
          )}
          {node.locked && (
            <svg
              className="w-3 h-3 text-kairo-fg-subtle"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Value display */}
      {isArray ? (
        <div className="flex flex-wrap gap-1">
          {(displayValue as string[]).map((item, i) => (
            <span
              key={i}
              className={`
                px-2 py-0.5 rounded-full text-[11px]
                ${
                  isOverridden
                    ? "bg-kairo-warning-bg text-kairo-warning-fg"
                    : "bg-kairo-bg-card text-kairo-fg-muted"
                }
              `}
            >
              {item}
            </span>
          ))}
          {(displayValue as string[]).length === 0 && (
            <span className="text-[12px] text-kairo-fg-subtle italic">
              No items
            </span>
          )}
        </div>
      ) : (
        <p
          className={`
            text-[13px] leading-relaxed
            ${isOverridden ? "text-kairo-warning-fg" : "text-kairo-fg"}
          `}
        >
          {displayValue as string || <span className="italic text-kairo-fg-subtle">Not set</span>}
        </p>
      )}

      {/* Source count hint */}
      {node.sources.length > 0 && (
        <p className="text-[10px] text-kairo-fg-subtle mt-2">
          {node.sources.length} source{node.sources.length !== 1 ? "s" : ""}
        </p>
      )}
    </button>
  );
}

FieldNodeView.displayName = "FieldNodeView";
