// app/brands/[brandId]/content/concepts/new/page.tsx
// Concept Builder page - bridge between opportunity and package creation

import { mockApi } from "@/lib/mockApi";
import { getLatestSnapshotServer } from "@/lib/api/server";
import { transformBackendSnapshot } from "@/contracts";
import { ConceptBuilderClient } from "./ConceptBuilderClient";

interface ConceptBuilderPageProps {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ opportunityId?: string }>;
}

export default async function ConceptBuilderPage({
  params,
  searchParams,
}: ConceptBuilderPageProps) {
  const { brandId } = await params;
  const { opportunityId } = await searchParams;

  // Fetch brand
  const brand = mockApi.getBrand(brandId);

  // Fetch opportunity if provided
  let opportunity = null;
  if (opportunityId) {
    try {
      opportunity = mockApi.getOpportunity(brandId, opportunityId);
    } catch {
      // Opportunity not found, proceed without it
    }
  }

  // Fetch BrandBrain snapshot for guardrails (if available)
  let snapshot = null;
  try {
    const backendSnapshot = await getLatestSnapshotServer(brandId);
    snapshot = transformBackendSnapshot(backendSnapshot);
  } catch {
    // No snapshot available
  }

  return (
    <ConceptBuilderClient
      brand={brand}
      opportunity={opportunity}
      snapshot={snapshot}
    />
  );
}
