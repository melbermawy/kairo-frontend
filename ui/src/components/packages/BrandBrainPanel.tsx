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
    <div className="space-y-4">
      {/* Voice & Guardrails */}
      <VoiceCard voice={voice} />

      {/* Suggested Patterns */}
      <PatternsCard patterns={patterns} />
    </div>
  );
}

function VoiceCard({ voice }: { voice: BrandVoice }) {
  return (
    <KCard className="p-4">
      <h3 className="text-sm font-semibold text-kairo-ink-900 mb-3">
        Brand Voice & Guardrails
      </h3>

      {/* Voice summary */}
      <p className="text-sm text-kairo-ink-700 mb-3 leading-relaxed">
        {voice.summary}
      </p>

      {/* Tone tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {voice.toneTags.map((tag) => (
          <KTag key={tag} variant="outline" className="text-xs">
            {tag}
          </KTag>
        ))}
      </div>

      {/* Never do section */}
      <div className="pt-3 border-t border-kairo-border-subtle">
        <p className="text-xs font-medium text-kairo-ink-600 uppercase tracking-wide mb-2">
          Never do
        </p>
        <ul className="space-y-1.5">
          {voice.nevers.map((never, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-kairo-ink-500">
              <span className="text-kairo-ink-400 shrink-0">✕</span>
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
    <KCard className="p-4">
      <h3 className="text-sm font-semibold text-kairo-ink-900 mb-3">
        Suggested Patterns
      </h3>

      <div className="space-y-3">
        {suggestedPatterns.map((pattern) => (
          <PatternRow key={pattern.id} pattern={pattern} />
        ))}
      </div>
    </KCard>
  );
}

function PatternRow({ pattern }: { pattern: Pattern }) {
  return (
    <div className="space-y-1.5">
      {/* Pattern name */}
      <p className="text-sm font-medium text-kairo-ink-800">
        {pattern.name}
      </p>

      {/* Beat bar */}
      <div className="flex items-center gap-1">
        {pattern.beats.map((beat, idx) => (
          <span
            key={idx}
            className={[
              "inline-flex items-center",
              "px-1.5 py-0.5",
              "rounded-(--kairo-radius-xs)",
              "text-xs",
              "bg-kairo-aqua-50 text-kairo-aqua-600",
            ].join(" ")}
          >
            {beat}
          </span>
        ))}
      </div>

      {/* Performance hint */}
      <p className="text-xs text-kairo-ink-500">
        {pattern.performanceHint}
      </p>
    </div>
  );
}

BrandBrainPanel.displayName = "BrandBrainPanel";
