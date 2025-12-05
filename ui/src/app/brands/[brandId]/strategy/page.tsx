import { KCard, KTag } from "@/components/ui";
import { getBrandById } from "@/demo/brands";

interface StrategyPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { brandId } = await params;
  const brand = getBrandById(brandId);

  if (!brand) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-taupe-700">Brand Strategy</h1>
        <p className="text-sm text-taupe-400 mt-1">
          Brand brain summary for {brand.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positioning */}
        <KCard elevated>
          <h2 className="text-lg font-semibold text-taupe-700 mb-4">
            Positioning
          </h2>
          <p className="text-sm text-taupe-700">{brand.positioning}</p>
          <div className="mt-4">
            <p className="text-xs text-taupe-400 uppercase tracking-wider mb-2">
              Vertical
            </p>
            <KTag variant="outline">{brand.vertical}</KTag>
          </div>
        </KCard>

        {/* Tone */}
        <KCard elevated>
          <h2 className="text-lg font-semibold text-taupe-700 mb-4">
            Tone & Voice
          </h2>
          <p className="text-sm text-taupe-400 mb-3">
            How {brand.name} communicates
          </p>
          <div className="flex gap-2 flex-wrap">
            {brand.tone.map((t) => (
              <KTag key={t}>{t}</KTag>
            ))}
          </div>
        </KCard>

        {/* Pillars */}
        <KCard elevated>
          <h2 className="text-lg font-semibold text-taupe-700 mb-4">
            Content Pillars
          </h2>
          <p className="text-sm text-taupe-400 mb-3">
            Core themes and topics
          </p>
          <div className="space-y-2">
            {brand.pillars.map((pillar) => (
              <div
                key={pillar}
                className="flex items-center gap-2 text-sm text-taupe-700"
              >
                <span className="w-2 h-2 rounded-full bg-aqua-500" />
                {pillar}
              </div>
            ))}
          </div>
        </KCard>

        {/* Personas */}
        <KCard elevated>
          <h2 className="text-lg font-semibold text-taupe-700 mb-4">
            Target Personas
          </h2>
          <p className="text-sm text-taupe-400 mb-3">
            Who we create content for
          </p>
          <div className="space-y-2">
            {brand.personas.map((persona) => (
              <div
                key={persona}
                className="flex items-center gap-2 text-sm text-taupe-700"
              >
                <span className="w-2 h-2 rounded-full bg-deep-600" />
                {persona}
              </div>
            ))}
          </div>
        </KCard>

        {/* Channels */}
        <KCard elevated className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-taupe-700 mb-4">
            Active Channels
          </h2>
          <div className="flex gap-4">
            {brand.channels.map((channel) => (
              <div
                key={channel}
                className="flex items-center gap-3 px-4 py-3 bg-sand-100 rounded-lg"
              >
                <span className="w-3 h-3 rounded-full bg-success-500" />
                <span className="text-sm font-medium text-taupe-700">
                  {channel}
                </span>
                <span className="text-xs text-taupe-400">Active</span>
              </div>
            ))}
          </div>
        </KCard>
      </div>
    </div>
  );
}
