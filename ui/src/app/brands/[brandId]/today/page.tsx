import { KButton, KCard, KTag } from "@/components/ui";
import { getBrandById } from "@/demo/brands";
import { getOpportunitiesByBrand, type OpportunityType } from "@/demo/opportunities";
import Link from "next/link";

interface TodayPageProps {
  params: Promise<{ brandId: string }>;
}

const opportunityTypeVariant: Record<OpportunityType, "trend" | "evergreen" | "competitive" | "campaign"> = {
  trend: "trend",
  evergreen: "evergreen",
  competitive: "competitive",
  campaign: "campaign",
};

export default async function TodayPage({ params }: TodayPageProps) {
  const { brandId } = await params;
  const brand = getBrandById(brandId);
  const opportunities = getOpportunitiesByBrand(brandId);

  if (!brand) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-kairo-text-main">Today for {brand.name}</h1>
        <p className="text-[14px] text-kairo-text-muted mt-1">
          Fresh opportunities, on-brand.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunities Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-kairo-text-main">Today&apos;s Opportunities</h2>
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <KCard key={opp.id} elevated>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <KTag variant={opportunityTypeVariant[opp.type]}>
                      {opp.type}
                    </KTag>
                    <span className="text-[12px] text-kairo-text-subtle">
                      Score: <span className="font-medium text-kairo-text-muted">{opp.score}</span>
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <KTag variant="outline">{opp.persona}</KTag>
                    <KTag variant="outline">{opp.pillar}</KTag>
                  </div>
                </div>

                <p className="text-[15px] text-kairo-text-main leading-relaxed mb-3">
                  {opp.angle}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-kairo-border-soft">
                  <span className="text-[12px] text-kairo-text-subtle">
                    Source: {opp.source}
                  </span>
                  <div className="flex gap-2">
                    <KButton variant="ghost" size="sm">Pin</KButton>
                    <KButton variant="ghost" size="sm">Snooze</KButton>
                    <Link href={`/brands/${brandId}/packages`}>
                      <KButton size="sm">Open as Package</KButton>
                    </Link>
                  </div>
                </div>
              </KCard>
            ))}
          </div>
        </div>

        {/* Week at a Glance */}
        <div className="space-y-4">
          <h2 className="text-kairo-text-main">This Week at a Glance</h2>

          <KCard>
            <div className="space-y-5">
              <div>
                <p className="text-[11px] text-kairo-text-subtle uppercase tracking-wider font-medium mb-1">
                  Packages in Progress
                </p>
                <p className="text-[28px] font-semibold text-kairo-text-main leading-none">3</p>
              </div>
              <div>
                <p className="text-[11px] text-kairo-text-subtle uppercase tracking-wider font-medium mb-1">
                  Posts Scheduled
                </p>
                <p className="text-[28px] font-semibold text-kairo-text-main leading-none">5</p>
              </div>
              <div>
                <p className="text-[11px] text-kairo-text-subtle uppercase tracking-wider font-medium mb-1">
                  Published This Week
                </p>
                <p className="text-[28px] font-semibold text-kairo-text-main leading-none">2</p>
              </div>
            </div>
          </KCard>

          <KCard>
            <p className="text-[11px] text-kairo-text-subtle uppercase tracking-wider font-medium mb-3">
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
