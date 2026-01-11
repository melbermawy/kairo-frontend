// app/brands/[brandId]/strategy/page.tsx
// BrandBrain page - snapshot viewer with overrides and provenance

import { api } from "@/lib/api";
import { BrandBrainClient } from "@/components/brandbrain";

interface StrategyPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { brandId } = await params;

  // Fetch brand and snapshot data
  const [brand, snapshot, overrides] = await Promise.all([
    api.getBrand(brandId),
    api.getLatestSnapshot(brandId).catch(() => null),
    api.getOverrides(brandId).catch(() => null),
  ]);

  return (
    <BrandBrainClient
      brand={brand}
      initialSnapshot={snapshot}
      initialOverrides={overrides}
    />
  );
}
