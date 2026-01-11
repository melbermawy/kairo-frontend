import { KButton, KTag } from "@/components/ui";
import type { OpportunityType } from "@/lib/mockApi";

const LOW_SCORE_THRESHOLD = 60;

export interface OpportunityCardProps {
  id: string;
  type: OpportunityType;
  score: number;
  title: string;
  angle: string;
  persona: string;
  pillar: string;
  source: string;
  isPinned?: boolean;
  isSnoozed?: boolean;
  // Action callbacks (wired to mockApi stubs)
  onPin?: () => void;
  onSnooze?: () => void;
  onOpenAsPackage?: () => void;
}

const typeLabels: Record<OpportunityType, string> = {
  trend: "Trend",
  evergreen: "Evergreen",
  competitive: "Competitive",
};

export function OpportunityCard({
  type,
  score,
  title,
  angle,
  persona,
  pillar,
  source,
  isPinned = false,
  isSnoozed = false,
  onPin,
  onSnooze,
  onOpenAsPackage,
}: OpportunityCardProps) {
  const isLowScore = score < LOW_SCORE_THRESHOLD;

  return (
    <article
      className={[
        "group relative",
        "rounded-(--kairo-radius-md)",
        "px-3.5 py-3",
        "kairo-transition-soft",
        // Background + shadow + hover scale
        isSnoozed
          ? "bg-kairo-surface-soft shadow-none"
          : "bg-kairo-surface-plain shadow-soft hover:shadow-elevated hover:scale-[1.01] hover:bg-kairo-surface-soft",
        // Border: thinner accent for pinned
        isPinned
          ? "border-l-2 border-l-kairo-aqua-500 border-t border-r border-b border-kairo-border-subtle"
          : "border border-kairo-border-subtle",
        // Focus
        "focus-within:ring-2 focus-within:ring-kairo-aqua-500 focus-within:ring-offset-2 focus-within:ring-offset-kairo-sand-50",
      ].join(" ")}
    >
      {/* Top strip: Type pill + Score chip */}
      <div className="flex items-center justify-between mb-2">
        <KTag
          variant={type}
          className={isSnoozed ? "opacity-50" : ""}
        >
          {typeLabels[type]}
        </KTag>

        {/* Score chip - compact, metric-like */}
        <span
          className={[
            "inline-flex items-center gap-1 px-1.5 py-px",
            "rounded-(--kairo-radius-xs)",
            "text-[10px] font-medium tracking-wide",
            "kairo-transition-fast",
            isLowScore
              ? "bg-kairo-tag-low-score-bg/60 text-kairo-tag-low-score-fg group-hover:bg-kairo-tag-low-score-bg/80"
              : "bg-kairo-sand-100 text-kairo-ink-600 group-hover:bg-kairo-sand-100 group-hover:text-kairo-ink-700",
            isSnoozed ? "opacity-50" : "",
          ].join(" ")}
        >
          <ScoreIcon className="w-2.5 h-2.5" />
          {score}
        </span>
      </div>

      {/* Title */}
      <h3
        className={[
          "text-[15px] font-semibold leading-tight",
          "line-clamp-1",
          isSnoozed ? "text-kairo-ink-500" : "text-kairo-ink-900",
        ].join(" ")}
      >
        {title}
      </h3>

      {/* Angle / Why now */}
      <p
        className={[
          "text-sm leading-snug mt-0.5",
          "line-clamp-2",
          isSnoozed ? "text-kairo-ink-400" : "text-kairo-ink-700",
        ].join(" ")}
      >
        {angle}
      </p>

      {/* Meta row: Persona + Pillar + Source - de-emphasized */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs text-kairo-ink-500 mt-3">
        <span className={isSnoozed ? "text-kairo-ink-400" : ""}>
          {persona}
        </span>
        <span className="text-kairo-ink-300">·</span>
        <span className={isSnoozed ? "text-kairo-ink-400" : ""}>
          {pillar}
        </span>
        <span className="text-kairo-ink-300">·</span>
        <span className={isSnoozed ? "text-kairo-ink-300" : "text-kairo-ink-400"}>
          {source}
        </span>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2.5 border-t border-kairo-border-subtle">
        <KButton
          variant="ghost"
          size="sm"
          onClick={onPin}
          className={[
            "text-[12px] px-2 kairo-transition-fast",
            isPinned ? "text-kairo-aqua-600" : "text-kairo-ink-500",
          ].join(" ")}
        >
          {isPinned ? "Unpin" : "Pin"}
        </KButton>
        <KButton
          variant="ghost"
          size="sm"
          onClick={onSnooze}
          className="text-[12px] px-2 text-kairo-ink-500 kairo-transition-fast"
        >
          {isSnoozed ? "Unsnooze" : "Snooze"}
        </KButton>
        <KButton
          size="sm"
          onClick={onOpenAsPackage}
          className="text-[12px] kairo-transition-fast group-hover:-translate-y-px"
        >
          Open as Package
        </KButton>
      </div>
    </article>
  );
}

// Simple score icon (chart/metric style)
function ScoreIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 9L4 6L7 8L11 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="3" r="1.5" fill="currentColor" />
    </svg>
  );
}

OpportunityCard.displayName = "OpportunityCard";
