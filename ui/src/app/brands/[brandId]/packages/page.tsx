import { KButton } from "@/components/ui";
import { PackagesTable } from "@/components/packages";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-kairo-ink-900">
            Content Packages
          </h1>
          <p className="text-[13px] text-kairo-ink-500 mt-0.5">
            {packages.length} package{packages.length !== 1 ? "s" : ""} for {brand.name}
          </p>
        </div>
        <KButton>New Package</KButton>
      </div>

      {/* Packages table with filters */}
      <PackagesTable packages={packages} brandId={brandId} />
    </div>
  );
}
