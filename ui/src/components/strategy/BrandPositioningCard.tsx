import { KCard, KTag } from "@/components/ui";

interface BrandPositioningCardProps {
  brandName: string;
  positioning: string;
  toneTags: string[];
}

export function BrandPositioningCard({
  brandName,
  positioning,
  toneTags,
}: BrandPositioningCardProps) {
  const maxTags = 4;
  const visibleTags = toneTags.slice(0, maxTags);
  const remainingCount = toneTags.length - maxTags;

  return (
    <div className="animate-[kairo-fade-up_var(--kairo-motion-slow)_var(--kairo-ease-soft)]">
      <KCard elevated className="border-l-2 border-l-kairo-aqua-300 pl-4 bg-kairo-surface-plain">
        {/* Eyebrow */}
        <p className="text-xs text-kairo-ink-500 uppercase tracking-wide mb-2">
          {brandName} in one line
        </p>

        {/* Hero positioning statement */}
        <p className="text-xl text-kairo-ink-900 font-semibold leading-snug">
          {positioning}
        </p>

        {/* Separator */}
        <div className="border-t border-kairo-border-subtle mt-4 pt-3">
          {/* Tone chips with staggered entrance */}
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleTags.map((tag, idx) => (
              <span
                key={tag}
                className="opacity-0 animate-[kairo-fade-up_var(--kairo-motion-fast)_var(--kairo-ease-soft)_forwards]"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <KTag variant="muted" className="text-xs">
                  {tag}
                </KTag>
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="text-xs text-kairo-ink-400 px-2 py-0.5">
                +{remainingCount} more
              </span>
            )}
          </div>
        </div>
      </KCard>
    </div>
  );
}

BrandPositioningCard.displayName = "BrandPositioningCard";
