"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KCard, KTag, KButton } from "@/components/ui";
import type { Pattern, OpportunityWithEvidence } from "@/lib/mockApi";

interface BrandVoice {
  summary: string;
  toneTags: string[];
  nevers: string[];
}

interface ContextPanelProps {
  voice: BrandVoice;
  patterns: Pattern[];
  opportunity?: OpportunityWithEvidence | null;
  brandId: string;
  onApplyPattern?: (patternId: string, channel: string) => void;
  defaultExpanded?: boolean;
}

export function ContextPanel({
  voice,
  patterns,
  opportunity,
  brandId,
  onApplyPattern,
  defaultExpanded = false,
}: ContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<"voice" | "suggestions">("voice");
  const [applyingPatternId, setApplyingPatternId] = useState<string | null>(null);

  const handleApplyPattern = useCallback((patternId: string, channel: string) => {
    setApplyingPatternId(patternId);
    if (onApplyPattern) {
      onApplyPattern(patternId, channel);
    }
    // Simulate async creation
    setTimeout(() => {
      setApplyingPatternId(null);
    }, 1000);
  }, [onApplyPattern]);

  const suggestedPatterns = patterns.slice(0, 4);

  return (
    <KCard className="overflow-hidden">
      {/* Collapsed header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-kairo-bg-hover/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className={[
              "w-4 h-4 text-kairo-fg-muted transition-transform duration-200",
              isExpanded && "rotate-90",
            ].filter(Boolean).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium text-kairo-fg">Context</span>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <>
              {voice.toneTags.slice(0, 2).map((tag) => (
                <KTag key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </KTag>
              ))}
              {voice.toneTags.length > 2 && (
                <span className="text-[10px] text-kairo-fg-subtle">+{voice.toneTags.length - 2}</span>
              )}
            </>
          )}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 pb-2 border-b border-kairo-border-subtle">
              <button
                onClick={() => setActiveTab("voice")}
                className={[
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === "voice"
                    ? "bg-kairo-accent-500/10 text-kairo-accent-400"
                    : "text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover",
                ].join(" ")}
              >
                Brand Voice
              </button>
              <button
                onClick={() => setActiveTab("suggestions")}
                className={[
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === "suggestions"
                    ? "bg-kairo-accent-500/10 text-kairo-accent-400"
                    : "text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover",
                ].join(" ")}
              >
                Suggestions
                {suggestedPatterns.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-kairo-bg-elevated">
                    {suggestedPatterns.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab content */}
            <div className="p-4">
              {activeTab === "voice" ? (
                <VoiceTab voice={voice} />
              ) : (
                <SuggestionsTab
                  patterns={suggestedPatterns}
                  onApplyPattern={handleApplyPattern}
                  applyingPatternId={applyingPatternId}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </KCard>
  );
}

function VoiceTab({ voice }: { voice: BrandVoice }) {
  return (
    <div className="space-y-4">
      {/* Voice summary */}
      <section>
        <h4 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
          Voice Summary
        </h4>
        <p className="text-xs text-kairo-fg-muted leading-relaxed line-clamp-3">
          {voice.summary}
        </p>
      </section>

      {/* Tone tags */}
      <section>
        <h4 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
          Tone
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {voice.toneTags.map((tag) => (
            <KTag key={tag} variant="outline" className="text-[10px]">
              {tag}
            </KTag>
          ))}
        </div>
      </section>

      {/* Nevers */}
      <section>
        <h4 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-1.5">
          Never
        </h4>
        <ul className="space-y-1">
          {voice.nevers.slice(0, 4).map((never, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-kairo-fg-subtle">
              <span className="text-kairo-error-fg shrink-0">✕</span>
              <span>{never}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

interface SuggestionsTabProps {
  patterns: Pattern[];
  onApplyPattern: (patternId: string, channel: string) => void;
  applyingPatternId: string | null;
}

function SuggestionsTab({ patterns, onApplyPattern, applyingPatternId }: SuggestionsTabProps) {
  if (patterns.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs text-kairo-fg-muted">No pattern suggestions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-kairo-fg-subtle">
        Apply a pattern to create a new variant based on proven structures.
      </p>

      {patterns.map((pattern) => (
        <PatternSuggestionCard
          key={pattern.id}
          pattern={pattern}
          onApply={(channel) => onApplyPattern(pattern.id, channel)}
          isApplying={applyingPatternId === pattern.id}
        />
      ))}
    </div>
  );
}

interface PatternSuggestionCardProps {
  pattern: Pattern;
  onApply: (channel: string) => void;
  isApplying: boolean;
}

function PatternSuggestionCard({ pattern, onApply, isApplying }: PatternSuggestionCardProps) {
  const [showChannelSelect, setShowChannelSelect] = useState(false);

  const handleApply = useCallback((channel: string) => {
    setShowChannelSelect(false);
    onApply(channel);
  }, [onApply]);

  return (
    <div className="p-3 rounded-lg border border-kairo-border-subtle bg-kairo-bg-elevated/30 space-y-2">
      {/* Pattern name + performance */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-kairo-fg">{pattern.name}</p>
          <p className="text-[10px] text-kairo-fg-subtle">{pattern.performanceHint}</p>
        </div>
        <span className="text-[10px] text-kairo-fg-muted whitespace-nowrap">
          {pattern.usageCount} uses
        </span>
      </div>

      {/* Beats */}
      <div className="flex flex-wrap gap-1">
        {pattern.beats.map((beat, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-kairo-accent-500/10 text-kairo-accent-400"
          >
            {beat}
          </span>
        ))}
      </div>

      {/* Apply action */}
      {showChannelSelect ? (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-kairo-fg-subtle">Create for:</span>
          {pattern.channels.map((channel) => (
            <button
              key={channel}
              onClick={() => handleApply(channel)}
              className="px-2 py-1 rounded text-[10px] font-medium bg-kairo-bg-hover hover:bg-kairo-accent-500/10 hover:text-kairo-accent-400 transition-colors capitalize"
            >
              {channel === "x" ? "X" : channel}
            </button>
          ))}
          <button
            onClick={() => setShowChannelSelect(false)}
            className="ml-auto px-2 py-1 rounded text-[10px] text-kairo-fg-subtle hover:text-kairo-fg transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <KButton
          size="sm"
          variant="ghost"
          onClick={() => setShowChannelSelect(true)}
          disabled={isApplying}
          className="w-full text-[11px] justify-center"
        >
          {isApplying ? (
            <>
              <svg className="animate-spin w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Apply Pattern
            </>
          )}
        </KButton>
      )}
    </div>
  );
}

ContextPanel.displayName = "ContextPanel";
