import { KCard } from "@/components/ui";
import type { BrandPillar } from "@/demo/brands";

interface PillarsRowProps {
  pillars: BrandPillar[];
}

export function PillarsRow({ pillars }: PillarsRowProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-kairo-ink-600">
        Content pillars
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.slice(0, 4).map((pillar) => (
          <KCard key={pillar.id} className="p-4">
            {/* Visual motif - small bar */}
            <div className="flex gap-0.5 mb-3">
              <span className="w-4 h-0.5 bg-kairo-aqua-300 rounded-full" />
              <span className="w-2 h-0.5 bg-kairo-aqua-200 rounded-full" />
              <span className="w-1 h-0.5 bg-kairo-aqua-100 rounded-full" />
            </div>

            <h4 className="text-sm font-semibold text-kairo-ink-900 mb-1.5">
              {pillar.name}
            </h4>
            <p className="text-xs text-kairo-ink-600 leading-relaxed">
              {pillar.summary}
            </p>
          </KCard>
        ))}
      </div>
    </div>
  );
}

PillarsRow.displayName = "PillarsRow";
