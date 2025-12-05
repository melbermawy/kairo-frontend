import { KCard, KTag } from "@/components/ui";
import { OpportunityCard } from "@/components/opportunities";
import { getBrandById } from "@/demo/brands";
import { getOpportunitiesByBrand } from "@/demo/opportunities";

interface TodayPageProps {
  params: Promise<{ brandId: string }>;
}

// Stubbed metrics with targets
const weekMetrics = {
  packagesInProgress: { current: 3, target: 5 },
  postsScheduled: { current: 5, target: 8 },
  publishedThisWeek: { current: 2, target: 4 },
};

// Stubbed channel activity counts
const channelCounts: Record<string, number> = {
  LinkedIn: 3,
  X: 2,
  "YouTube Shorts": 1,
};

// Stubbed insight
const weeklyInsight = {
  message: "You've skipped 3 high-score opportunities this week.",
  type: "nudge" as const,
};

export default async function TodayPage({ params }: TodayPageProps) {
  const { brandId } = await params;
  const brand = getBrandById(brandId);
  const opportunities = getOpportunitiesByBrand(brandId);

  if (!brand) {
    return null;
  }

  // Sort opportunities: pinned first, then by score descending, snoozed last
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isSnoozed && !b.isSnoozed) return 1;
    if (!a.isSnoozed && b.isSnoozed) return -1;
    return b.score - a.score;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-kairo-ink-900 text-[22px] font-semibold">
          Today for {brand.name}
        </h1>
        <p className="text-[13px] text-kairo-ink-500 mt-0.5">
          Fresh opportunities, on-brand.
        </p>
      </div>

      {/* Two-column layout: 65/35 split */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: Opportunities Panel */}
        <div className="space-y-3">
          <h2 className="text-kairo-ink-900 text-[15px] font-semibold">
            Today&apos;s Opportunities
          </h2>
          <div className="space-y-2.5">
            {sortedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                id={opp.id}
                type={opp.type}
                score={opp.score}
                title={opp.title}
                angle={opp.angle}
                persona={opp.persona}
                pillar={opp.pillar}
                source={opp.source}
                isPinned={opp.isPinned}
                isSnoozed={opp.isSnoozed}
              />
            ))}
          </div>
        </div>

        {/* Right: Cockpit Rail */}
        <aside className="space-y-3 lg:sticky lg:top-6">
          {/* Week at a Glance */}
          <KCard>
            <h3 className="text-[11px] text-kairo-ink-500 uppercase tracking-wider font-medium mb-4">
              This Week at a Glance
            </h3>
            <div className="space-y-4">
              <MetricStrip
                label="Packages in Progress"
                current={weekMetrics.packagesInProgress.current}
                target={weekMetrics.packagesInProgress.target}
              />
              <MetricStrip
                label="Posts Scheduled"
                current={weekMetrics.postsScheduled.current}
                target={weekMetrics.postsScheduled.target}
              />
              <MetricStrip
                label="Published This Week"
                current={weekMetrics.publishedThisWeek.current}
                target={weekMetrics.publishedThisWeek.target}
              />
            </div>
          </KCard>

          {/* Insight Nudge */}
          <div className="px-3 py-2.5 rounded-(--kairo-radius-md) bg-kairo-aqua-50 border border-kairo-aqua-100">
            <p className="text-[12px] text-kairo-aqua-600 leading-snug">
              <span className="font-medium">Kairo:</span> {weeklyInsight.message}
            </p>
          </div>

          {/* Active Channels */}
          <KCard>
            <h3 className="text-[11px] text-kairo-ink-500 uppercase tracking-wider font-medium mb-3">
              Active Channels
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              {brand.channels.map((channel) => (
                <span
                  key={channel}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-(--kairo-radius-pill) bg-kairo-sand-100 text-[11px] text-kairo-ink-700"
                >
                  {channel}
                  <span className="text-kairo-ink-400">
                    · {channelCounts[channel] ?? 0}
                  </span>
                </span>
              ))}
            </div>
          </KCard>
        </aside>
      </div>
    </div>
  );
}

// --- Helper Components ---

interface MetricStripProps {
  label: string;
  current: number;
  target: number;
}

function MetricStrip({ label, current, target }: MetricStripProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] text-kairo-ink-600">{label}</span>
        <span className="text-[12px] text-kairo-ink-900 font-medium">
          {current} <span className="text-kairo-ink-400">of {target}</span>
        </span>
      </div>
      <div className="h-1.5 bg-kairo-sand-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-kairo-aqua-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
