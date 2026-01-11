import { KTag } from "@/components/ui";
import type { Pattern, PatternStatus } from "@/lib/mockApi";

interface PatternRowProps {
  pattern: Pattern;
}

const statusVariants: Record<PatternStatus, "evergreen" | "campaign" | "danger"> = {
  active: "evergreen",
  experimental: "campaign",
  deprecated: "danger",
};

const statusLabels: Record<PatternStatus, string> = {
  active: "Active",
  experimental: "Experimental",
  deprecated: "Deprecated",
};

function formatLastUsed(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 14) return "1w ago";
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function PatternRow({ pattern }: PatternRowProps) {
  return (
    <article
      className={[
        "group",
        "rounded-(--kairo-radius-md)",
        "bg-kairo-surface-plain",
        "border border-kairo-border-subtle",
        "px-4 py-3",
        "kairo-transition-soft",
        "hover:border-kairo-border-strong hover:bg-kairo-sand-25 hover:shadow-elevated hover:scale-[1.005]",
        "cursor-pointer",
      ].join(" ")}
    >
      {/* Top line: Name + Status + Channels */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-kairo-ink-900 truncate">
            {pattern.name}
          </h3>
          <KTag
            variant={statusVariants[pattern.status]}
            className="shrink-0 uppercase text-xs"
          >
            {statusLabels[pattern.status]}
          </KTag>
        </div>

        {/* Channel chips */}
        <div className="flex items-center gap-1 shrink-0">
          {pattern.channels.map((channel) => (
            <span
              key={channel}
              className={[
                "inline-flex items-center",
                "px-1.5 py-0.5",
                "rounded-(--kairo-radius-xs)",
                "text-xs font-medium",
                "bg-kairo-sand-75 text-kairo-ink-600",
                "border border-kairo-border-subtle",
              ].join(" ")}
            >
              {channel}
            </span>
          ))}
        </div>
      </div>

      {/* Beat bar - clamped to 4 beats */}
      <div className="flex items-center gap-1 mb-2">
        {pattern.beats.slice(0, 4).map((beat, idx) => (
          <span
            key={idx}
            className={[
              "inline-flex items-center",
              "px-2 py-0.5",
              "rounded-(--kairo-radius-xs)",
              "text-xs font-medium",
              "bg-kairo-aqua-50 text-kairo-aqua-600",
              "kairo-transition-fast",
              "group-hover:bg-kairo-aqua-100 group-hover:-translate-y-px",
            ].join(" ")}
          >
            {beat}
          </span>
        ))}
        {pattern.beats.length > 4 && (
          <span className="text-xs text-kairo-ink-400">…</span>
        )}
      </div>

      {/* Bottom line: Usage meta - de-emphasized */}
      <div className="text-xs text-kairo-ink-400">
        {pattern.usageCount} uses · Last {formatLastUsed(pattern.lastUsedDaysAgo)}
      </div>
    </article>
  );
}

PatternRow.displayName = "PatternRow";
