import { KCard, KTag } from "@/components/ui";
import { OpportunityCard } from "@/components/opportunities";
import { getBrandById } from "@/demo/brands";
import { getOpportunitiesByBrand } from "@/demo/opportunities";

interface TodayPageProps {
  params: Promise<{ brandId: string }>;
}

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-kairo-ink-900 text-[22px] font-semibold">
          Today for {brand.name}
        </h1>
        <p className="text-[14px] text-kairo-ink-500 mt-1">
          Fresh opportunities, on-brand.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunities Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-kairo-ink-900 text-[18px] font-semibold">
            Today&apos;s Opportunities
          </h2>
          <div className="space-y-3">
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

        {/* Week at a Glance */}
        <div className="space-y-4">
          <h2 className="text-kairo-ink-900 text-[18px] font-semibold">
            This Week at a Glance
          </h2>

          <KCard>
            <div className="space-y-5">
              <div>
                <p className="text-[11px] text-kairo-ink-500 uppercase tracking-wider font-medium mb-1">
                  Packages in Progress
                </p>
                <p className="text-[28px] font-semibold text-kairo-ink-900 leading-none">3</p>
              </div>
              <div>
                <p className="text-[11px] text-kairo-ink-500 uppercase tracking-wider font-medium mb-1">
                  Posts Scheduled
                </p>
                <p className="text-[28px] font-semibold text-kairo-ink-900 leading-none">5</p>
              </div>
              <div>
                <p className="text-[11px] text-kairo-ink-500 uppercase tracking-wider font-medium mb-1">
                  Published This Week
                </p>
                <p className="text-[28px] font-semibold text-kairo-ink-900 leading-none">2</p>
              </div>
            </div>
          </KCard>

          <KCard>
            <p className="text-[11px] text-kairo-ink-500 uppercase tracking-wider font-medium mb-3">
              Active Channels
            </p>
            <div className="flex gap-2 flex-wrap">
              {brand.channels.map((channel) => (
                <KTag key={channel} variant="default">
                  {channel}
                </KTag>
              ))}
            </div>
          </KCard>
        </div>
      </div>
    </div>
  );
}
