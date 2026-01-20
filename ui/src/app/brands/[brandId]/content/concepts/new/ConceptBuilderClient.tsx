"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KButton, KCard, KTag } from "@/components/ui";
import type { Brand, OpportunityWithEvidence, PackageChannel } from "@/lib/mockApi";
import type { BrandBrainSnapshot } from "@/contracts";

interface ConceptBuilderClientProps {
  brand: Brand;
  opportunity: OpportunityWithEvidence | null;
  snapshot: BrandBrainSnapshot | null;
}

const CHANNEL_OPTIONS: { id: PackageChannel; label: string }[] = [
  { id: "x", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

export function ConceptBuilderClient({
  brand,
  opportunity,
  snapshot,
}: ConceptBuilderClientProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Initialize form with opportunity data if available
  const [oneLiner, setOneLiner] = useState(opportunity?.hook || "");
  const [coreArgument, setCoreArgument] = useState(
    opportunity?.why_now_summary || opportunity?.why_now.join(" ") || ""
  );
  const [beats, setBeats] = useState<string[]>(
    opportunity?.why_now.slice(0, 3) || [""]
  );
  const [proofPoints, setProofPoints] = useState<string[]>(
    opportunity?.brand_fit ? [opportunity.brand_fit.voice_reason] : [""]
  );
  const [selectedChannels, setSelectedChannels] = useState<PackageChannel[]>(
    (opportunity?.platforms?.filter((p): p is PackageChannel =>
      ["x", "linkedin", "instagram", "tiktok"].includes(p)
    ) || ["x"]) as PackageChannel[]
  );

  // Beat management
  const addBeat = useCallback(() => {
    setBeats((prev) => [...prev, ""]);
  }, []);

  const removeBeat = useCallback((index: number) => {
    setBeats((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateBeat = useCallback((index: number, value: string) => {
    setBeats((prev) => prev.map((b, i) => (i === index ? value : b)));
  }, []);

  // Proof point management
  const addProofPoint = useCallback(() => {
    setProofPoints((prev) => [...prev, ""]);
  }, []);

  const removeProofPoint = useCallback((index: number) => {
    setProofPoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateProofPoint = useCallback((index: number, value: string) => {
    setProofPoints((prev) => prev.map((p, i) => (i === index ? value : p)));
  }, []);

  // Channel toggle
  const toggleChannel = useCallback((channel: PackageChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  }, []);

  // Create package from concept
  // Navigate to package detail page with concept data in URL params.
  // The server component will create the package on-the-fly.
  const handleCreatePackage = useCallback(() => {
    if (isCreating || selectedChannels.length === 0) return;
    setIsCreating(true);

    // Build URL with concept data as query params
    const params = new URLSearchParams();
    params.set("one_liner", oneLiner);
    params.set("core_argument", coreArgument);
    params.set("beats", beats.filter((b) => b.trim()).join("|"));
    params.set("proof_points", proofPoints.filter((p) => p.trim()).join("|"));
    params.set("channels", selectedChannels.join(","));
    if (opportunity?.id) {
      params.set("opportunityId", opportunity.id);
    }

    // Navigate to the package detail page with "new-from-concept" as the packageId
    // The server component will create the package using the query params
    router.push(`/brands/${brand.id}/packages/new-from-concept?${params.toString()}`);
  }, [
    isCreating,
    brand.id,
    oneLiner,
    coreArgument,
    beats,
    proofPoints,
    selectedChannels,
    opportunity?.id,
    router,
  ]);

  // Extract guardrails from snapshot
  const toneTags = snapshot?.voice.tone_tags.override_value ?? snapshot?.voice.tone_tags.value ?? [];
  const taboos = snapshot?.constraints.taboos.override_value ?? snapshot?.constraints.taboos.value ?? [];
  const riskBoundaries = snapshot?.constraints.risk_boundaries?.override_value ?? snapshot?.constraints.risk_boundaries?.value ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-kairo-fg">
            Concept Builder
          </h1>
          <p className="text-[13px] text-kairo-fg-muted mt-1">
            Build a content concept for {brand.name}
          </p>
        </div>
        <Link href={`/brands/${brand.id}/today`}>
          <KButton variant="ghost" size="sm">
            ← Back to Today
          </KButton>
        </Link>
      </header>

      {/* Three column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
        {/* Left: Opportunity Context */}
        <aside className="space-y-4">
          {opportunity ? (
            <KCard className="p-4">
              <h3 className="text-[12px] font-medium text-kairo-fg-subtle uppercase tracking-wide mb-3">
                Opportunity Context
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-kairo-fg-subtle block mb-1">
                    Title
                  </span>
                  <p className="text-[13px] text-kairo-fg font-medium">
                    {opportunity.title}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-kairo-fg-subtle block mb-1">
                    Score
                  </span>
                  <span
                    className={`
                      inline-flex items-center justify-center w-10 h-6 rounded-full text-[12px] font-semibold
                      ${
                        opportunity.score >= 80
                          ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
                          : opportunity.score >= 70
                          ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
                          : "bg-kairo-score-low-bg text-kairo-score-low-fg"
                      }
                    `}
                  >
                    {opportunity.score}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-kairo-fg-subtle block mb-1">
                    Why Now
                  </span>
                  <ul className="space-y-1">
                    {opportunity.why_now.map((reason, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-kairo-fg-muted flex items-start gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-kairo-accent-400 mt-1.5 shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] text-kairo-fg-subtle block mb-1">
                    Brand Fit
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <KTag variant="default" className="text-[10px]">
                      {opportunity.brand_fit.pillar}
                    </KTag>
                    <span className="text-[11px] text-kairo-fg-subtle">for</span>
                    <span className="text-[11px] text-kairo-fg">
                      {opportunity.brand_fit.persona}
                    </span>
                  </div>
                </div>

                {opportunity.trend_kernel && (
                  <div>
                    <span className="text-[11px] text-kairo-fg-subtle block mb-1">
                      Trend Signal
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-kairo-bg-elevated text-[11px] text-kairo-fg">
                      {opportunity.trend_kernel.value}
                    </span>
                  </div>
                )}
              </div>
            </KCard>
          ) : (
            <KCard className="p-4">
              <h3 className="text-[12px] font-medium text-kairo-fg-subtle uppercase tracking-wide mb-3">
                No Opportunity Selected
              </h3>
              <p className="text-[12px] text-kairo-fg-muted">
                Creating a concept from scratch. You can also start from an
                opportunity on the Today page.
              </p>
            </KCard>
          )}
        </aside>

        {/* Center: Concept Editor */}
        <main className="space-y-5">
          <KCard className="p-5 space-y-5">
            {/* One-liner */}
            <div>
              <label className="block text-[12px] font-medium text-kairo-fg mb-1.5">
                One-liner
              </label>
              <input
                type="text"
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
                placeholder="The hook that grabs attention..."
                className="
                  w-full px-3 py-2 rounded-lg
                  bg-kairo-bg-elevated border border-kairo-border-subtle
                  text-[13px] text-kairo-fg placeholder:text-kairo-fg-subtle
                  focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent
                "
              />
            </div>

            {/* Core argument */}
            <div>
              <label className="block text-[12px] font-medium text-kairo-fg mb-1.5">
                Core Argument
              </label>
              <textarea
                value={coreArgument}
                onChange={(e) => setCoreArgument(e.target.value)}
                placeholder="The main message or thesis..."
                rows={3}
                className="
                  w-full px-3 py-2 rounded-lg resize-none
                  bg-kairo-bg-elevated border border-kairo-border-subtle
                  text-[13px] text-kairo-fg placeholder:text-kairo-fg-subtle
                  focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent
                "
              />
            </div>

            {/* Beats */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium text-kairo-fg">
                  Beats
                </label>
                <button
                  onClick={addBeat}
                  className="text-[11px] text-kairo-accent-400 hover:text-kairo-accent-300"
                >
                  + Add beat
                </button>
              </div>
              <div className="space-y-2">
                {beats.map((beat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-[11px] text-kairo-fg-subtle w-4">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={beat}
                      onChange={(e) => updateBeat(index, e.target.value)}
                      placeholder={`Beat ${index + 1}...`}
                      className="
                        flex-1 px-3 py-1.5 rounded-lg
                        bg-kairo-bg-elevated border border-kairo-border-subtle
                        text-[12px] text-kairo-fg placeholder:text-kairo-fg-subtle
                        focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent
                      "
                    />
                    {beats.length > 1 && (
                      <button
                        onClick={() => removeBeat(index)}
                        className="p-1 text-kairo-fg-subtle hover:text-kairo-error-fg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Proof Points */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium text-kairo-fg">
                  Proof Points
                </label>
                <button
                  onClick={addProofPoint}
                  className="text-[11px] text-kairo-accent-400 hover:text-kairo-accent-300"
                >
                  + Add proof
                </button>
              </div>
              <div className="space-y-2">
                {proofPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updateProofPoint(index, e.target.value)}
                      placeholder="Supporting evidence or fact..."
                      className="
                        flex-1 px-3 py-1.5 rounded-lg
                        bg-kairo-bg-elevated border border-kairo-border-subtle
                        text-[12px] text-kairo-fg placeholder:text-kairo-fg-subtle
                        focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent
                      "
                    />
                    {proofPoints.length > 1 && (
                      <button
                        onClick={() => removeProofPoint(index)}
                        className="p-1 text-kairo-fg-subtle hover:text-kairo-error-fg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Channels */}
            <div>
              <label className="block text-[12px] font-medium text-kairo-fg mb-2">
                Target Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map((channel) => {
                  const isSelected = selectedChannels.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      onClick={() => toggleChannel(channel.id)}
                      className={`
                        px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors
                        ${
                          isSelected
                            ? "bg-kairo-accent-500 text-white"
                            : "bg-kairo-bg-elevated text-kairo-fg-muted border border-kairo-border-subtle hover:border-kairo-accent-400"
                        }
                      `}
                    >
                      {channel.label}
                    </button>
                  );
                })}
              </div>
              {selectedChannels.length === 0 && (
                <p className="text-[11px] text-kairo-warning-fg mt-1">
                  Select at least one channel
                </p>
              )}
            </div>
          </KCard>

          {/* Create Package CTA */}
          <KButton
            onClick={handleCreatePackage}
            disabled={isCreating || selectedChannels.length === 0}
            className="w-full justify-center"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Package...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Package
              </>
            )}
          </KButton>
        </main>

        {/* Right: BrandBrain Guardrails */}
        <aside className="space-y-4">
          <KCard className="p-4">
            <h3 className="text-[12px] font-medium text-kairo-fg-subtle uppercase tracking-wide mb-3">
              Brand Guardrails
            </h3>

            {snapshot ? (
              <div className="space-y-4">
                {/* Tone Tags */}
                {toneTags.length > 0 && (
                  <div>
                    <span className="text-[11px] text-kairo-fg-subtle block mb-1.5">
                      Tone
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {toneTags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-kairo-accent-500/10 text-[10px] text-kairo-accent-400 border border-kairo-accent-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Taboos */}
                {taboos.length > 0 && (
                  <div>
                    <span className="text-[11px] text-kairo-fg-subtle block mb-1.5">
                      Taboos
                    </span>
                    <ul className="space-y-1">
                      {taboos.map((taboo, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-kairo-error-fg flex items-start gap-1.5"
                        >
                          <span className="shrink-0">✕</span>
                          {taboo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Boundaries */}
                {riskBoundaries.length > 0 && (
                  <div>
                    <span className="text-[11px] text-kairo-fg-subtle block mb-1.5">
                      Risk Boundaries
                    </span>
                    <ul className="space-y-1">
                      {riskBoundaries.map((boundary, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-kairo-warning-fg flex items-start gap-1.5"
                        >
                          <span className="shrink-0">⚠</span>
                          {boundary}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[12px] text-kairo-fg-muted">
                <p className="mb-2">No Brand Playbook compiled yet.</p>
                <Link
                  href={`/brands/${brand.id}/onboarding`}
                  className="text-kairo-accent-400 hover:underline"
                >
                  Complete onboarding →
                </Link>
              </div>
            )}
          </KCard>

          {/* Brand Voice Traits */}
          {brand.voice_traits.length > 0 && (
            <KCard className="p-4">
              <h3 className="text-[12px] font-medium text-kairo-fg-subtle uppercase tracking-wide mb-2">
                Voice Traits
              </h3>
              <div className="flex flex-wrap gap-1">
                {brand.voice_traits.map((trait, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-kairo-bg-elevated text-[10px] text-kairo-fg-muted"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </KCard>
          )}
        </aside>
      </div>
    </div>
  );
}

ConceptBuilderClient.displayName = "ConceptBuilderClient";
