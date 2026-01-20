"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { KTag, KButton, KCard } from "@/components/ui";
import {
  PackageBrief,
  DeliverablesTable,
  ContextDrawer,
} from "@/components/packages";
import type { Variant, Pattern, OpportunityWithEvidence } from "@/lib/mockApi";

interface PackageData {
  id: string;
  title: string;
  thesis: string;
  outlineBeats: string[];
  cta: string;
  format: string;
  quality: {
    band: string;
    score: number;
    issues: string[];
  };
  variants: Variant[];
}

interface BrandVoice {
  summary: string;
  toneTags: string[];
  nevers: string[];
}

interface Guardrails {
  do: string[];
  dont: string[];
}

interface PackageDetailClientProps {
  brandId: string;
  pkg: PackageData;
  opportunity: OpportunityWithEvidence | null;
  guardrails: Guardrails;
  voice: BrandVoice;
  patterns: Pattern[];
}

const bandVariants: Record<string, "muted" | "campaign" | "evergreen"> = {
  good: "evergreen",
  partial: "campaign",
  needs_work: "muted",
};

const bandLabels: Record<string, string> = {
  good: "Ready",
  partial: "In Progress",
  needs_work: "Needs Work",
};

const channelLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export function PackageDetailClient({
  brandId,
  pkg: initialPkg,
  opportunity,
  guardrails,
  voice,
  patterns,
}: PackageDetailClientProps) {
  // Local state for optimistic updates
  const [pkg, setPkg] = useState(initialPkg);
  const [variants, setVariants] = useState(initialPkg.variants);

  // UI state
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [contextDrawerTab, setContextDrawerTab] = useState<"voice" | "guardrails" | "source" | "patterns">("voice");

  // Get unique channels from variants
  const channels = [...new Set(variants.map((v) => v.channel))];

  // Handle brief updates (optimistic)
  const handleBriefUpdate = useCallback((updates: {
    title?: string;
    thesis?: string;
    outlineBeats?: string[];
    cta?: string;
  }) => {
    setPkg((prev) => ({
      ...prev,
      ...updates,
    }));
    console.info("[PackageDetailClient] Brief updated:", updates);
  }, []);

  // Handle variant duplication
  const handleDuplicate = useCallback((variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;

    const channelCount = variants.filter((v) => v.channel === variant.channel).length;
    const newVariant: Variant = {
      ...variant,
      id: `var_new_${Date.now()}`,
      status: "draft",
      notes: `Duplicated from v${channelCount}`,
    };

    setVariants((prev) => [...prev, newVariant]);
    console.info("[PackageDetailClient] Variant duplicated:", newVariant.id);
  }, [variants]);

  // Handle creating variant from pattern
  const handleApplyPattern = useCallback((patternId: string, channel: string) => {
    const pattern = patterns.find((p) => p.id === patternId);
    if (!pattern) return;

    const newVariant: Variant = {
      id: `var_pattern_${Date.now()}`,
      channel: channel as Variant["channel"],
      status: "draft",
      body: `[${pattern.name}]\n\n${pattern.beats.map((b, i) => `${i + 1}. ${b}`).join("\n")}\n\n${pattern.exampleHook}`,
      notes: `Created from "${pattern.name}" pattern`,
      score: 0,
    };

    setVariants((prev) => [...prev, newVariant]);
    setIsContextDrawerOpen(false);
    console.info("[PackageDetailClient] Variant created from pattern:", patternId, "->", newVariant.id);
  }, [patterns]);

  // Handle creating new variant
  const handleCreateVariant = useCallback((channel: string) => {
    const channelCount = variants.filter((v) => v.channel === channel).length;
    const newVariant: Variant = {
      id: `var_new_${Date.now()}`,
      channel: channel as Variant["channel"],
      status: "draft",
      body: `New ${channelLabels[channel] || channel} variant\n\nAdd your content here...`,
      notes: `v${channelCount + 1}`,
      score: 0,
    };

    setVariants((prev) => [...prev, newVariant]);
    console.info("[PackageDetailClient] New variant created:", newVariant.id);
  }, [variants]);

  // Open context drawer with specific tab
  const openContextDrawer = useCallback((tab: "voice" | "guardrails" | "source" | "patterns") => {
    setContextDrawerTab(tab);
    setIsContextDrawerOpen(true);
  }, []);

  // Render single-column layout (default)
  const renderSingleColumn = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Package Brief */}
      <PackageBrief
        title={pkg.title}
        thesis={pkg.thesis}
        outlineBeats={pkg.outlineBeats}
        cta={pkg.cta}
        format={pkg.format}
        quality={pkg.quality}
        guardrails={guardrails}
        opportunity={opportunity}
        brandId={brandId}
        onUpdate={handleBriefUpdate}
      />

      {/* Deliverables */}
      <DeliverablesTable
        variants={variants}
        onDuplicate={handleDuplicate}
        onCreateVariant={handleCreateVariant}
      />

      {/* Collapsed Details section */}
      <KCard className="p-4">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-sm font-medium text-kairo-fg">Details</span>
            <svg
              className="w-4 h-4 text-kairo-fg-muted group-open:rotate-180 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-4 pt-4 border-t border-kairo-border-subtle space-y-4">
            {/* Quality Issues */}
            {pkg.quality.issues.length > 0 && (
              <section>
                <h4 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
                  Quality Issues ({pkg.quality.issues.length})
                </h4>
                <ul className="space-y-1">
                  {pkg.quality.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-kairo-warning-fg">
                      <span className="shrink-0">!</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Format info */}
            <section>
              <h4 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
                Format
              </h4>
              <p className="text-sm text-kairo-fg capitalize">{pkg.format.replace(/_/g, " ")}</p>
            </section>

            {/* Channels */}
            <section>
              <h4 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
                Channels
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {channels.map((ch) => (
                  <span
                    key={ch}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-kairo-bg-elevated text-kairo-fg-subtle border border-kairo-border-subtle"
                  >
                    {channelLabels[ch] || ch}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </details>
      </KCard>
    </div>
  );

  // Render review mode (split view)
  const renderReviewMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      {/* Left: Deliverables focus */}
      <div className="space-y-6">
        <PackageBrief
          title={pkg.title}
          thesis={pkg.thesis}
          outlineBeats={pkg.outlineBeats}
          cta={pkg.cta}
          format={pkg.format}
          quality={pkg.quality}
          brandId={brandId}
          onUpdate={handleBriefUpdate}
        />
        <DeliverablesTable
          variants={variants}
          onDuplicate={handleDuplicate}
          onCreateVariant={handleCreateVariant}
        />
      </div>

      {/* Right: Inline context panel */}
      <aside className="space-y-4">
        {/* Voice */}
        <KCard className="p-4">
          <h3 className="text-sm font-semibold text-kairo-fg mb-3">Voice</h3>
          <p className="text-sm text-kairo-fg-muted leading-relaxed mb-3">{voice.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {voice.toneTags.map((tag, idx) => (
              <KTag key={idx} variant="muted" className="text-[10px]">
                {tag}
              </KTag>
            ))}
          </div>
        </KCard>

        {/* Guardrails */}
        <KCard className="p-4">
          <h3 className="text-sm font-semibold text-kairo-fg mb-3">Guardrails</h3>
          <div className="space-y-3">
            {guardrails.do.length > 0 && (
              <ul className="space-y-1">
                {guardrails.do.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-kairo-fg-muted">
                    <span className="text-kairo-score-high-fg shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {guardrails.dont.length > 0 && (
              <ul className="space-y-1">
                {guardrails.dont.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-kairo-fg-muted">
                    <span className="text-kairo-error-fg shrink-0">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </KCard>

        {/* Source */}
        {opportunity && (
          <KCard className="p-4">
            <h3 className="text-sm font-semibold text-kairo-fg mb-3">Source</h3>
            <div className="flex items-start gap-2">
              <span
                className={[
                  "inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold shrink-0",
                  opportunity.score >= 80
                    ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
                    : opportunity.score >= 70
                    ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
                    : "bg-kairo-score-low-bg text-kairo-score-low-fg",
                ].join(" ")}
              >
                {opportunity.score}
              </span>
              <div>
                <p className="text-sm text-kairo-fg font-medium">{opportunity.title}</p>
                <Link
                  href={`/brands/${brandId}/today`}
                  className="text-xs text-kairo-accent-400 hover:text-kairo-accent-300"
                >
                  View opportunity →
                </Link>
              </div>
            </div>
          </KCard>
        )}

        {/* Patterns quick access */}
        {patterns.length > 0 && (
          <KCard className="p-4">
            <h3 className="text-sm font-semibold text-kairo-fg mb-3">Patterns</h3>
            <div className="space-y-2">
              {patterns.slice(0, 2).map((pattern) => (
                <div
                  key={pattern.id}
                  className="p-2 rounded border border-kairo-border-subtle bg-kairo-bg-elevated/30"
                >
                  <p className="text-xs font-medium text-kairo-fg">{pattern.name}</p>
                  <p className="text-[10px] text-kairo-fg-subtle">{pattern.performanceHint}</p>
                </div>
              ))}
              <button
                onClick={() => openContextDrawer("patterns")}
                className="text-xs text-kairo-accent-400 hover:text-kairo-accent-300"
              >
                View all patterns →
              </button>
            </div>
          </KCard>
        )}
      </aside>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/brands/${brandId}/packages`}
            className="p-1.5 -ml-1.5 rounded-md text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-semibold text-kairo-fg">{pkg.title}</h1>
            <div className="flex items-center gap-2 text-xs text-kairo-fg-muted">
              <span className="capitalize">{pkg.format.replace(/_/g, " ")}</span>
              <span className="text-kairo-border-strong">·</span>
              <span>{variants.length} variant{variants.length !== 1 ? "s" : ""}</span>
              {channels.map((ch) => (
                <span
                  key={ch}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-kairo-bg-elevated text-kairo-fg-subtle border border-kairo-border-subtle"
                >
                  {channelLabels[ch] || ch}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Context button + Review toggle + Quality */}
        <div className="flex items-center gap-2">
          {/* Context button */}
          <KButton
            variant="ghost"
            size="sm"
            onClick={() => openContextDrawer("voice")}
            className="text-xs"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Context
          </KButton>

          {/* Review Mode toggle */}
          <button
            onClick={() => setIsReviewMode(!isReviewMode)}
            className={[
              "hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
              isReviewMode
                ? "bg-kairo-accent-500/10 text-kairo-accent-400"
                : "text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover",
            ].join(" ")}
            title={isReviewMode ? "Exit Review Mode" : "Enter Review Mode"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Review
          </button>

          <KTag variant={bandVariants[pkg.quality.band] || "muted"} className="text-[10px] uppercase">
            {bandLabels[pkg.quality.band] || pkg.quality.band}
          </KTag>
        </div>
      </header>

      {/* Main content - single column or review mode */}
      {isReviewMode ? renderReviewMode() : renderSingleColumn()}

      {/* Context Drawer */}
      <ContextDrawer
        isOpen={isContextDrawerOpen}
        onClose={() => setIsContextDrawerOpen(false)}
        voice={voice}
        guardrails={guardrails}
        patterns={patterns}
        opportunity={opportunity}
        brandId={brandId}
        onApplyPattern={handleApplyPattern}
        initialTab={contextDrawerTab}
      />
    </div>
  );
}

PackageDetailClient.displayName = "PackageDetailClient";
