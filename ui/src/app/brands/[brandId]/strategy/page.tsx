// app/brands/[brandId]/strategy/page.tsx
// BrandBrain page - snapshot viewer with overrides and provenance

import { api } from "@/lib/api";
import { BrandBrainClient } from "@/components/brandbrain";
import { transformBackendSnapshot } from "@/contracts";

interface StrategyPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { brandId } = await params;

  // Use bootstrap for combined fetch (will use single endpoint when backend supports it)
  const { brand, snapshot: backendSnapshot, overrides } = await api.getStrategyBootstrap(brandId);

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
