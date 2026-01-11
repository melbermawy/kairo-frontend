"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { FieldSource, BrandBrainEvidence } from "@/contracts";
import { getQuestionMeta } from "@/contracts";
import { EvidencePreviewCard } from "./EvidencePreviewCard";

interface ProvenanceListProps {
  sources: FieldSource[];
}

export function ProvenanceList({ sources }: ProvenanceListProps) {
  const [evidenceItems, setEvidenceItems] = useState<Record<string, BrandBrainEvidence>>({});
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Separate answer and evidence sources
  const answerSources = sources.filter((s) => s.type === "answer");
  const evidenceSources = sources.filter((s) => s.type === "evidence");

  // Load evidence items
  useEffect(() => {
    const evidenceIds = evidenceSources.map((s) => s.id);
    if (evidenceIds.length === 0) return;

    setLoadingEvidence(true);
    api
      .getEvidenceBatch(evidenceIds)
      .then((items) => {
        const map: Record<string, BrandBrainEvidence> = {};
        items.forEach((item) => {
          map[item.id] = item;
        });
        setEvidenceItems(map);
      })
      .catch((err) => {
        console.error("Failed to load evidence:", err);
      })
      .finally(() => {
        setLoadingEvidence(false);
      });
  }, [sources]);

  if (sources.length === 0) {
    return (
      <p className="text-[12px] text-kairo-fg-subtle italic">
        No sources available
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Answer sources */}
      {answerSources.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wide mb-2">
            From Onboarding Answers
          </p>
          <div className="space-y-2">
            {answerSources.map((source) => {
              const questionMeta = getQuestionMeta(source.id);
              return (
                <div
                  key={source.id}
                  className="p-2 rounded bg-kairo-bg-elevated text-[11px]"
                >
                  <span className="text-kairo-fg-muted">
                    {questionMeta?.label || source.id}
                  </span>
                  {questionMeta && (
                    <span className="ml-2 text-kairo-fg-subtle">
                      (Tier {questionMeta.tier})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence sources */}
      {evidenceSources.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wide mb-2">
            From Evidence
          </p>
          {loadingEvidence ? (
            <div className="flex items-center gap-2 text-[11px] text-kairo-fg-subtle">
              <svg
                className="animate-spin h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading evidence...
            </div>
          ) : (
            <div className="space-y-2">
              {evidenceSources.map((source) => {
                const evidence = evidenceItems[source.id];
                return (
                  <EvidencePreviewCard
                    key={source.id}
                    evidenceId={source.id}
                    evidence={evidence}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ProvenanceList.displayName = "ProvenanceList";
