"use client";

import { useCallback } from "react";
import { KTag } from "@/components/ui";
import { PrimaryGoalOptions, CtaPostureOptions } from "@/contracts";
import { TokenInput } from "./TokenInput";

// ============================================
// TYPES
// ============================================

interface Tier0FormProps {
  answers: Record<string, unknown>;
  onAnswerChange: (key: string, value: unknown) => void;
}

// ============================================
// COMPONENT
// ============================================

export function Tier0Form({ answers, onAnswerChange }: Tier0FormProps) {
  // Helpers
  const getString = (key: string): string => (answers[key] as string) || "";
  const getArray = (key: string): string[] => (answers[key] as string[]) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[16px] font-semibold text-kairo-fg mb-1">
          Brand Basics
        </h2>
        <p className="text-[13px] text-kairo-fg-muted">
          These core details help Kairo understand your brand identity.
        </p>
      </div>

      {/* What we do */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          What does your brand do?{" "}
          <span className="text-kairo-accent-400">*</span>
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          Describe your product or service in 1-2 sentences.
        </p>
        <textarea
          value={getString("tier0.what_we_do")}
          onChange={(e) => onAnswerChange("tier0.what_we_do", e.target.value)}
          placeholder="We provide..."
          rows={3}
          className="
            w-full px-3 py-2 rounded-lg text-[13px]
            bg-kairo-bg-elevated border border-kairo-border-subtle
            text-kairo-fg placeholder:text-kairo-fg-subtle
            focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
            resize-none
          "
        />
        <p className="text-[10px] text-kairo-fg-subtle text-right">
          {getString("tier0.what_we_do").length}/500
        </p>
      </div>

      {/* Who for */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Who is your target audience?{" "}
          <span className="text-kairo-accent-400">*</span>
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          Describe your ideal customer or audience.
        </p>
        <textarea
          value={getString("tier0.who_for")}
          onChange={(e) => onAnswerChange("tier0.who_for", e.target.value)}
          placeholder="Our audience is..."
          rows={3}
          className="
            w-full px-3 py-2 rounded-lg text-[13px]
            bg-kairo-bg-elevated border border-kairo-border-subtle
            text-kairo-fg placeholder:text-kairo-fg-subtle
            focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
            resize-none
          "
        />
      </div>

      {/* Edge / differentiators */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          What makes you different?
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          Add 3-5 things that set your brand apart.
        </p>
        <TokenInput
          value={getArray("tier0.edge")}
          onChange={(val) => onAnswerChange("tier0.edge", val)}
          placeholder="Type and press Enter..."
          maxItems={5}
        />
      </div>

      {/* Tone words */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Tone / Voice words
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          3-7 words that describe how your brand sounds.
        </p>
        <TokenInput
          value={getArray("tier0.tone_words")}
          onChange={(val) => onAnswerChange("tier0.tone_words", val)}
          placeholder="e.g., Playful, Professional, Bold..."
          maxItems={7}
          suggestions={[
            "Professional",
            "Playful",
            "Bold",
            "Friendly",
            "Witty",
            "Confident",
            "Empathetic",
            "Authoritative",
            "Casual",
            "Inspiring",
          ]}
        />
      </div>

      {/* Taboos */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Topics to avoid
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          What should your brand never talk about?
        </p>
        <TokenInput
          value={getArray("tier0.taboos")}
          onChange={(val) => onAnswerChange("tier0.taboos", val)}
          placeholder="e.g., Politics, Competitors by name..."
          maxItems={10}
        />
      </div>

      {/* Primary goal */}
      <div className="space-y-3">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Primary social media goal{" "}
          <span className="text-kairo-accent-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PrimaryGoalOptions.map((option) => {
            const isSelected = getString("tier0.primary_goal") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onAnswerChange("tier0.primary_goal", option.value)}
                className={`
                  px-4 py-3 rounded-lg text-left text-[13px] transition-all
                  border
                  ${
                    isSelected
                      ? "bg-kairo-accent-500/10 border-kairo-accent-500 text-kairo-fg"
                      : "bg-kairo-bg-elevated border-kairo-border-subtle text-kairo-fg-muted hover:border-kairo-border-strong hover:text-kairo-fg"
                  }
                `}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA posture */}
      <div className="space-y-3">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Call-to-action approach{" "}
          <span className="text-kairo-accent-400">*</span>
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          How promotional should your content be?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CtaPostureOptions.map((option) => {
            const isSelected = getString("tier0.cta_posture") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onAnswerChange("tier0.cta_posture", option.value)}
                className={`
                  px-4 py-3 rounded-lg text-left text-[13px] transition-all
                  border
                  ${
                    isSelected
                      ? "bg-kairo-accent-500/10 border-kairo-accent-500 text-kairo-fg"
                      : "bg-kairo-bg-elevated border-kairo-border-subtle text-kairo-fg-muted hover:border-kairo-border-strong hover:text-kairo-fg"
                  }
                `}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Tier0Form.displayName = "Tier0Form";
