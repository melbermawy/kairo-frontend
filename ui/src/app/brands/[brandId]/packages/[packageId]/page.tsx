import { notFound } from "next/navigation";
import Link from "next/link";
import { KButton, KCard, KTag } from "@/components/ui";
import { getBrandById } from "@/demo/brands";
import { getPackageById } from "@/demo/packages";

interface PackageDetailPageProps {
  params: Promise<{ brandId: string; packageId: string }>;
}

const variantStatusColors: Record<string, "filled" | "outline" | "danger"> = {
  draft: "outline",
  edited: "filled",
  approved: "filled",
};

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { brandId, packageId } = await params;
  const brand = getBrandById(brandId);
  const pkg = getPackageById(packageId);

  if (!brand || !pkg || pkg.brandId !== brandId) {
    notFound();
  }

  const linkedInVariants = pkg.variants.filter((v) => v.channel === "LinkedIn");
  const xVariants = pkg.variants.filter((v) => v.channel === "X");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href={`/brands/${brandId}/today`} className="text-taupe-400 hover:text-deep-600">
          Today
        </Link>
        <span className="text-taupe-400">/</span>
        <Link href={`/brands/${brandId}/packages`} className="text-taupe-400 hover:text-deep-600">
          Packages
        </Link>
        <span className="text-taupe-400">/</span>
        <span className="text-taupe-700 font-medium truncate max-w-[300px]">
          {pkg.title}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-taupe-700">
              {pkg.title}
            </h1>
            <KTag variant={pkg.status === "draft" ? "outline" : "filled"}>
              {pkg.status.replace("_", " ")}
            </KTag>
          </div>
          <div className="flex gap-2">
            <KTag variant="outline">{pkg.persona}</KTag>
            <KTag variant="outline">{pkg.pillar}</KTag>
          </div>
        </div>
        <div className="flex gap-2">
          <KButton variant="secondary">View in Calendar</KButton>
          <KButton>Schedule Selected</KButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Argument Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-taupe-700">Core Argument</h2>
          <KCard>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-taupe-400 uppercase tracking-wider mb-2">
                  Thesis
                </p>
                <p className="text-sm text-taupe-700">{pkg.thesis}</p>
              </div>

              <div>
                <p className="text-xs text-taupe-400 uppercase tracking-wider mb-2">
                  Supporting Points
                </p>
                <ul className="space-y-2">
                  {pkg.supportingPoints.map((point, idx) => (
                    <li key={idx} className="text-sm text-taupe-700 flex items-start gap-2">
                      <span className="text-taupe-400">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {pkg.opportunityId && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-taupe-400">
                    From opportunity: {pkg.opportunityId}
                  </p>
                </div>
              )}
            </div>
          </KCard>
        </div>

        {/* Variants Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* LinkedIn Variants */}
          {linkedInVariants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-taupe-700">LinkedIn</h2>
                <KButton variant="ghost">Add Variant</KButton>
              </div>
              {linkedInVariants.map((variant) => (
                <KCard key={variant.id} elevated>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <KTag variant={variantStatusColors[variant.status]}>
                        {variant.status}
                      </KTag>
                      <span className="text-xs text-taupe-400">
                        Pattern: {variant.pattern}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <KButton variant="ghost">Ask Kairo</KButton>
                      <KButton variant="ghost">Duplicate</KButton>
                    </div>
                  </div>
                  <p className="text-sm text-taupe-700 whitespace-pre-line">
                    {variant.body}
                  </p>
                </KCard>
              ))}
            </div>
          )}

          {/* X Variants */}
          {xVariants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-taupe-700">X (Twitter)</h2>
                <KButton variant="ghost">Add Variant</KButton>
              </div>
              {xVariants.map((variant) => (
                <KCard key={variant.id} elevated>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <KTag variant={variantStatusColors[variant.status]}>
                        {variant.status}
                      </KTag>
                      <span className="text-xs text-taupe-400">
                        Pattern: {variant.pattern}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <KButton variant="ghost">Ask Kairo</KButton>
                      <KButton variant="ghost">Duplicate</KButton>
                    </div>
                  </div>
                  <p className="text-sm text-taupe-700 whitespace-pre-line">
                    {variant.body}
                  </p>
                </KCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
