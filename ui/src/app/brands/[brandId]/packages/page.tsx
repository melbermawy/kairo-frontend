import { KButton } from "@/components/ui";
import { PackagesTable } from "@/components/packages";
import { ContentPipelineStrip } from "@/components/content";
import { mockApi, NotFoundError } from "@/lib/mockApi";

interface PackagesPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function PackagesPage({ params }: PackagesPageProps) {
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

  const packages = mockApi.listPackages(brandId);

  // TODO(spec): status not in package spec, using quality.band as proxy
  // For now, all packages are "in progress" (draft equivalent)
  const counts = {
    draft: packages.length,
    inReview: 0,
    scheduled: 0,
    published: 0,
  };

  // TODO(spec): no lastUpdated in package spec, at-risk not computable
  const atRiskCount = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-kairo-ink-900">
            Content Packages
          </h1>
          <p className="text-sm text-kairo-ink-500 mt-0.5">
            {packages.length} package{packages.length !== 1 ? "s" : ""} for {brand.name}
          </p>
        </div>
        <KButton>New Package</KButton>
      </div>

      {/* Pipeline Strip */}
      <ContentPipelineStrip counts={counts} atRiskCount={atRiskCount} />

      {/* Packages table with filters */}
      <PackagesTable packages={packages} brandId={brandId} />
    </div>
  );
}
