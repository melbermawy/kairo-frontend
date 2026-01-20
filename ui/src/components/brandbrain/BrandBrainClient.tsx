"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KCard, KButton } from "@/components/ui";
import { api } from "@/lib/api";
import {
  transformBackendSnapshot,
  type BrandCore,
  type BrandBrainSnapshot,
  type BrandBrainOverrides,
  type OverridesPatchRequest,
} from "@/contracts";
import {
  diagnostics,
  registerPoller,
  unregisterPoller,
  setPollerTimeout,
} from "@/lib/debug/diagnostics";
import { BrandBrainSection } from "./BrandBrainSection";
import { FieldEditPanel } from "./FieldEditPanel";
import { CompileStatusBadge } from "./CompileStatusBadge";

// Polling constants
const INITIAL_POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_INTERVAL = 10000; // 10 seconds max
const BACKOFF_MULTIPLIER = 1.5;
const MAX_POLL_DURATION = 300000; // 5 minutes
const MAX_CONSECUTIVE_ERRORS = 3;

interface BrandBrainClientProps {
  brand: BrandCore;
  initialSnapshot: BrandBrainSnapshot | null;
  initialOverrides: BrandBrainOverrides | null;
}

export function BrandBrainClient({
  brand,
  initialSnapshot,
  initialOverrides,
}: BrandBrainClientProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [selectedFieldPath, setSelectedFieldPath] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  // Render tracking for diagnostics
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  diagnostics.trackRender("BrandBrainClient");
  diagnostics.maybePrintSummary();

  // Refs for compile polling control
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const compileRunIdRef = useRef<string | null>(null);
  const pollerAbortRef = useRef<AbortController | null>(null);

  // Cleanup polling on unmount - with single-flight guard
  useEffect(() => {
    return () => {
      isPollingRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      // Unregister poller if exists
      if (compileRunIdRef.current) {
        unregisterPoller(brand.id, compileRunIdRef.current);
      }
      pollerAbortRef.current?.abort();
    };
  }, [brand.id]);

  // Kill-switch: disable entire client
  if (diagnostics.killSwitches.disableBrandBrainClient) {
    return (
      <div className="p-8 text-center">
        <p className="text-kairo-fg-muted">
          [DIAG] BrandBrainClient disabled via DIAG_DISABLE_BRANDBRAIN_CLIENT
        </p>
      </div>
    );
  }

  // Calculate freshness
  const compiledAt = snapshot?.meta.compiled_at
    ? new Date(snapshot.meta.compiled_at)
    : null;
  const isStale = compiledAt
    ? Date.now() - compiledAt.getTime() > 24 * 60 * 60 * 1000 // 24 hours
    : true;

  // Refresh data after successful compile
  const refreshData = useCallback(async () => {
    try {
      const [backendSnapshot, newOverrides] = await Promise.all([
        api.getLatestSnapshot(brand.id),
        api.getOverrides(brand.id),
      ]);
      const transformed = transformBackendSnapshot(backendSnapshot);
      if (transformed) setSnapshot(transformed);
      setOverrides(newOverrides);
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  }, [brand.id]);

  // Handle compile trigger with non-blocking polling and single-flight guard
  const handleCompile = useCallback(async () => {
    // Kill-switch: disable polling
    if (diagnostics.killSwitches.disablePolling) {
      setCompileError("[DIAG] Polling disabled via DIAG_DISABLE_POLLING");
      return;
    }

    setIsCompiling(true);
    setCompileError(null);

    // Stop any existing poll and unregister
    isPollingRef.current = false;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    if (compileRunIdRef.current) {
      unregisterPoller(brand.id, compileRunIdRef.current);
    }
    pollerAbortRef.current?.abort();

    try {
      const result = await api.triggerCompile(brand.id);

      // Handle "UNCHANGED" short-circuit
      if (result.status === "UNCHANGED") {
        await refreshData();
        setIsCompiling(false);
        return;
      }

      // Single-flight guard: register poller
      const abortController = registerPoller(brand.id, result.compile_run_id);
      if (!abortController) {
        // Poller already exists - skip
        console.warn("[DIAG] Duplicate poller blocked");
        setIsCompiling(false);
        return;
      }

      // Start non-blocking polling
      compileRunIdRef.current = result.compile_run_id;
      pollerAbortRef.current = abortController;
      isPollingRef.current = true;
      let currentInterval = INITIAL_POLL_INTERVAL;
      let consecutiveErrors = 0;
      const startTime = Date.now();

      const poll = async () => {
        if (!isPollingRef.current || !compileRunIdRef.current) {
          setIsCompiling(false);
          unregisterPoller(brand.id, compileRunIdRef.current || "");
          return;
        }

        // Check if aborted
        if (pollerAbortRef.current?.signal.aborted) {
          setIsCompiling(false);
          return;
        }

        try {
          const status = await api.getCompileStatus(brand.id, compileRunIdRef.current);
          consecutiveErrors = 0;

          if (status.status === "SUCCEEDED") {
            isPollingRef.current = false;
            unregisterPoller(brand.id, compileRunIdRef.current);
            await refreshData();
            setIsCompiling(false);
            return;
          }

          if (status.status === "FAILED") {
            isPollingRef.current = false;
            unregisterPoller(brand.id, compileRunIdRef.current);
            setCompileError(status.error || "Compile failed");
            setIsCompiling(false);
            return;
          }

          // Check timeout
          if (Date.now() - startTime > MAX_POLL_DURATION) {
            isPollingRef.current = false;
            unregisterPoller(brand.id, compileRunIdRef.current);
            setCompileError("Compile timed out after 5 minutes");
            setIsCompiling(false);
            return;
          }

          // Schedule next poll with backoff
          if (isPollingRef.current) {
            currentInterval = Math.min(currentInterval * BACKOFF_MULTIPLIER, MAX_POLL_INTERVAL);
            const timeoutId = setTimeout(poll, currentInterval);
            pollTimeoutRef.current = timeoutId;
            setPollerTimeout(brand.id, compileRunIdRef.current, timeoutId);
          }
        } catch (err) {
          console.error("Failed to poll compile status:", err);
          consecutiveErrors++;

          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            isPollingRef.current = false;
            unregisterPoller(brand.id, compileRunIdRef.current || "");
            setCompileError("Failed to check compile status");
            setIsCompiling(false);
            return;
          }

          // Retry with backoff
          if (isPollingRef.current) {
            currentInterval = Math.min(currentInterval * BACKOFF_MULTIPLIER, MAX_POLL_INTERVAL);
            const timeoutId = setTimeout(poll, currentInterval);
            pollTimeoutRef.current = timeoutId;
            if (compileRunIdRef.current) {
              setPollerTimeout(brand.id, compileRunIdRef.current, timeoutId);
            }
          }
        }
      };

      // Start first poll
      const timeoutId = setTimeout(poll, INITIAL_POLL_INTERVAL);
      pollTimeoutRef.current = timeoutId;
      setPollerTimeout(brand.id, result.compile_run_id, timeoutId);
    } catch (err) {
      console.error("Failed to trigger compile:", err);
      setCompileError("Failed to start compile");
      setIsCompiling(false);
    }
  }, [brand.id, refreshData]);

  // Handle override save
  // Backend semantics: overrides_json merges, pinned_paths replaces entire list
  // OPTIMIZATION: Don't refetch snapshot after override - the UI applies overrides client-side
  const handleSaveOverride = useCallback(
    async (path: string, value: unknown, pin: boolean) => {
      setIsSaving(true);
      try {
        // Build the new pinned_paths list
        const currentPinned = overrides?.pinned_paths ?? [];
        let newPinnedPaths: string[];

        if (pin && !currentPinned.includes(path)) {
          newPinnedPaths = [...currentPinned, path];
        } else if (!pin && currentPinned.includes(path)) {
          newPinnedPaths = currentPinned.filter((p) => p !== path);
        } else {
          newPinnedPaths = currentPinned;
        }

        const patch: OverridesPatchRequest = {
          overrides_json: { [path]: value },
          pinned_paths: newPinnedPaths,
        };

        const newOverrides = await api.patchOverrides(brand.id, patch);
        setOverrides(newOverrides);

        // NOTE: Removed getLatestSnapshot call here - saves ~200-500ms per override save
        // The snapshot data doesn't change when saving overrides; overrides are stored
        // separately and applied at render time via the overrides_json object.
        setSelectedFieldPath(null);
      } catch (err) {
        console.error("Failed to save override:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [brand.id, overrides]
  );

  // Handle removing override
  // Backend semantics: null value in overrides_json deletes the key
  const handleRemoveOverride = useCallback(
    async (path: string) => {
      setIsSaving(true);
      try {
        // Remove from pinned_paths as well
        const currentPinned = overrides?.pinned_paths ?? [];
        const newPinnedPaths = currentPinned.filter((p) => p !== path);

        const patch: OverridesPatchRequest = {
          overrides_json: { [path]: null }, // null deletes the override
          pinned_paths: newPinnedPaths,
        };

        const newOverrides = await api.patchOverrides(brand.id, patch);
        setOverrides(newOverrides);

        // NOTE: Removed getLatestSnapshot call here - saves ~200-500ms per override remove
        setSelectedFieldPath(null);
      } catch (err) {
        console.error("Failed to remove override:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [brand.id, overrides]
  );

  // No snapshot yet - show empty state
  if (!snapshot) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-kairo-fg">Brand Playbook</h1>
          <p className="text-[13px] text-kairo-fg-muted mt-1">
            Your brand&apos;s AI-powered strategy document
          </p>
        </header>

        <KCard className="p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-kairo-accent-500/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-kairo-accent-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-[16px] font-semibold text-kairo-fg">
              No BrandBrain yet
            </h2>
            <p className="text-[13px] text-kairo-fg-muted">
              Complete onboarding and compile your brand to generate your BrandBrain.
            </p>
            <Link href={`/brands/${brand.id}/onboarding`}>
              <KButton>Start Onboarding</KButton>
            </Link>
          </div>
        </KCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-kairo-fg">Brand Playbook</h1>
          <p className="text-[13px] text-kairo-fg-muted mt-1">
            Your brand&apos;s AI-powered strategy document for {brand.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CompileStatusBadge
            compiledAt={compiledAt}
            isStale={isStale}
          />
          <Link href={`/brands/${brand.id}/onboarding`}>
            <KButton variant="secondary">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Onboarding
            </KButton>
          </Link>
          <KButton
            variant="secondary"
            onClick={handleCompile}
            disabled={isCompiling}
          >
            {isCompiling ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Compiling...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Recompile
              </>
            )}
          </KButton>
        </div>
      </header>

      {/* Main content with edit panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Sections */}
        <div className="space-y-6">
          {/* Kill-switch: disable snapshot rendering */}
          {diagnostics.killSwitches.disableSnapshotRender ? (
            <KCard className="p-5">
              <p className="text-kairo-fg-muted">
                [DIAG] Snapshot rendering disabled via DIAG_DISABLE_SNAPSHOT_RENDER
              </p>
              <p className="text-[12px] text-kairo-fg-subtle mt-2">
                Snapshot exists with {snapshot.pillars.length} pillars, compiled at {compiledAt?.toLocaleString()}
              </p>
            </KCard>
          ) : (
          <>
          {/* Positioning */}
          <BrandBrainSection
            title="Positioning"
            fields={[
              { path: "positioning.what_we_do", label: "What we do", node: snapshot.positioning.what_we_do },
              { path: "positioning.who_for", label: "Who we serve", node: snapshot.positioning.who_for },
              { path: "positioning.differentiators", label: "Differentiators", node: snapshot.positioning.differentiators },
              { path: "positioning.proof_types", label: "Proof types", node: snapshot.positioning.proof_types },
            ]}
            overrides={overrides}
            selectedPath={selectedFieldPath}
            onFieldClick={setSelectedFieldPath}
          />

          {/* Voice */}
          <BrandBrainSection
            title="Voice"
            fields={[
              { path: "voice.tone_tags", label: "Tone tags", node: snapshot.voice.tone_tags },
              { path: "voice.do", label: "Do", node: snapshot.voice.do },
              { path: "voice.dont", label: "Don't", node: snapshot.voice.dont },
              { path: "voice.cta_policy", label: "CTA policy", node: snapshot.voice.cta_policy },
              { path: "voice.emoji_policy", label: "Emoji policy", node: snapshot.voice.emoji_policy },
            ]}
            overrides={overrides}
            selectedPath={selectedFieldPath}
            onFieldClick={setSelectedFieldPath}
          />

          {/* Pillars */}
          <KCard className="p-5">
            <h3 className="text-[14px] font-semibold text-kairo-fg mb-4">
              Content Pillars
            </h3>
            <div className="space-y-4">
              {snapshot.pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-kairo-bg-elevated border border-kairo-border-subtle"
                >
                  <button
                    onClick={() => setSelectedFieldPath(`pillars.${index}.name`)}
                    className="text-[13px] font-medium text-kairo-fg hover:text-kairo-accent-400 transition-colors"
                  >
                    {pillar.name.override_value ?? pillar.name.value}
                  </button>
                  <p className="text-[12px] text-kairo-fg-muted mt-1">
                    {pillar.description.override_value ?? pillar.description.value}
                  </p>
                  {pillar.themes.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(pillar.themes.override_value ?? pillar.themes.value).map((theme, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-kairo-bg-card text-[10px] text-kairo-fg-muted"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </KCard>

          {/* Constraints */}
          <BrandBrainSection
            title="Constraints"
            fields={[
              { path: "constraints.taboos", label: "Taboos", node: snapshot.constraints.taboos },
              { path: "constraints.risk_boundaries", label: "Risk boundaries", node: snapshot.constraints.risk_boundaries },
            ]}
            overrides={overrides}
            selectedPath={selectedFieldPath}
            onFieldClick={setSelectedFieldPath}
          />

          {/* Platform Profiles */}
          {snapshot.platform_profiles.length > 0 && (
            <KCard className="p-5">
              <h3 className="text-[14px] font-semibold text-kairo-fg mb-4">
                Platform Profiles
              </h3>
              <div className="space-y-3">
                {snapshot.platform_profiles.map((profile, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-kairo-bg-elevated border border-kairo-border-subtle"
                  >
                    <span className="text-[12px] font-medium text-kairo-fg capitalize">
                      {profile.platform}
                    </span>
                    {profile.tone_adjustment && (
                      <p className="text-[11px] text-kairo-fg-muted mt-1">
                        {profile.tone_adjustment.override_value ?? profile.tone_adjustment.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </KCard>
          )}

          {/* Meta (read-only) */}
          <KCard className="p-5">
            <h3 className="text-[14px] font-semibold text-kairo-fg mb-4">
              Meta
            </h3>
            <div className="space-y-2 text-[12px] text-kairo-fg-muted">
              <p>
                <span className="text-kairo-fg-subtle">Compiled:</span>{" "}
                {compiledAt?.toLocaleString()}
              </p>
              <p>
                <span className="text-kairo-fg-subtle">Evidence analyzed:</span>{" "}
                {snapshot.meta.evidence_summary.total_count} items
              </p>
              {snapshot.meta.missing_inputs.length > 0 && (
                <p className="text-kairo-warning-fg">
                  Missing inputs: {snapshot.meta.missing_inputs.join(", ")}
                </p>
              )}
            </div>
          </KCard>
          </>
          )}
        </div>

        {/* Right: Edit Panel */}
        <aside className="lg:sticky lg:top-20 h-fit">
          {selectedFieldPath ? (
            <FieldEditPanel
              path={selectedFieldPath}
              snapshot={snapshot}
              overrides={overrides}
              isSaving={isSaving}
              onSave={handleSaveOverride}
              onRemoveOverride={handleRemoveOverride}
              onClose={() => setSelectedFieldPath(null)}
            />
          ) : (
            <KCard className="p-5">
              <div className="text-center py-8">
                <p className="text-[13px] text-kairo-fg-muted">
                  Click any field to view sources and edit overrides.
                </p>
              </div>
            </KCard>
          )}
        </aside>
      </div>
    </div>
  );
}

BrandBrainClient.displayName = "BrandBrainClient";
