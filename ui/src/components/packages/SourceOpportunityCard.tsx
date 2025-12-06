import Link from "next/link";
import { KCard, KTag } from "@/components/ui";
import type { DemoOpportunity, OpportunityType } from "@/demo/opportunities";

interface SourceOpportunityCardProps {
  opportunity: DemoOpportunity;
  brandId: string;
}

const typeLabels: Record<OpportunityType, string> = {
  trend: "Trend",
  evergreen: "Evergreen",
  competitive: "Competitive",
  campaign: "Campaign",
};

export function SourceOpportunityCard({ opportunity, brandId }: SourceOpportunityCardProps) {
  return (
    <KCard className="p-4">
      <h3 className="text-xs font-medium text-kairo-ink-500 uppercase tracking-wide mb-3">
        Source Opportunity
      </h3>

      {/* Type + Score row */}
      <div className="flex items-center justify-between mb-2">
        <KTag variant={opportunity.type}>
          {typeLabels[opportunity.type]}
        </KTag>
        <span
          className={[
            "inline-flex items-center gap-1 px-1.5 py-0.5",
            "rounded-(--kairo-radius-xs)",
            "text-xs font-medium",
            opportunity.score >= 60
              ? "bg-kairo-sand-100 text-kairo-ink-600"
              : "bg-kairo-tag-low-score-bg/60 text-kairo-tag-low-score-fg",
          ].join(" ")}
        >
          <ScoreIcon className="w-3 h-3" />
          {opportunity.score}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-kairo-ink-900 mb-1">
        {opportunity.title}
      </p>

      {/* Angle / Why now */}
      <p className="text-xs text-kairo-ink-600 line-clamp-2 mb-3">
        {opportunity.angle}
      </p>

      {/* Link to Today */}
      <Link
        href={`/brands/${brandId}/today`}
        className="inline-flex items-center gap-1 text-xs text-kairo-aqua-600 hover:text-kairo-aqua-700 hover:underline transition-colors"
      >
        View on Today board
        <ArrowIcon className="w-3 h-3" />
      </Link>
    </KCard>
  );
}

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

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

SourceOpportunityCard.displayName = "SourceOpportunityCard";
