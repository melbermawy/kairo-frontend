import type { DemoPattern } from "@/demo/patterns";

interface AlsoWorthTryingProps {
  patterns: DemoPattern[];
}

export function AlsoWorthTrying({ patterns }: AlsoWorthTryingProps) {
  if (patterns.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-kairo-ink-500 shrink-0">Also worth trying:</span>
      <div className="flex items-center gap-1.5">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            className={[
              "inline-flex items-center",
              "px-2.5 py-1",
              "rounded-(--kairo-radius-sm)",
              "text-xs font-medium",
              "bg-kairo-sand-50 text-kairo-ink-700",
              "border border-kairo-border-subtle",
              "hover:bg-kairo-sand-100 hover:border-kairo-border-strong",
              "transition-colors duration-100",
            ].join(" ")}
          >
            {pattern.name}
          </button>
        ))}
      </div>
    </div>
  );
}

AlsoWorthTrying.displayName = "AlsoWorthTrying";
