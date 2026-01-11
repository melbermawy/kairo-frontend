"use client";

interface CompileStatusBadgeProps {
  compiledAt: Date | null;
  isStale: boolean;
}

export function CompileStatusBadge({
  compiledAt,
  isStale,
}: CompileStatusBadgeProps) {
  if (!compiledAt) {
    return (
      <div className="flex items-center gap-2 text-[12px]">
        <span className="w-2 h-2 rounded-full bg-kairo-fg-subtle" />
        <span className="text-kairo-fg-muted">Never compiled</span>
      </div>
    );
  }

  const timeAgo = getTimeAgo(compiledAt);

  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span
        className={`w-2 h-2 rounded-full ${
          isStale ? "bg-yellow-500" : "bg-green-500"
        }`}
      />
      <span className="text-kairo-fg-muted">
        {isStale ? "Stale" : "Up to date"}
      </span>
      <span className="text-kairo-fg-subtle">·</span>
      <span className="text-kairo-fg-subtle">{timeAgo}</span>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

CompileStatusBadge.displayName = "CompileStatusBadge";
