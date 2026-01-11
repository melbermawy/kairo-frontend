"use client";

import { useMemo, useState, useCallback } from "react";
import type { EvidenceItem, EvidencePlatform } from "@/lib/mockApi";
import { EvidenceTileExpanded } from "./EvidenceTileExpanded";
import { PlatformBadgesRow } from "./PlatformBadgesRow";

interface EvidenceListProps {
  evidence: EvidenceItem[];
  initialPlatformFilter?: EvidencePlatform | null;
  onPlatformFilterChange?: (platform: EvidencePlatform | null) => void;
  className?: string;
}

export function EvidenceList({
  evidence,
  initialPlatformFilter = null,
  onPlatformFilterChange,
  className = "",
}: EvidenceListProps) {
  const [platformFilter, setPlatformFilter] = useState<EvidencePlatform | null>(
    initialPlatformFilter
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sync filter state with parent if controlled
  const activePlatform = initialPlatformFilter ?? platformFilter;

  const handlePlatformClick = useCallback(
    (platform: EvidencePlatform | null) => {
      setPlatformFilter(platform);
      onPlatformFilterChange?.(platform);
    },
    [onPlatformFilterChange]
  );

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Filter evidence by platform
  const filteredEvidence = useMemo(() => {
    if (!activePlatform) return evidence;
    return evidence.filter((ev) => ev.platform === activePlatform);
  }, [evidence, activePlatform]);

  if (evidence.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-[13px] text-kairo-fg-muted">No evidence available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Platform filter row */}
      <div className="mb-3">
        <PlatformBadgesRow
          evidence={evidence}
          activePlatform={activePlatform}
          onPlatformClick={handlePlatformClick}
          size="sm"
        />
      </div>

      {/* Evidence count */}
      <p className="text-[11px] text-kairo-fg-subtle mb-2">
        {activePlatform
          ? `Showing ${filteredEvidence.length} of ${evidence.length} items`
          : `${evidence.length} items`}
      </p>

      {/* Evidence tiles */}
      <div className="space-y-2" data-testid="evidence-list">
        {filteredEvidence.map((ev) => (
          <EvidenceTileExpanded
            key={ev.id}
            evidence={ev}
            isExpanded={expandedId === ev.id}
            onToggle={() => handleToggle(ev.id)}
          />
        ))}
      </div>

      {/* Empty state when filtered */}
      {filteredEvidence.length === 0 && activePlatform && (
        <div className="text-center py-4">
          <p className="text-[12px] text-kairo-fg-muted">
            No evidence for this platform
          </p>
          <button
            onClick={() => handlePlatformClick(null)}
            className="mt-2 text-[11px] text-kairo-accent-400 hover:text-kairo-accent-300 transition-colors"
          >
            Show all
          </button>
        </div>
      )}
    </div>
  );
}

EvidenceList.displayName = "EvidenceList";
