import { KCard, KTag } from "@/components/ui";
import type { Pattern } from "@/lib/mockApi";

interface BrandVoice {
  summary: string;
  toneTags: string[];
  nevers: string[];
  primaryChannel?: string;
  primaryPersona?: string;
}

interface BrandBrainPanelProps {
  voice: BrandVoice;
  patterns: Pattern[];
}

export function BrandBrainPanel({ voice, patterns }: BrandBrainPanelProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Voice & Guardrails */}
      <VoiceCard voice={voice} />

      {/* Suggested Patterns */}
      <PatternsCard patterns={patterns} />
    </div>
  );
}

function VoiceCard({ voice }: { voice: BrandVoice }) {
  return (
    <KCard className="p-3 sm:p-4">
      <h3 className="text-xs sm:text-sm font-semibold text-kairo-fg mb-2 sm:mb-3">
        Brand Voice & Guardrails
      </h3>

      {/* Voice summary */}
      <p className="text-[11px] sm:text-sm text-kairo-fg-muted mb-2.5 sm:mb-3 leading-relaxed line-clamp-4 sm:line-clamp-none">
        {voice.summary}
      </p>

      {/* Tone tags */}
      <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
        {voice.toneTags.map((tag) => (
          <KTag key={tag} variant="outline" className="text-[10px] sm:text-xs">
            {tag}
          </KTag>
        ))}
      </div>

      {/* Never do section */}
      <div className="pt-2.5 sm:pt-3 border-t border-kairo-border-subtle">
        <p className="text-[10px] sm:text-xs font-medium text-kairo-fg-muted uppercase tracking-wide mb-1.5 sm:mb-2">
          Never do
        </p>
        <ul className="space-y-1 sm:space-y-1.5">
          {voice.nevers.map((never, idx) => (
            <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-kairo-fg-subtle">
              <span className="text-kairo-error-fg shrink-0">✕</span>
              <span>{never}</span>
            </li>
          ))}
        </ul>
      </div>
    </KCard>
  );
}

function PatternsCard({ patterns }: { patterns: Pattern[] }) {
  // Show first 3 patterns as suggestions
  const suggestedPatterns = patterns.slice(0, 3);

  return (
    <KCard className="p-3 sm:p-4">
      <h3 className="text-xs sm:text-sm font-semibold text-kairo-fg mb-2 sm:mb-3">
        Suggested Patterns
      </h3>

      <div className="space-y-2.5 sm:space-y-3">
        {suggestedPatterns.map((pattern) => (
          <PatternRow key={pattern.id} pattern={pattern} />
        ))}
      </div>
    </KCard>
  );
}

function PatternRow({ pattern }: { pattern: Pattern }) {
  return (
    <div className="space-y-1 sm:space-y-1.5">
      {/* Pattern name */}
      <p className="text-xs sm:text-sm font-medium text-kairo-fg">
        {pattern.name}
      </p>

      {/* Beat bar - scrollable on mobile if needed */}
      <div className="flex items-center gap-1 flex-wrap">
        {pattern.beats.map((beat, idx) => (
          <span
            key={idx}
            className={[
              "inline-flex items-center",
              "px-1 sm:px-1.5 py-0.5",
              "rounded-(--kairo-radius-xs)",
              "text-[10px] sm:text-xs",
              "bg-kairo-accent-500/10 text-kairo-accent-400",
            ].join(" ")}
          >
            {beat}
          </span>
        ))}
      </div>

      {/* Performance hint */}
      <p className="text-[10px] sm:text-xs text-kairo-fg-subtle">
        {pattern.performanceHint}
      </p>
    </div>
  );
}

BrandBrainPanel.displayName = "BrandBrainPanel";
