"use client";

interface KSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton loader for content placeholders.
 * Per deployment_prep_plan.md Phase 4: Skeleton loading instead of spinners.
 */
export function KSkeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}: KSkeletonProps) {
  const baseClasses = "animate-pulse bg-kairo-bg-elevated";

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl",
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === "circular" ? "40px" : "100%"),
    height: height ?? (variant === "circular" ? "40px" : variant === "card" ? "200px" : "16px"),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton version of an opportunity card.
 * Matches the OpportunityCardV2 layout.
 */
export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-xl p-4 bg-kairo-bg-card border border-kairo-border-subtle">
      {/* Top row: Score + Type */}
      <div className="flex items-center gap-2 mb-2.5">
        <KSkeleton variant="circular" width={36} height={24} className="rounded-full" />
        <KSkeleton width={60} height={20} className="rounded-full" />
      </div>

      {/* Title */}
      <KSkeleton variant="text" height={20} className="mb-1.5" />
      <KSkeleton variant="text" width="75%" height={20} className="mb-1.5" />

      {/* Why now summary */}
      <KSkeleton variant="text" height={16} className="mb-1" />
      <KSkeleton variant="text" width="60%" height={16} className="mb-2.5" />

      {/* Bottom row: Platform badges + Pillar */}
      <div className="flex items-center gap-2">
        <KSkeleton width={32} height={20} className="rounded-full" />
        <KSkeleton width={32} height={20} className="rounded-full" />
        <KSkeleton width={80} height={20} className="rounded-full" />
      </div>
    </div>
  );
}

KSkeleton.displayName = "KSkeleton";
OpportunityCardSkeleton.displayName = "OpportunityCardSkeleton";
