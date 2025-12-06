import { KCard } from "@/components/ui";

interface TaboosCardProps {
  nevers: string[];
}

export function TaboosCard({ nevers }: TaboosCardProps) {
  return (
    <KCard className="border-l-2 border-l-kairo-ink-400 bg-kairo-surface-plain">
      {/* Strong header */}
      <h3 className="text-sm font-semibold text-kairo-ink-800 mb-3">
        Guardrails: never do this
      </h3>

      {/* Taboo rules list - tight spacing for punchy feel */}
      <ul className="space-y-1.5">
        {nevers.map((rule, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-xs text-kairo-ink-500 shrink-0 mt-0.5">✕</span>
            <span className="text-sm text-kairo-ink-700">{rule}</span>
          </li>
        ))}
      </ul>
    </KCard>
  );
}

TaboosCard.displayName = "TaboosCard";
