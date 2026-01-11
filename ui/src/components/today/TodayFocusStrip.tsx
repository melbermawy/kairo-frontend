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
      data-testid="focus-strip"
    >
      <div className="bg-kairo-bg-card border border-kairo-border-subtle rounded-(--kairo-radius-md) px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: Recommendation text */}
          <div className="min-w-0 flex-1">
            {/* Label - using fg-subtle for subdued helper text */}
            <p className="text-xs text-kairo-fg-subtle mb-1">
              Today, Kairo recommends you focus on…
            </p>

            {/* Focus triple - using fg for readable primary content */}
            <p className="text-base font-semibold text-kairo-fg">
              {pillar}
              <span className="text-kairo-fg-subtle font-normal"> · </span>
              {channel}
              <span className="text-kairo-fg-subtle font-normal"> · </span>
              {persona}
            </p>
          </div>

          {/* Right: Count badge */}
          <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0.5">
            <span
              className="inline-block text-2xl font-bold text-kairo-accent-400 animate-[kairo-breath_600ms_var(--kairo-ease-soft)]"
              style={{ animationIterationCount: 1 }}
            >
              {highScoreCount}
            </span>
            <p className="text-xs text-kairo-fg-muted">
              high-score opportunities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

TodayFocusStrip.displayName = "TodayFocusStrip";
