"use client";

import { useState } from "react";
import { TokenInput } from "./TokenInput";
import { env } from "@/lib/env";

interface Tier2FormProps {
  answers: Record<string, unknown>;
  onAnswerChange: (key: string, value: unknown) => void;
}

const PLATFORMS_WITH_RULES = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
];

interface PlatformRules {
  hashtag_rules?: string;
  formatting_rules?: string;
  posting_frequency?: string;
}

export function Tier2Form({ answers, onAnswerChange }: Tier2FormProps) {
  const [expandedPlatforms, setExpandedPlatforms] = useState<string[]>([]);

  const getArray = (key: string): string[] => (answers[key] as string[]) || [];
  const getPlatformRules = (): Record<string, PlatformRules> =>
    (answers["tier2.platform_rules"] as Record<string, PlatformRules>) || {};

  const togglePlatformExpanded = (platform: string) => {
    setExpandedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const updatePlatformRule = (
    platform: string,
    field: keyof PlatformRules,
    value: string
  ) => {
    const currentRules = getPlatformRules();
    const platformRules = currentRules[platform] || {};
    onAnswerChange("tier2.platform_rules", {
      ...currentRules,
      [platform]: {
        ...platformRules,
        [field]: value,
      },
    });
  };

  const platformRules = getPlatformRules();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[16px] font-semibold text-kairo-fg mb-1">
          Advanced Settings
        </h2>
        <p className="text-[13px] text-kairo-fg-muted">
          Fine-tune how Kairo generates content for specific platforms.
        </p>
      </div>

      {/* Platform-specific rules */}
      <div className="space-y-3">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Platform-specific Rules
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          Set custom guidelines for each platform.
        </p>

        <div className="space-y-2">
          {PLATFORMS_WITH_RULES.map((platform) => {
            const isExpanded = expandedPlatforms.includes(platform.value);
            const rules = platformRules[platform.value] || {};

            return (
              <div
                key={platform.value}
                className="border border-kairo-border-subtle rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => togglePlatformExpanded(platform.value)}
                  className="
                    w-full px-4 py-3 flex items-center justify-between
                    bg-kairo-bg-elevated text-kairo-fg text-[13px] font-medium
                    hover:bg-kairo-bg-hover transition-colors
                  "
                >
                  <span>{platform.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 py-4 space-y-4 bg-kairo-bg-card">
                    <div className="space-y-1.5">
                      <label className="text-[12px] text-kairo-fg-muted">
                        Hashtag rules
                      </label>
                      <textarea
                        value={rules.hashtag_rules || ""}
                        onChange={(e) =>
                          updatePlatformRule(
                            platform.value,
                            "hashtag_rules",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Always include #YourBrand, max 5 hashtags..."
                        rows={2}
                        className="
                          w-full px-3 py-2 rounded-lg text-[12px]
                          bg-kairo-bg-elevated border border-kairo-border-subtle
                          text-kairo-fg placeholder:text-kairo-fg-subtle
                          focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
                          resize-none
                        "
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] text-kairo-fg-muted">
                        Formatting rules
                      </label>
                      <textarea
                        value={rules.formatting_rules || ""}
                        onChange={(e) =>
                          updatePlatformRule(
                            platform.value,
                            "formatting_rules",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Use emojis sparingly, prefer short paragraphs..."
                        rows={2}
                        className="
                          w-full px-3 py-2 rounded-lg text-[12px]
                          bg-kairo-bg-elevated border border-kairo-border-subtle
                          text-kairo-fg placeholder:text-kairo-fg-subtle
                          focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
                          resize-none
                        "
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] text-kairo-fg-muted">
                        Posting frequency
                      </label>
                      <input
                        type="text"
                        value={rules.posting_frequency || ""}
                        onChange={(e) =>
                          updatePlatformRule(
                            platform.value,
                            "posting_frequency",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 3x per week, daily stories..."
                        className="
                          w-full px-3 py-2 rounded-lg text-[12px]
                          bg-kairo-bg-elevated border border-kairo-border-subtle
                          text-kairo-fg placeholder:text-kairo-fg-subtle
                          focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
                        "
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Proof Claims */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Proof Claims
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          Specific claims or stats your brand can back up.
        </p>
        <TokenInput
          value={getArray("tier2.proof_claims")}
          onChange={(val) => onAnswerChange("tier2.proof_claims", val)}
          placeholder="e.g., 10,000+ happy customers, Award-winning support..."
          maxItems={10}
        />
      </div>

      {/* Risk Boundaries */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Risk Boundaries
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          Specific scenarios or topics that require extra caution.
        </p>
        <TokenInput
          value={getArray("tier2.risk_boundaries")}
          onChange={(val) => onAnswerChange("tier2.risk_boundaries", val)}
          placeholder="e.g., Never compare to competitor X directly..."
          maxItems={10}
        />
      </div>
    </div>
  );
}

Tier2Form.displayName = "Tier2Form";
