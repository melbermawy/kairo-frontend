import { KCard, KButton } from "@/components/ui";
import type { Pattern } from "@/lib/mockApi";

interface PatternRecommendationHeroProps {
  pattern: Pattern;
  brandName: string;
}

export function PatternRecommendationHero({
  pattern,
  brandName,
}: PatternRecommendationHeroProps) {
  return (
    <div className="animate-[kairo-fade-up_var(--kairo-motion-slow)_var(--kairo-ease-soft)]">
      <KCard
        elevated
        className="bg-linear-to-br from-kairo-aqua-50 via-kairo-sand-25 to-kairo-surface-plain border-kairo-aqua-200"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            {/* Eyebrow */}
            <p className="text-xs font-medium text-kairo-aqua-600 uppercase tracking-wide mb-2">
              For {brandName} this week
            </p>

            {/* Main line - larger, more prominent */}
            <h2 className="text-lg font-semibold text-kairo-ink-900 mb-2">
              Recommended: {pattern.name}
            </h2>

            {/* Beat chips with staggered entrance */}
            <div className="flex items-center gap-1.5 mb-3">
              {pattern.beats.slice(0, 4).map((beat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-(--kairo-radius-xs) text-xs font-medium bg-kairo-aqua-100 text-kairo-aqua-600 animate-[kairo-fade-up_var(--kairo-motion-fast)_var(--kairo-ease-soft)_forwards] opacity-0"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'forwards' }}
                >
                  {beat}
                </span>
              ))}
            </div>

            {/* Subcopy - performance hint */}
            <p className="text-sm text-kairo-ink-600">
              {pattern.performanceHint}
            </p>
          </div>

          {/* Action - clearly primary and aligned */}
          <KButton variant="primary" size="sm" className="shrink-0 mt-1 kairo-transition-soft hover:scale-[1.02]">
            View pattern
          </KButton>
        </div>
      </KCard>
    </div>
  );
}

PatternRecommendationHero.displayName = "PatternRecommendationHero";
