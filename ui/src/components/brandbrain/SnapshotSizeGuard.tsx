"use client";

import { useState, useMemo } from "react";
import { KCard, KButton } from "@/components/ui";

const MAX_SAFE_SIZE_BYTES = 200 * 1024; // 200KB threshold

interface SnapshotSizeGuardProps {
  data: unknown;
  label?: string;
  children: React.ReactNode;
}

// Calculate approximate size of JSON data
function estimateJsonSize(data: unknown): number {
  try {
    return JSON.stringify(data).length;
  } catch {
    return 0;
  }
}

// Format bytes for display
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Get summary statistics for an object
function getSummaryStats(data: unknown): Record<string, number | string> {
  if (data === null || data === undefined) {
    return { type: "null" };
  }

  if (Array.isArray(data)) {
    return {
      type: "array",
      length: data.length,
      firstItemType: data.length > 0 ? typeof data[0] : "empty",
    };
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);
    return {
      type: "object",
      keys: keys.length,
      topLevelKeys: keys.slice(0, 10).join(", ") + (keys.length > 10 ? "..." : ""),
    };
  }

  return {
    type: typeof data,
    preview: String(data).slice(0, 100),
  };
}

export function SnapshotSizeGuard({
  data,
  label = "Data",
  children,
}: SnapshotSizeGuardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { size, isLarge, stats } = useMemo(() => {
    const size = estimateJsonSize(data);
    return {
      size,
      isLarge: size > MAX_SAFE_SIZE_BYTES,
      stats: getSummaryStats(data),
    };
  }, [data]);

  // If data is small, render children directly
  if (!isLarge) {
    return <>{children}</>;
  }

  // Large data - show warning and expand button
  if (!isExpanded) {
    return (
      <KCard className="p-4 border-kairo-warning-fg/30">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-kairo-warning-bg">
              <svg
                className="w-5 h-5 text-kairo-warning-fg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-[13px] font-medium text-kairo-fg">
                Large {label} ({formatBytes(size)})
              </h4>
              <p className="text-[12px] text-kairo-fg-muted mt-1">
                This data exceeds {formatBytes(MAX_SAFE_SIZE_BYTES)} and may cause performance issues if rendered fully.
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="p-3 rounded-lg bg-kairo-bg-elevated text-[11px] font-mono">
            <div className="space-y-1 text-kairo-fg-muted">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key}>
                  <span className="text-kairo-fg-subtle">{key}:</span>{" "}
                  <span className="text-kairo-fg">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <KButton
            variant="secondary"
            size="sm"
            onClick={() => setIsExpanded(true)}
          >
            Expand Full View (may be slow)
          </KButton>
        </div>
      </KCard>
    );
  }

  // User chose to expand - render with collapse option
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-kairo-fg-subtle">
          Showing large {label} ({formatBytes(size)})
        </span>
        <KButton
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(false)}
        >
          Collapse
        </KButton>
      </div>
      {children}
    </div>
  );
}

SnapshotSizeGuard.displayName = "SnapshotSizeGuard";
