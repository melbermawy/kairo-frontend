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
      {/* Grid adapts: 1 col mobile, 2 cols tablet, 3 cols desktop (fits 3-4 pillars better) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillars.slice(0, 4).map((pillar) => (
          <KCard key={pillar.id} className="p-4 group kairo-transition-soft hover:shadow-elevated hover:bg-kairo-surface-soft">
            {/* Visual motif - small bar */}
            <div className="flex gap-0.5 mb-3">
              <span className="w-4 h-0.5 bg-kairo-aqua-300 rounded-full kairo-transition-fast group-hover:bg-kairo-aqua-400" />
              <span className="w-2 h-0.5 bg-kairo-aqua-200 rounded-full kairo-transition-fast group-hover:bg-kairo-aqua-300" />
              <span className="w-1 h-0.5 bg-kairo-aqua-100 rounded-full kairo-transition-fast group-hover:bg-kairo-aqua-200" />
            </div>

            <h4 className="text-sm font-semibold text-kairo-ink-900 mb-1">
              {pillar.name}
            </h4>
            <p className="text-xs text-kairo-ink-500 leading-relaxed line-clamp-2">
              {pillar.summary}
            </p>
          </KCard>
        ))}
      </div>
    </div>
  );
}

PillarsRow.displayName = "PillarsRow";
