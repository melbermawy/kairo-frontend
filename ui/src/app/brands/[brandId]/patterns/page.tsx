import { getBrandById } from "@/demo/brands";
import { getAllPatterns, getTopPatterns } from "@/demo/patterns";
import {
  PatternFilters,
  PatternRecommendationHero,
  AlsoWorthTrying,
} from "@/components/patterns";

interface PatternsPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function PatternsPage({ params }: PatternsPageProps) {
  const { brandId } = await params;
  const brand = getBrandById(brandId);
  const patterns = getAllPatterns();
  const topPatterns = getTopPatterns(3);

  if (!brand) {
    return null;
  }

  const heroPattern = topPatterns[0];
  const alsoWorthTrying = topPatterns.slice(1, 3);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header>
        <h1 className="text-xl font-semibold text-kairo-ink-900">
          Patterns Library
        </h1>
        <p className="text-sm text-kairo-ink-500 mt-1">
          Reusable storytelling patterns for {brand.name}
        </p>
      </header>

      {/* Recommendations section */}
      {heroPattern && (
        <section className="space-y-3">
          <PatternRecommendationHero
            pattern={heroPattern}
            brandName={brand.name}
          />
          <AlsoWorthTrying patterns={alsoWorthTrying} />
        </section>
      )}

      {/* Patterns list with filters */}
      <PatternFilters patterns={patterns} />
    </div>
  );
}
