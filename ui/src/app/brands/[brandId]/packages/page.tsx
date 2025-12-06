import { KButton } from "@/components/ui";
import { PackagesTable } from "@/components/packages";
import { ContentPipelineStrip } from "@/components/content";
import { getBrandById } from "@/demo/brands";
import { getPackagesByBrand } from "@/demo/packages";

interface PackagesPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function PackagesPage({ params }: PackagesPageProps) {
  const { brandId } = await params;
  const brand = getBrandById(brandId);
  const packages = getPackagesByBrand(brandId);

  if (!brand) {
    return null;
  }

  // Compute pipeline counts
  const counts = {
    draft: packages.filter((p) => p.status === "draft").length,
    inReview: packages.filter((p) => p.status === "in_review").length,
    scheduled: packages.filter((p) => p.status === "scheduled").length,
    published: packages.filter((p) => p.status === "published").length,
  };

  // Compute at-risk count (drafts older than 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const atRiskCount = packages.filter((p) => {
    if (p.status !== "draft") return false;
    const updated = new Date(p.lastUpdated);
    return updated < fourteenDaysAgo;
  }).length;

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
