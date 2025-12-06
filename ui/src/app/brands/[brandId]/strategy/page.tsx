import { KCard } from "@/components/ui";
import { demoClient } from "@/lib/demoClient";
import {
  BrandPositioningCard,
  PersonasGrid,
  PillarsRow,
  TaboosCard,
} from "@/components/strategy";

interface StrategyPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { brandId } = await params;
  const brand = demoClient.getBrand(brandId);
  const strategy = demoClient.getBrandStrategy(brandId);

  if (!brand) {
    return null;
  }

  // Empty state if no strategy defined
  if (!strategy) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-kairo-ink-900">
            Brand Strategy
          </h1>
          <p className="text-sm text-kairo-ink-500 mt-1">
            A living snapshot of how this brand shows up in the world.
          </p>
        </header>
        <KCard className="py-12 text-center">
          <p className="text-sm text-kairo-ink-500">
            No strategy defined yet for {brand.name}.
          </p>
        </KCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header>
        <h1 className="text-xl font-semibold text-kairo-ink-900">
          Brand Strategy
        </h1>
        <p className="text-sm text-kairo-ink-500 mt-1">
          A living snapshot of how this brand shows up in the world.
        </p>
        <p className="text-xs text-kairo-ink-500 mt-2">
          Kairo uses this strategy to shape opportunities, patterns, and packages for this brand.
        </p>
      </header>

      {/* Band 1: Positioning + Tone */}
      <BrandPositioningCard
        brandName={brand.name}
        positioning={brand.positioning}
        toneTags={strategy.voice.toneTags}
      />

      {/* Band 2: Personas + Pillars */}
      <div className="space-y-6">
        <PersonasGrid personas={strategy.personas} />
        <PillarsRow pillars={strategy.pillars} />
      </div>

      {/* Band 3: Guardrails */}
      <TaboosCard nevers={strategy.guardrails.neverDo} />
    </div>
  );
}
