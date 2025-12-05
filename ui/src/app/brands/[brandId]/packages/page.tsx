import { KButton, KCard, KTag } from "@/components/ui";
import { getBrandById } from "@/demo/brands";
import { getPackagesByBrand } from "@/demo/packages";
import Link from "next/link";

interface PackagesPageProps {
  params: Promise<{ brandId: string }>;
}

const statusColors: Record<string, "filled" | "outline" | "danger"> = {
  draft: "outline",
  in_review: "filled",
  approved: "filled",
  scheduled: "filled",
  published: "filled",
};

export default async function PackagesPage({ params }: PackagesPageProps) {
  const { brandId } = await params;
  const brand = getBrandById(brandId);
  const packages = getPackagesByBrand(brandId);

  if (!brand) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-taupe-700">
            Content Packages
          </h1>
          <p className="text-sm text-taupe-400 mt-1">
            All content packages for {brand.name}
          </p>
        </div>
        <KButton>New Package</KButton>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <KTag variant="outline">All</KTag>
        <KTag variant="outline">Draft</KTag>
        <KTag variant="outline">In Review</KTag>
        <KTag variant="outline">Approved</KTag>
        <KTag variant="outline">Scheduled</KTag>
        <KTag variant="outline">Published</KTag>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Link key={pkg.id} href={`/brands/${brandId}/packages/${pkg.id}`}>
            <KCard elevated className="h-full hover:shadow-floating transition-shadow duration-[160ms] cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <KTag variant={statusColors[pkg.status] ?? "outline"}>
                  {pkg.status.replace("_", " ")}
                </KTag>
                <div className="flex gap-1">
                  {pkg.channels.map((channel) => (
                    <span
                      key={channel}
                      className="text-xs text-taupe-400 bg-sand-100 px-2 py-1 rounded"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-taupe-700 mb-2 line-clamp-2">
                {pkg.title}
              </h3>

              <p className="text-xs text-taupe-400 mb-3 line-clamp-2">
                {pkg.thesis}
              </p>

              <div className="flex gap-1 flex-wrap">
                <KTag variant="outline">{pkg.persona}</KTag>
                <KTag variant="outline">{pkg.pillar}</KTag>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-taupe-400">
                  {pkg.variants.length} variant{pkg.variants.length !== 1 ? "s" : ""}
                </p>
              </div>
            </KCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
