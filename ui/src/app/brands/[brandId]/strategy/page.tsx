// app/brands/[brandId]/strategy/page.tsx
// BrandBrain page - snapshot viewer with overrides and provenance

import { getStrategyBootstrapServer } from "@/lib/api/server";
import { BrandBrainClient } from "@/components/brandbrain";
import { transformBackendSnapshot } from "@/contracts";

interface StrategyPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { brandId } = await params;

  // Use server-side bootstrap for combined fetch
  const { brand, snapshot: backendSnapshot, overrides } = await getStrategyBootstrapServer(brandId);

  // Transform backend snapshot format to frontend format
  const snapshot = backendSnapshot ? transformBackendSnapshot(backendSnapshot) : null;

  return (
    <BrandBrainClient
      brand={brand}
      initialSnapshot={snapshot}
      initialOverrides={overrides}
    />
  );
}
