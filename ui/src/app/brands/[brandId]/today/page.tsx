import { TodayBoardClient } from "./TodayBoardClient";
import { mockApi, type ContentPackage, type Opportunity } from "@/lib/mockApi";
import { NotFoundError } from "@/lib/mockApi";

interface TodayPageProps {
  params: Promise<{ brandId: string }>;
}

// Compute metrics from actual packages
function computeWeekMetrics(packages: ContentPackage[]) {
  // All packages are in progress for now
  const inProgress = packages.length;
  // TODO(spec): status field not in package spec, leaving as 0
  const scheduled = 0;
  const published = 0;

  return {
    packagesInProgress: { current: inProgress, target: 5 },
    postsScheduled: { current: scheduled, target: 3 },
    publishedThisWeek: { current: published, target: 4 },
  };
}

// Compute channel activity from packages
function computeChannelCounts(packages: ContentPackage[]): Record<string, number> {
  const counts: Record<string, number> = {};

  const channelLabels: Record<string, string> = {
    linkedin: "LinkedIn",
    x: "X",
    instagram: "Instagram",
    tiktok: "TikTok",
  };

  for (const pkg of packages) {
    for (const deliverable of pkg.deliverables) {
      const label = channelLabels[deliverable.channel] || deliverable.channel;
      counts[label] = (counts[label] || 0) + 1;
    }
  }

  return counts;
}

// Brand-specific insights
function getWeeklyInsight(opportunities: Opportunity[]) {
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

export default async function TodayPage({ params }: TodayPageProps) {
  const { brandId } = await params;

  let brand;
  try {
    brand = mockApi.getBrand(brandId);
  } catch (e) {
    if (e instanceof NotFoundError) {
      return null;
    }
    throw e;
  }

  const opportunities = mockApi.listOpportunities(brandId);
  const packages = mockApi.listPackages(brandId);
  const weekMetrics = computeWeekMetrics(packages);
  const channelCounts = computeChannelCounts(packages);
  const weeklyInsight = getWeeklyInsight(opportunities);

  // Sort opportunities by score descending
  const sortedOpportunities = [...opportunities].sort((a, b) => b.score - a.score);

  // Get focus data from top opportunity
  const topOpp = sortedOpportunities[0];
  const highScoreCount = opportunities.filter((o) => o.score >= 70).length;

  // Get channels from deliverables
  const activeChannels = Object.keys(channelCounts);

  // Fetch hydrated opportunities with evidence
  const opportunitiesWithEvidence = sortedOpportunities.map((opp) =>
    mockApi.getOpportunity(brandId, opp.id)
  );

  return (
    <TodayBoardClient
      brand={brand}
      opportunities={opportunitiesWithEvidence}
      weekMetrics={weekMetrics}
      channelCounts={channelCounts}
      weeklyInsight={weeklyInsight}
      topOpp={topOpp}
      highScoreCount={highScoreCount}
      activeChannels={activeChannels}
    />
  );
}
