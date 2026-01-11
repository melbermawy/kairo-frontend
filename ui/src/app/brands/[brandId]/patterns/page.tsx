import { mockApi, NotFoundError } from "@/lib/mockApi";
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

  let brand;
  try {
    brand = mockApi.getBrand(brandId);
  } catch (e) {
    if (e instanceof NotFoundError) {
      return null;
    }
    throw e;
  }

  const patterns = mockApi.listPatterns();
  const topPatterns = mockApi.getTopPatterns(3);

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

      {/* Recommendations section - hero */}
      {heroPattern && (
        <section className="space-y-3">
          <PatternRecommendationHero
            pattern={heroPattern}
            brandName={brand.name}
          />
          <AlsoWorthTrying patterns={alsoWorthTrying} />
        </section>
      )}

      {/* Patterns list with filters - clear separation from hero */}
      <div className="pt-2">
        <PatternFilters patterns={patterns} />
      </div>
    </div>
  );
}
