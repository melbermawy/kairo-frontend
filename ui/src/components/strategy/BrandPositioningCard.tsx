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
  const maxTags = 5;
  const visibleTags = toneTags.slice(0, maxTags);
  const remainingCount = toneTags.length - maxTags;

  return (
    <KCard elevated className="border-l-2 border-l-kairo-aqua-200 pl-4">
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
        {/* Tone chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleTags.map((tag) => (
            <KTag key={tag} variant="muted" className="text-xs">
              {tag}
            </KTag>
          ))}
          {remainingCount > 0 && (
            <span className="text-xs text-kairo-ink-400 px-2 py-0.5">
              +{remainingCount} more
            </span>
          )}
        </div>
      </div>
    </KCard>
  );
}

BrandPositioningCard.displayName = "BrandPositioningCard";
