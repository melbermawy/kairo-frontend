"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KCard } from "@/components/ui";
import { OpportunityCardV2, OpportunityDrawer } from "@/components/opportunities";
import { TodayFocusStrip } from "@/components/today";
import type { UITodayBoard, UIOpportunity } from "@/lib/todayAdapter";
import { getPillarName, getPersonaName } from "@/lib/todayAdapter";
import { useTodayBoardRegenerate } from "@/hooks";

interface TodayBoardClientProps {
  brandId: string;
  board: UITodayBoard;
}

export function TodayBoardClient({
  brandId,
  board: initialBoard,
}: TodayBoardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Phase 3: Regenerate hook with polling
  const {
    state: regenerateState,
    regenerate,
    isPolling,
  } = useTodayBoardRegenerate(brandId, initialBoard);

  // Use board from regenerate state (updated via polling) or initial board
  const board = regenerateState.board ?? initialBoard;
  const { snapshot, opportunities, meta } = board;

  const [selectedOpportunity, setSelectedOpportunity] = useState<UIOpportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [initialPlatformFilter, setInitialPlatformFilter] = useState<string | null>(null);

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
    (opp: UIOpportunity) => {
      setSelectedOpportunity(opp);
      setInitialPlatformFilter(null);
      setIsDrawerOpen(true);
      updateUrl(opp.id);
    },
    [updateUrl]
  );

  const handlePlatformClick = useCallback(
    (opp: UIOpportunity, platform: string) => {
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

  // Compute derived data
  const highScoreCount = opportunities.filter((o) => o.score >= 70).length;
  const topOpp = opportunities[0]; // Already sorted by score from backend

  // Get active channels from opportunities
  const channelCounts: Record<string, number> = {};
  for (const opp of opportunities) {
    const channel = opp.primaryChannel;
    const label = channelLabels[channel] || channel;
    channelCounts[label] = (channelCounts[label] || 0) + 1;
  }
  const activeChannels = Object.keys(channelCounts);

  // Get focus strip data from top opportunity
  const topPillarName = topOpp ? getPillarName(snapshot, topOpp.pillarId) : null;
  const topPersonaName = topOpp ? getPersonaName(snapshot, topOpp.personaId) : null;
  const topChannel = topOpp?.primaryChannel ? channelLabels[topOpp.primaryChannel] || topOpp.primaryChannel : null;

  // Generate insight based on board state
  const weeklyInsight = getWeeklyInsight(opportunities, meta.state);

  return (
    <>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-kairo-fg text-[22px] font-semibold">
              Today for {snapshot.brandName}
            </h1>
            <p className="text-[13px] text-kairo-fg-muted mt-0.5">
              Fresh opportunities, on-brand.
            </p>
          </div>
          <RegenerateButton
            onRegenerate={regenerate}
            isRegenerating={regenerateState.isRegenerating}
            isPolling={isPolling}
            currentState={meta.state}
          />
        </div>

        {/* Error from regenerate hook */}
        {regenerateState.error && (
          <div className="px-4 py-3 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400">
            <p className="text-[13px] font-medium">Regeneration failed</p>
            <p className="text-[12px] mt-1 opacity-80">{regenerateState.error}</p>
          </div>
        )}

        {/* Board state indicator for non-ready states */}
        {meta.state !== "ready" && (
          <BoardStateIndicator
            state={meta.state}
            remediation={meta.remediation}
            onRetry={meta.state === "error" ? regenerate : undefined}
            isRetrying={regenerateState.isRegenerating}
          />
        )}

        {/* Focus Strip - only show if we have opportunities */}
        {topOpp && topPillarName && (
          <TodayFocusStrip
            pillar={topPillarName}
            channel={topChannel || "Content"}
            persona={topPersonaName || "Audience"}
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
            {opportunities.length === 0 ? (
              <EmptyOpportunities state={meta.state} />
            ) : (
              opportunities.map((opp) => (
                <OpportunityCardV2
                  key={opp.id}
                  opportunity={opp}
                  snapshot={snapshot}
                  onClick={() => handleCardClick(opp)}
                  onPlatformClick={(platform) => handlePlatformClick(opp, platform)}
                  isSelected={selectedOpportunity?.id === opp.id && isDrawerOpen}
                />
              ))
            )}
          </div>

          {/* Right: Cockpit Rail */}
          <aside className="space-y-3 lg:sticky lg:top-20">
            {/* Insight Nudge */}
            <div className="px-3 py-2.5 rounded-(--kairo-radius-md) bg-kairo-accent-500/10 border border-kairo-accent-500/20">
              <p className="text-[12px] text-kairo-accent-400 leading-snug">
                <span className="font-medium">Kairo:</span> {weeklyInsight.message}
              </p>
            </div>

            {/* Active Channels */}
            {activeChannels.length > 0 && (
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
            )}

            {/* Meta info for debugging (only in non-ready states) */}
            {meta.state !== "ready" && meta.notes && meta.notes.length > 0 && (
              <div className="text-[10px] text-kairo-fg-subtle px-2">
                {meta.notes.map((note, i) => (
                  <p key={i}>{note}</p>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Opportunity Drawer */}
      <OpportunityDrawer
        opportunity={selectedOpportunity}
        snapshot={snapshot}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        initialPlatformFilter={initialPlatformFilter}
      />
    </>
  );
}

// --- Helper Constants ---

const channelLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  newsletter: "Newsletter",
  blog: "Blog",
  podcast: "Podcast",
};

// --- Helper Functions ---

function getWeeklyInsight(opportunities: UIOpportunity[], state: string) {
  if (state === "generating") {
    return {
      message: "Generating fresh opportunities for you. This can take a few minutes...",
      type: "nudge" as const,
    };
  }

  if (state === "not_generated_yet") {
    return {
      message: "Run BrandBrain compile first to establish your brand context.",
      type: "nudge" as const,
    };
  }

  if (state === "insufficient_evidence") {
    return {
      message: "Connect more sources to get better opportunity recommendations.",
      type: "nudge" as const,
    };
  }

  if (state === "error") {
    return {
      message: "Something went wrong. Try refreshing the page.",
      type: "nudge" as const,
    };
  }

  const highScoreCount = opportunities.filter((o) => o.score >= 70).length;

  if (highScoreCount >= 3) {
    return {
      message: `${highScoreCount} high-score opportunities are ready. Time to turn them into content packages?`,
      type: "nudge" as const,
    };
  }

  return {
    message: "New trends are surfacing. Check the board for fresh opportunities.",
    type: "nudge" as const,
  };
}

// --- Helper Components ---

// Regenerate Button Component
interface RegenerateButtonProps {
  onRegenerate: () => void;
  isRegenerating: boolean;
  isPolling: boolean;
  currentState: string;
}

function RegenerateButton({
  onRegenerate,
  isRegenerating,
  isPolling,
  currentState,
}: RegenerateButtonProps) {
  const isDisabled = isRegenerating || isPolling || currentState === "generating";
  const isLoading = isRegenerating || isPolling || currentState === "generating";

  return (
    <button
      onClick={onRegenerate}
      disabled={isDisabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
        transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500
        ${isDisabled
          ? "bg-kairo-bg-elevated text-kairo-fg-subtle cursor-not-allowed"
          : "bg-kairo-accent-500 text-white hover:bg-kairo-accent-600 active:bg-kairo-accent-700"
        }
      `}
      aria-label={isLoading ? "Regenerating opportunities" : "Regenerate opportunities"}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Regenerating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </>
      )}
    </button>
  );
}

interface BoardStateIndicatorProps {
  state: string;
  remediation?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

function BoardStateIndicator({ state, remediation, onRetry, isRetrying }: BoardStateIndicatorProps) {
  const stateConfig: Record<string, { label: string; className: string }> = {
    generating: {
      label: "Generating opportunities...",
      className: "bg-kairo-accent-500/10 border-kairo-accent-500/30 text-kairo-accent-400",
    },
    not_generated_yet: {
      label: "No opportunities yet",
      className: "bg-kairo-bg-elevated border-kairo-border-subtle text-kairo-fg-muted",
    },
    insufficient_evidence: {
      label: "Insufficient evidence",
      className: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    },
    error: {
      label: "Error loading opportunities",
      className: "bg-red-500/10 border-red-500/30 text-red-400",
    },
  };

  const config = stateConfig[state];
  if (!config) return null;

  return (
    <div className={`px-4 py-3 rounded-lg border ${config.className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {state === "generating" && (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span className="text-[13px] font-medium">{config.label}</span>
        </div>
        {/* Retry button for error state */}
        {state === "error" && onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Retrying...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </>
            )}
          </button>
        )}
      </div>
      {remediation && (
        <p className="text-[12px] mt-1 opacity-80">{remediation}</p>
      )}
    </div>
  );
}

interface EmptyOpportunitiesProps {
  state: string;
}

function EmptyOpportunities({ state }: EmptyOpportunitiesProps) {
  if (state === "generating") {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <svg className="animate-spin w-8 h-8 text-kairo-accent-500 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-[14px] text-kairo-fg-muted">Generating opportunities...</p>
        <p className="text-[12px] text-kairo-fg-subtle mt-1">This can take a few minutes</p>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-kairo-bg-elevated flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-kairo-fg-subtle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <p className="text-[14px] text-kairo-fg-muted">No opportunities available</p>
      <p className="text-[12px] text-kairo-fg-subtle mt-1">
        {state === "not_generated_yet"
          ? "Run BrandBrain compile to generate opportunities"
          : "Check back later for fresh opportunities"}
      </p>
    </div>
  );
}

TodayBoardClient.displayName = "TodayBoardClient";
