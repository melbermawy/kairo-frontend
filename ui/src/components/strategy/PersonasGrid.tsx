import { KCard } from "@/components/ui";

// UI-specific persona shape (adapted from brand data in page components)
interface Persona {
  id: string;
  name: string;
  role: string;
  summary: string;
  goals: string[];
}

interface PersonasGridProps {
  personas: Persona[];
}

export function PersonasGrid({ personas }: PersonasGridProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-kairo-ink-600">
        Personas
      </h3>
      {/* Max-width constrains single/double personas from stretching awkwardly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
        {personas.map((persona) => (
          <PersonaCard key={persona.id} persona={persona} />
        ))}
      </div>
    </div>
  );
}

function PersonaCard({ persona }: { persona: Persona }) {
  // Use goals as priorities, limit to 3-4 for density
  const priorities = persona.goals.slice(0, 4);

  return (
    <KCard className="p-3 group kairo-transition-soft hover:shadow-elevated hover:bg-kairo-surface-soft">
      {/* Type label */}
      <p className="text-[10px] uppercase text-kairo-ink-500 tracking-wide mb-1">
        Persona
      </p>

      {/* Name + Role on single line */}
      <h4 className="text-sm font-semibold text-kairo-ink-900 mb-1">
        {persona.name} <span className="font-normal text-kairo-ink-500">· {persona.role}</span>
      </h4>

      {/* Brief summary - 1-2 lines */}
      <p className="text-xs text-kairo-ink-600 mb-2 leading-relaxed line-clamp-2">
        {persona.summary}
      </p>

      {/* Priority pills */}
      <div className="flex flex-wrap gap-1">
        {priorities.map((priority, idx) => (
          <span
            key={idx}
            className={[
              "inline-flex items-center",
              "px-2 py-0.5",
              "rounded-(--kairo-radius-pill)",
              "text-xs",
              "bg-kairo-sand-100 text-kairo-ink-600",
              "kairo-transition-fast group-hover:bg-kairo-sand-100 group-hover:text-kairo-ink-700 group-hover:opacity-100 opacity-80",
            ].join(" ")}
          >
            {priority}
          </span>
        ))}
      </div>
    </KCard>
  );
}

PersonasGrid.displayName = "PersonasGrid";
