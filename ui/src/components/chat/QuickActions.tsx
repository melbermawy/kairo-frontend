"use client";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const quickActions = [
  "Summarize today's board",
  "Propose next 3 packages",
  "Highlight risky gaps",
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-kairo-border-subtle bg-kairo-sand-50">
      {quickActions.map((action) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className={[
            "px-2.5 py-1",
            "text-xs font-medium",
            "bg-kairo-surface-plain text-kairo-ink-700",
            "border border-kairo-border-subtle",
            "rounded-(--kairo-radius-pill)",
            "hover:bg-kairo-aqua-50 hover:text-kairo-aqua-600 hover:border-kairo-aqua-200",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-aqua-500",
          ].join(" ")}
        >
          {action}
        </button>
      ))}
    </div>
  );
}

QuickActions.displayName = "QuickActions";
