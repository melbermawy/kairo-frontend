"use client";

import { TokenInput } from "./TokenInput";

interface Tier1FormProps {
  answers: Record<string, unknown>;
  onAnswerChange: (key: string, value: unknown) => void;
}

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
];

export function Tier1Form({ answers, onAnswerChange }: Tier1FormProps) {
  const getArray = (key: string): string[] => (answers[key] as string[]) || [];
  const getString = (key: string): string => (answers[key] as string) || "";

  const priorityPlatforms = getArray("tier1.priority_platforms");

  const togglePlatform = (platform: string) => {
    if (priorityPlatforms.includes(platform)) {
      onAnswerChange(
        "tier1.priority_platforms",
        priorityPlatforms.filter((p) => p !== platform)
      );
    } else {
      onAnswerChange("tier1.priority_platforms", [...priorityPlatforms, platform]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[16px] font-semibold text-kairo-fg mb-1">
          Recommended Details
        </h2>
        <p className="text-[13px] text-kairo-fg-muted">
          These help Kairo generate more targeted content recommendations.
        </p>
      </div>

      {/* Priority Platforms */}
      <div className="space-y-3">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Priority Platforms
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          Which platforms matter most for your brand?
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((platform) => {
            const isSelected = priorityPlatforms.includes(platform.value);
            return (
              <button
                key={platform.value}
                type="button"
                onClick={() => togglePlatform(platform.value)}
                className={`
                  px-4 py-2 rounded-lg text-[13px] font-medium transition-all
                  border
                  ${
                    isSelected
                      ? "bg-kairo-accent-500/10 border-kairo-accent-500 text-kairo-fg"
                      : "bg-kairo-bg-elevated border-kairo-border-subtle text-kairo-fg-muted hover:border-kairo-border-strong"
                  }
                `}
              >
                {platform.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Pillars Seed */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Content Pillars (Seed)
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          What are the main themes or topics your content focuses on?
        </p>
        <TokenInput
          value={getArray("tier1.pillars_seed")}
          onChange={(val) => onAnswerChange("tier1.pillars_seed", val)}
          placeholder="e.g., Product quality, Industry news, Team culture..."
          maxItems={7}
        />
      </div>

      {/* Good Examples */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Good Content Examples
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          URLs to posts or content that represent your brand well.
        </p>
        <TokenInput
          value={getArray("tier1.good_examples")}
          onChange={(val) => onAnswerChange("tier1.good_examples", val)}
          placeholder="Paste a URL and press Enter..."
          maxItems={10}
        />
      </div>

      {/* Key Pages */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-kairo-fg">
          Key Website Pages
        </label>
        <p className="text-[11px] text-kairo-fg-subtle">
          Important pages Kairo should understand (About, Pricing, Case studies).
          <br />
          <span className="text-kairo-accent-400">
            Note: Up to 2 pages will be crawled during compile.
          </span>
        </p>
        <TokenInput
          value={getArray("tier1.key_pages")}
          onChange={(val) => onAnswerChange("tier1.key_pages", val)}
          placeholder="https://yoursite.com/about"
          maxItems={5}
        />
      </div>
    </div>
  );
}

Tier1Form.displayName = "Tier1Form";
