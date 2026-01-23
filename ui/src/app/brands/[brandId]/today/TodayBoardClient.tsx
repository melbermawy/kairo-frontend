"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { KCard, OpportunityCardSkeleton } from "@/components/ui";
import { OpportunityCardV2, OpportunityDrawer } from "@/components/opportunities";
import { TodayFocusStrip } from "@/components/today";
import type { UITodayBoard, UIOpportunity } from "@/lib/todayAdapter";
import { getPillarName, getPersonaName } from "@/lib/todayAdapter";
import { useTodayBoardRegenerate } from "@/hooks";

interface TodayBoardClientProps {
  brandId: string;
  board: UITodayBoard;
}

// Staggered animation variants for cards
const cardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

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

  // Check if this is a pre-onboarding state (no snapshot compiled yet)
  const isPreOnboarding = meta.state === "not_generated_yet";
  const isGenerating = meta.state === "generating";
  const isError = meta.state === "error";
  const isInsufficientEvidence = meta.state === "insufficient_evidence";

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
            disabled={isPreOnboarding}
          />
        </div>

        {/* Pre-onboarding guard */}
        {isPreOnboarding && (
          <PreOnboardingGuard brandId={brandId} />
        )}

        {/* Error from regenerate hook */}
        {regenerateState.error && (
          <ErrorBanner
            title="Regeneration failed"
            message={regenerateState.error}
            onRetry={regenerate}
            isRetrying={regenerateState.isRegenerating}
          />
        )}

        {/* Helpful error states */}
        {isError && !regenerateState.error && (
          <ErrorStateWithGuidance
            remediation={meta.remediation}
            onRetry={regenerate}
            isRetrying={regenerateState.isRegenerating}
          />
        )}

        {/* Insufficient evidence guidance */}
        {isInsufficientEvidence && (
          <InsufficientEvidenceGuide brandId={brandId} />
        )}

        {/* Generating state with skeleton loading */}
        {isGenerating && (
          <BoardStateIndicator
            state={meta.state}
            remediation={meta.remediation}
            progressStage={meta.progressStage}
            progressDetail={meta.progressDetail}
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
            {/* Skeleton loading while generating */}
            {isGenerating && opportunities.length === 0 ? (
              <SkeletonGrid count={6} />
            ) : opportunities.length === 0 ? (
              <EmptyOpportunities
                state={meta.state}
                progressStage={meta.progressStage}
                progressDetail={meta.progressDetail}
                brandId={brandId}
              />
            ) : (
              /* Staggered animated cards */
              <AnimatePresence mode="wait">
                <motion.div
                  className="contents"
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="visible"
                  key={opportunities.map(o => o.id).join(",")}
                >
                  {opportunities.map((opp) => (
                    <motion.div key={opp.id} variants={cardVariants}>
                      <OpportunityCardV2
                        opportunity={opp}
                        snapshot={snapshot}
                        onClick={() => handleCardClick(opp)}
                        onPlatformClick={(platform) => handlePlatformClick(opp, platform)}
                        isSelected={selectedOpportunity?.id === opp.id && isDrawerOpen}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
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
      message: "Complete your brand setup to unlock opportunity generation.",
      type: "nudge" as const,
    };
  }

  if (state === "insufficient_evidence") {
    return {
      message: "Add more sources to discover better opportunities for your brand.",
      type: "nudge" as const,
    };
  }

  if (state === "error") {
    return {
      message: "We hit a snag. Check the error details above for guidance.",
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

// Pre-onboarding guard - shows when BrandBrain hasn't been compiled yet
function PreOnboardingGuard({ brandId }: { brandId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-4 rounded-lg border bg-amber-500/10 border-amber-500/30"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-[14px] font-semibold text-amber-400 mb-1">
            Complete Brand Setup First
          </h3>
          <p className="text-[13px] text-amber-300/80 mb-3">
            Before we can generate opportunities, you need to compile your BrandBrain.
            This establishes your brand&apos;s voice, pillars, and target audience.
          </p>
          <Link
            href={`/brands/${brandId}/onboarding`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-[13px] font-medium hover:bg-amber-600 transition-colors"
          >
            Go to Setup
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Error banner with helpful guidance
interface ErrorBannerProps {
  title: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

function ErrorBanner({ title, message, onRetry, isRetrying }: ErrorBannerProps) {
  // Parse common error types for helpful messages
  const getHelpfulMessage = (msg: string): { suggestion: string; isApiKeyIssue: boolean } => {
    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes("api key") || lowerMsg.includes("apikey") || lowerMsg.includes("unauthorized") || lowerMsg.includes("401")) {
      return {
        suggestion: "Your API key might be invalid or expired. Check your settings to update it.",
        isApiKeyIssue: true,
      };
    }

    if (lowerMsg.includes("rate limit") || lowerMsg.includes("429") || lowerMsg.includes("too many requests")) {
      return {
        suggestion: "You've hit the API rate limit. Wait a few minutes before trying again.",
        isApiKeyIssue: false,
      };
    }

    if (lowerMsg.includes("timeout") || lowerMsg.includes("timed out")) {
      return {
        suggestion: "The request took too long. This usually resolves itself - try again in a moment.",
        isApiKeyIssue: false,
      };
    }

    if (lowerMsg.includes("network") || lowerMsg.includes("connection")) {
      return {
        suggestion: "Check your internet connection and try again.",
        isApiKeyIssue: false,
      };
    }

    return {
      suggestion: "If this keeps happening, try refreshing the page or contact support.",
      isApiKeyIssue: false,
    };
  };

  const { suggestion, isApiKeyIssue } = getHelpfulMessage(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3 rounded-lg border bg-red-500/10 border-red-500/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-[13px] font-medium text-red-400">{title}</p>
            <p className="text-[12px] mt-1 text-red-300/80">{message}</p>
            <p className="text-[12px] mt-2 text-red-300/60 italic">{suggestion}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isApiKeyIssue && (
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
            >
              Settings
            </Link>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors disabled:opacity-50"
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
                "Retry"
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Error state with guidance (for meta.state === "error")
function ErrorStateWithGuidance({ remediation, onRetry, isRetrying }: { remediation?: string | null; onRetry: () => void; isRetrying: boolean }) {
  return (
    <ErrorBanner
      title="Error loading opportunities"
      message={remediation || "An unexpected error occurred while generating opportunities."}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}

// Insufficient evidence guidance
function InsufficientEvidenceGuide({ brandId }: { brandId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-4 rounded-lg border bg-amber-500/10 border-amber-500/30"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-[14px] font-semibold text-amber-400 mb-1">
            Not Enough Data to Generate Opportunities
          </h3>
          <p className="text-[13px] text-amber-300/80 mb-2">
            We couldn&apos;t find enough relevant content from your connected sources. Here&apos;s what you can do:
          </p>
          <ul className="text-[12px] text-amber-300/70 space-y-1 mb-3">
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              Connect more social media accounts or websites
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              Broaden your content pillars to capture more trends
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              Ensure your sources have recent, active content
            </li>
          </ul>
          <Link
            href={`/brands/${brandId}/onboarding`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-[13px] font-medium hover:bg-amber-600 transition-colors"
          >
            Update Sources
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton grid for loading state
function SkeletonGrid({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <OpportunityCardSkeleton />
        </motion.div>
      ))}
    </>
  );
}

// Regenerate Button Component
interface RegenerateButtonProps {
  onRegenerate: () => void;
  isRegenerating: boolean;
  isPolling: boolean;
  currentState: string;
  disabled?: boolean;
}

function RegenerateButton({
  onRegenerate,
  isRegenerating,
  isPolling,
  currentState,
  disabled = false,
}: RegenerateButtonProps) {
  const isDisabled = disabled || isRegenerating || isPolling || currentState === "generating";
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
      title={disabled && currentState === "not_generated_yet" ? "Complete brand setup first" : undefined}
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
  progressStage?: string | null;
  progressDetail?: string | null;
}

// Phase 3: Human-readable labels for progress stages
const progressStageLabels: Record<string, string> = {
  pending: "Waiting to start...",
  fetching_evidence: "Fetching evidence from social platforms...",
  running_quality_gates: "Validating evidence quality...",
  synthesizing: "Generating opportunities with AI...",
  scoring: "Scoring and ranking opportunities...",
  complete: "Generation complete!",
};

function BoardStateIndicator({ state, progressStage, progressDetail }: BoardStateIndicatorProps) {
  if (state !== "generating") return null;

  const displayLabel = progressStage
    ? progressStageLabels[progressStage] || "Generating opportunities..."
    : "Generating opportunities...";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3 rounded-lg border bg-kairo-accent-500/10 border-kairo-accent-500/30"
    >
      <div className="flex items-center gap-3">
        <svg className="animate-spin w-5 h-5 text-kairo-accent-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-kairo-accent-400">{displayLabel}</span>
          {progressDetail && (
            <span className="text-[11px] text-kairo-accent-400/70 mt-0.5">{progressDetail}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface EmptyOpportunitiesProps {
  state: string;
  progressStage?: string | null;
  progressDetail?: string | null;
  brandId: string;
}

function EmptyOpportunities({ state, brandId }: EmptyOpportunitiesProps) {
  // Don't show empty state during generation - we show skeletons instead
  if (state === "generating") {
    return null;
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-kairo-bg-elevated flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-kairo-fg-subtle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <p className="text-[14px] text-kairo-fg-muted">No opportunities available</p>
      <p className="text-[12px] text-kairo-fg-subtle mt-1 max-w-xs">
        {state === "not_generated_yet" ? (
          <>Complete your brand setup to start generating opportunities.</>
        ) : state === "insufficient_evidence" ? (
          <>Add more sources to help us find relevant trends for your brand.</>
        ) : (
          <>Check back later for fresh opportunities.</>
        )}
      </p>
      {(state === "not_generated_yet" || state === "insufficient_evidence") && (
        <Link
          href={`/brands/${brandId}/onboarding`}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-kairo-accent-500 text-white text-[13px] font-medium hover:bg-kairo-accent-600 transition-colors"
        >
          {state === "not_generated_yet" ? "Go to Setup" : "Update Sources"}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

TodayBoardClient.displayName = "TodayBoardClient";
