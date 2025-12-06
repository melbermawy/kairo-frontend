interface TaboosCardProps {
  nevers: string[];
}

export function TaboosCard({ nevers }: TaboosCardProps) {
  return (
    <div className="rounded-(--kairo-radius-md) border-l-2 border-l-kairo-coral-300 bg-kairo-sand-50 px-5 py-4 kairo-transition-soft hover:shadow-soft">
      {/* Strong header */}
      <h3 className="text-sm font-semibold text-kairo-ink-800 mb-2">
        Guardrails
      </h3>

      {/* Taboo rules list - tight, punchy */}
      <ul className="space-y-1">
        {nevers.map((rule, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-xs text-kairo-coral-500 shrink-0 mt-0.5">✕</span>
            <span className="text-sm text-kairo-ink-600">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

TaboosCard.displayName = "TaboosCard";
