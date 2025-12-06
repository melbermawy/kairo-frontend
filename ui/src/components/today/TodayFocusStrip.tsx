import { KCard } from "@/components/ui";

interface TodayFocusStripProps {
  pillar: string;
  channel: string;
  persona: string;
  highScoreCount: number;
}

export function TodayFocusStrip({
  pillar,
  channel,
  persona,
  highScoreCount,
}: TodayFocusStripProps) {
  return (
    <div
      className="animate-[kairo-fade-up_var(--kairo-motion-slow)_var(--kairo-ease-soft)]"
    >
      <KCard
        elevated
        className="bg-linear-to-r from-kairo-sand-50 to-kairo-aqua-50 border-kairo-aqua-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            {/* Label */}
            <p className="text-xs text-kairo-ink-500 mb-1">
              Today, Kairo recommends you focus on…
            </p>

            {/* Focus triple */}
            <p className="text-base font-semibold text-kairo-ink-900">
              {pillar}
              <span className="text-kairo-ink-400 font-normal"> · </span>
              {channel}
              <span className="text-kairo-ink-400 font-normal"> · </span>
              {persona}
            </p>
          </div>

          {/* Bold number with pop animation on mount */}
          <div className="shrink-0 text-right sm:text-left">
            <span
              className="inline-block text-2xl font-bold text-kairo-aqua-600 animate-[kairo-breath_600ms_var(--kairo-ease-soft)]"
              style={{ animationIterationCount: 1 }}
            >
              {highScoreCount}
            </span>
            <p className="text-xs text-kairo-ink-500">
              high-score opportunities waiting
            </p>
          </div>
        </div>
      </KCard>
    </div>
  );
}

TodayFocusStrip.displayName = "TodayFocusStrip";
