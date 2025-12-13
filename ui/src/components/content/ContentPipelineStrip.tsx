import { KCard } from "@/components/ui";

interface PipelineCounts {
  draft: number;
  inReview: number;
  scheduled: number;
  published: number;
}

interface ContentPipelineStripProps {
  counts: PipelineCounts;
  atRiskCount: number;
}

const segments: { key: keyof PipelineCounts; label: string; color: string }[] = [
  { key: "draft", label: "Draft", color: "bg-kairo-sand-200" },
  { key: "inReview", label: "In Review", color: "bg-kairo-tag-campaign-bg" },
  { key: "scheduled", label: "Scheduled", color: "bg-kairo-aqua-200" },
  { key: "published", label: "Published", color: "bg-kairo-tag-evergreen-bg" },
];

export function ContentPipelineStrip({
  counts,
  atRiskCount,
}: ContentPipelineStripProps) {
  const total = counts.draft + counts.inReview + counts.scheduled + counts.published;

  return (
    <KCard className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          {/* Label */}
          <p className="text-xs font-medium text-kairo-ink-500 uppercase tracking-wide mb-2">
            Content pipeline
          </p>

          {/* Bar segments with entry animation */}
          <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-kairo-sand-100">
            {segments.map((seg, idx) => {
              const count = counts[seg.key];
              if (count === 0) return null;
              const width = total > 0 ? (count / total) * 100 : 0;
              return (
                <div
                  key={seg.key}
                  className={`h-full ${seg.color} first:rounded-l-full last:rounded-r-full animate-[kairo-grow-width_var(--kairo-motion-slow)_var(--kairo-ease-soft)_forwards]`}
                  style={{
                    width: `${width}%`,
                    animationDelay: `${idx * 60}ms`,
                  }}
                />
              );
            })}
          </div>

          {/* Labels row */}
          <div className="flex items-center gap-4 mt-2">
            {segments.map((seg) => (
              <div key={seg.key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${seg.color}`} />
                <span className="text-xs text-kairo-ink-600">
                  {seg.label}
                  <span className="text-kairo-ink-400 ml-1">{counts[seg.key]}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* At risk indicator with gentle breathing animation */}
        {atRiskCount > 0 && (
          <div className="shrink-0">
            <span
              className={[
                "inline-flex items-center gap-1.5",
                "px-2.5 py-1",
                "rounded-(--kairo-radius-pill)",
                "bg-kairo-tag-low-score-bg/50 text-kairo-tag-low-score-fg",
                "text-xs font-medium",
                "animate-[kairo-breath_10s_var(--kairo-ease-soft)_infinite]",
              ].join(" ")}
            >
              <span>Most at risk:</span>
              <span className="font-semibold">{atRiskCount} stale drafts</span>
            </span>
          </div>
        )}
      </div>
    </KCard>
  );
}

ContentPipelineStrip.displayName = "ContentPipelineStrip";
