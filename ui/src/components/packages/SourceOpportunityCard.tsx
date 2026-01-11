import Link from "next/link";
import { KCard, KTag } from "@/components/ui";
import type { OpportunityWithEvidence } from "@/lib/mockApi";

interface SourceOpportunityCardProps {
  opportunity: OpportunityWithEvidence;
  brandId: string;
}

const typeLabels: Record<string, string> = {
  trend: "Trend",
  evergreen: "Evergreen",
  competitive: "Competitive",
};

export function SourceOpportunityCard({ opportunity, brandId }: SourceOpportunityCardProps) {
  return (
    <KCard className="p-3 sm:p-4">
      <h3 className="text-[10px] sm:text-xs font-medium text-kairo-fg-subtle uppercase tracking-wide mb-2 sm:mb-3">
        Source Opportunity
      </h3>

      {/* Type + Score row */}
      <div className="flex items-center justify-between mb-2">
        <KTag variant={opportunity.type as "trend" | "evergreen" | "competitive"} className="text-[10px] sm:text-xs">
          {typeLabels[opportunity.type] || opportunity.type}
        </KTag>
        <span
          className={[
            "inline-flex items-center gap-1 px-1.5 py-0.5",
            "rounded-(--kairo-radius-xs)",
            "text-[10px] sm:text-xs font-medium",
            opportunity.score >= 60
              ? "bg-kairo-bg-elevated text-kairo-fg-muted"
              : "bg-kairo-error-bg/60 text-kairo-error-fg",
          ].join(" ")}
        >
          <ScoreIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {opportunity.score}
        </span>
      </div>

      {/* Title */}
      <p className="text-xs sm:text-sm font-semibold text-kairo-fg mb-1">
        {opportunity.title}
      </p>

      {/* Hook / Why now */}
      <p className="text-[11px] sm:text-xs text-kairo-fg-muted line-clamp-2 mb-2.5 sm:mb-3">
        {opportunity.hook}
      </p>

      {/* Link to Today */}
      <Link
        href={`/brands/${brandId}/today`}
        className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-kairo-accent-400 hover:text-kairo-accent-300 hover:underline transition-colors"
      >
        View on Today board
        <ArrowIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
