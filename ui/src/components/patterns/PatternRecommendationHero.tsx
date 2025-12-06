import { KCard, KButton } from "@/components/ui";
import type { DemoPattern } from "@/demo/patterns";

interface PatternRecommendationHeroProps {
  pattern: DemoPattern;
  brandName: string;
}

export function PatternRecommendationHero({
  pattern,
  brandName,
}: PatternRecommendationHeroProps) {
  return (
    <KCard className="bg-gradient-to-br from-kairo-aqua-50 to-kairo-surface-plain border-kairo-aqua-100">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Eyebrow */}
          <p className="text-xs font-medium text-kairo-aqua-600 mb-1">
            For {brandName} this week
          </p>

          {/* Main line */}
          <h2 className="text-base font-semibold text-kairo-ink-900 mb-1">
            Recommended pattern: {pattern.name}
          </h2>

          {/* Subcopy */}
          <p className="text-sm text-kairo-ink-600 line-clamp-1">
            {pattern.performanceHint} · Used in {pattern.usageCount} packages
          </p>
        </div>

        {/* Action */}
        <KButton variant="primary" size="sm" className="shrink-0">
          View pattern
        </KButton>
      </div>
    </KCard>
  );
}

PatternRecommendationHero.displayName = "PatternRecommendationHero";
