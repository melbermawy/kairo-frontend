"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KCard } from "@/components/ui";
import { OpportunityCardV2, OpportunityDrawer } from "@/components/opportunities";
import { TodayFocusStrip } from "@/components/today";
import type { Brand, Opportunity, OpportunityWithEvidence, EvidencePlatform } from "@/lib/mockApi";

interface WeekMetrics {
  packagesInProgress: { current: number; target: number };
  postsScheduled: { current: number; target: number };
  publishedThisWeek: { current: number; target: number };
}

interface WeeklyInsight {
  message: string;
  type: "nudge";
}

interface TodayBoardClientProps {
  brand: Brand;
  opportunities: OpportunityWithEvidence[];
  weekMetrics: WeekMetrics;
  channelCounts: Record<string, number>;
  weeklyInsight: WeeklyInsight;
  topOpp: Opportunity | undefined;
  highScoreCount: number;
  activeChannels: string[];
}

export function TodayBoardClient({
  brand,
  opportunities,
  weekMetrics,
  channelCounts,
  weeklyInsight,
  topOpp,
  highScoreCount,
  activeChannels,
}: TodayBoardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithEvidence | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [initialPlatformFilter, setInitialPlatformFilter] = useState<EvidencePlatform | null>(null);

  // Handle URL state on mount and when searchParams change
  useEffect(() => {
    const oppId = searchParams.get("opp");
    if (oppId) {
      const opp = opportunities.find((o) => o.id === oppId);
      if (opp) {
        setSelectedOpportunity(opp);
        setIsDrawerOpen(true);
      }
    }
  }, [searchParams, opportunities]);

  // Update URL when drawer opens/closes
  const updateUrl = useCallback(
    (oppId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (oppId) {
        params.set("opp", oppId);
      } else {
        params.delete("opp");
      }
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  const handleCardClick = useCallback(
    (opp: OpportunityWithEvidence) => {
      setSelectedOpportunity(opp);
      setInitialPlatformFilter(null);
      setIsDrawerOpen(true);
      updateUrl(opp.id);
    },
    [updateUrl]
  );

  const handlePlatformClick = useCallback(
    (opp: OpportunityWithEvidence, platform: EvidencePlatform) => {
      setSelectedOpportunity(opp);
      setInitialPlatformFilter(platform);
      setIsDrawerOpen(true);
      updateUrl(opp.id);
    },
    [updateUrl]
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setInitialPlatformFilter(null);
    updateUrl(null);
  }, [updateUrl]);

  return (
    <>
      <div className="space-y-5">
        {/* Page Header */}
        <div>
          <h1 className="text-kairo-fg text-[22px] font-semibold">
            Today for {brand.name}
          </h1>
          <p className="text-[13px] text-kairo-fg-muted mt-0.5">
            Fresh opportunities, on-brand.
          </p>
        </div>

        {/* Focus Strip */}
        {topOpp && (
          <TodayFocusStrip
            pillar={topOpp.brand_fit.pillar}
            channel={activeChannels[0] || "X"}
            persona={topOpp.brand_fit.persona}
            highScoreCount={highScoreCount}
          />
        )}

        {/* Section heading */}
        <h2 className="text-xs font-medium text-kairo-fg-muted uppercase tracking-wide">
          Today&apos;s Opportunities
        </h2>

        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Left: Opportunities Grid - responsive 1/2/3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="opportunities-grid">
            {opportunities.map((opp) => (
              <OpportunityCardV2
                key={opp.id}
                opportunity={opp}
                onClick={() => handleCardClick(opp)}
                onPlatformClick={(platform) => handlePlatformClick(opp, platform)}
                isSelected={selectedOpportunity?.id === opp.id && isDrawerOpen}
              />
            ))}
          </div>

          {/* Right: Cockpit Rail */}
          <aside className="space-y-3 lg:sticky lg:top-20">
            {/* Week at a Glance */}
            <KCard>
              <h3 className="text-[11px] text-kairo-fg-muted uppercase tracking-wider font-medium mb-4">
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
            <div className="px-3 py-2.5 rounded-(--kairo-radius-md) bg-kairo-accent-500/10 border border-kairo-accent-500/20">
              <p className="text-[12px] text-kairo-accent-400 leading-snug">
                <span className="font-medium">Kairo:</span> {weeklyInsight.message}
              </p>
            </div>

            {/* Active Channels */}
            <KCard>
              <h3 className="text-[11px] text-kairo-fg-muted uppercase tracking-wider font-medium mb-3">
                Active Channels
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                {activeChannels.map((channel) => (
                  <span
                    key={channel}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-(--kairo-radius-pill) bg-kairo-bg-elevated text-[11px] text-kairo-fg"
                  >
                    {channel}
                    <span className="text-kairo-fg-subtle">
                      · {channelCounts[channel] ?? 0}
                    </span>
                  </span>
                ))}
              </div>
            </KCard>
          </aside>
        </div>
      </div>

      {/* Opportunity Drawer */}
      <OpportunityDrawer
        opportunity={selectedOpportunity}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        brandId={brand.id}
        initialPlatformFilter={initialPlatformFilter}
      />
    </>
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
        <span className="text-[12px] text-kairo-fg-muted">{label}</span>
        <span className="text-[12px] text-kairo-fg font-medium">
          {current} <span className="text-kairo-fg-subtle">of {target}</span>
        </span>
      </div>
      <div className="h-1.5 bg-kairo-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-kairo-accent-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

TodayBoardClient.displayName = "TodayBoardClient";
