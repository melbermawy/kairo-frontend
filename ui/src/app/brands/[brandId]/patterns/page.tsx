import { KCard, KTag } from "@/components/ui";
import { getBrandById } from "@/demo/brands";
import { getAllPatterns } from "@/demo/patterns";

interface PatternsPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function PatternsPage({ params }: PatternsPageProps) {
  const { brandId } = await params;
  const brand = getBrandById(brandId);
  const patterns = getAllPatterns();

  if (!brand) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-taupe-700">Pattern Library</h1>
        <p className="text-sm text-taupe-400 mt-1">
          Content patterns that work for {brand.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((pattern) => (
          <KCard key={pattern.id} elevated>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-taupe-700">
                {pattern.name}
              </h3>
              <div className="flex gap-1">
                {pattern.channels.map((channel) => (
                  <KTag key={channel} variant="outline">
                    {channel}
                  </KTag>
                ))}
              </div>
            </div>

            <p className="text-sm text-taupe-700 mb-4">{pattern.description}</p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-taupe-400 uppercase tracking-wider mb-1">
                  Structure
                </p>
                <p className="text-sm text-taupe-700">{pattern.structure}</p>
              </div>

              <div>
                <p className="text-xs text-taupe-400 uppercase tracking-wider mb-1">
                  Example Hook
                </p>
                <p className="text-sm text-taupe-700 italic">
                  &ldquo;{pattern.exampleHook}&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center gap-6">
              <div>
                <p className="text-xs text-taupe-400">Usage</p>
                <p className="text-lg font-semibold text-taupe-700">
                  {pattern.usageCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-taupe-400">Avg Engagement</p>
                <p className="text-lg font-semibold text-taupe-700">
                  {pattern.avgEngagement}%
                </p>
              </div>
            </div>
          </KCard>
        ))}
      </div>
    </div>
  );
}
