"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { KButton, KCard } from "@/components/ui";
import { api } from "@/lib/api";
import { env } from "@/lib/env";
import type { CompileStatus } from "@/contracts";

interface CompilePanelProps {
  brandId: string;
  canCompile: boolean;
  isBasicsComplete: boolean;
  hasEnabledSources: boolean;
  onCompileSuccess: () => void;
}

// Stage labels for backend stage strings (flexible mapping)
const STAGE_LABELS: Record<string, string> = {
  // Backend stage names (lowercase)
  queued: "Waiting in queue",
  evidence_gathering: "Gathering evidence",
  normalizing: "Normalizing data",
  bundling: "Bundling content",
  llm_processing: "Analyzing with AI",
  qa_check: "Quality checks",
  merging: "Merging results",
  done: "Complete",
  // Legacy uppercase names for compatibility
  QUEUED: "Waiting in queue",
  PENDING: "Starting...",
  ENSURE_EVIDENCE: "Gathering evidence",
  NORMALIZE: "Normalizing data",
  BUNDLE: "Bundling content",
  LLM: "Analyzing with AI",
  QA: "Quality checks",
  MERGE: "Merging results",
  DONE: "Complete",
};

// Helper to compute percent from sources_completed/sources_total
function computeProgress(status: CompileStatus | null): number {
  if (!status?.progress) return 0;
  const { sources_completed, sources_total } = status.progress;
  if (sources_total === 0) return 0;
  return Math.round((sources_completed / sources_total) * 100);
}

// Helper to get stage label
function getStageLabel(status: CompileStatus | null): string {
  if (!status) return "Starting...";
  if (status.status === "SUCCEEDED") return "Complete!";
  const stage = status.progress?.stage || "queued";
  return STAGE_LABELS[stage] || `Processing: ${stage}`;
}

// Polling intervals in ms - exponential backoff
const INITIAL_POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_INTERVAL = 10000; // 10 seconds max
const BACKOFF_MULTIPLIER = 1.5; // exponential backoff factor
const MAX_POLL_DURATION = 300000; // 5 minutes total timeout
const MAX_CONSECUTIVE_ERRORS = 3; // stop after 3 consecutive errors

export function CompilePanel({
  brandId,
  canCompile,
  isBasicsComplete,
  hasEnabledSources,
  onCompileSuccess,
}: CompilePanelProps) {
  const [compileRunId, setCompileRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<CompileStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for polling control
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const currentIntervalRef = useRef<number>(INITIAL_POLL_INTERVAL);
  const consecutiveErrorsRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(false);

  // Stop polling helper
  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Poll for compile status with exponential backoff
  const pollStatus = useCallback(async () => {
    if (!compileRunId || !isPollingRef.current) return;

    try {
      const newStatus = await api.getCompileStatus(brandId, compileRunId);
      setStatus(newStatus);
      consecutiveErrorsRef.current = 0; // Reset error count on success

      // Check for terminal states
      if (newStatus.status === "SUCCEEDED") {
        stopPolling();
        onCompileSuccess();
        return;
      }

      if (newStatus.status === "FAILED") {
        stopPolling();
        setError(newStatus.error || "Compile failed");
        return;
      }

      // Check total timeout
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed > MAX_POLL_DURATION) {
          stopPolling();
          setError("Compile timed out after 5 minutes. Please try again.");
          return;
        }
      }

      // Schedule next poll with exponential backoff
      if (isPollingRef.current) {
        currentIntervalRef.current = Math.min(
          currentIntervalRef.current * BACKOFF_MULTIPLIER,
          MAX_POLL_INTERVAL
        );
        pollTimeoutRef.current = setTimeout(pollStatus, currentIntervalRef.current);
      }
    } catch (err) {
      console.error("Failed to poll compile status:", err);
      consecutiveErrorsRef.current += 1;

      // Stop polling after too many consecutive errors
      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
        stopPolling();
        setError("Failed to check compile status. Please refresh and try again.");
        return;
      }

      // Retry with backoff even on error
      if (isPollingRef.current) {
        currentIntervalRef.current = Math.min(
          currentIntervalRef.current * BACKOFF_MULTIPLIER,
          MAX_POLL_INTERVAL
        );
        pollTimeoutRef.current = setTimeout(pollStatus, currentIntervalRef.current);
      }
    }
  }, [brandId, compileRunId, onCompileSuccess, stopPolling]);

  // Start compile
  const handleStartCompile = useCallback(
    async (forceRefresh = false) => {
      setIsStarting(true);
      setError(null);
      stopPolling(); // Ensure no existing poll is running

      try {
        const result = await api.triggerCompile(brandId, forceRefresh);

        // Handle "UNCHANGED" short-circuit - backend returns existing snapshot
        if (result.status === "UNCHANGED") {
          // Snapshot already exists and is up-to-date
          onCompileSuccess();
          return;
        }

        setCompileRunId(result.compile_run_id);
        startTimeRef.current = Date.now();
        currentIntervalRef.current = INITIAL_POLL_INTERVAL;
        consecutiveErrorsRef.current = 0;
        isPollingRef.current = true;

        // Start polling with initial delay
        pollTimeoutRef.current = setTimeout(pollStatus, INITIAL_POLL_INTERVAL);
      } catch (err) {
        console.error("Failed to start compile:", err);
        setError("Failed to start compile. Please try again.");
      } finally {
        setIsStarting(false);
      }
    },
    [brandId, pollStatus, onCompileSuccess, stopPolling]
  );

  // Retry compile
  const handleRetry = useCallback(() => {
    setCompileRunId(null);
    setStatus(null);
    setError(null);
    handleStartCompile(false);
  }, [handleStartCompile]);

  // Is compiling? (PENDING or RUNNING are the in-progress states)
  const isCompiling =
    status?.status === "PENDING" || status?.status === "RUNNING";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-kairo-fg mb-1">
          Compile BrandBrain
        </h2>
        <p className="text-[13px] text-kairo-fg-muted">
          Process your brand information and sources to generate your BrandBrain.
        </p>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2">
        <p className="text-[12px] font-medium text-kairo-fg-muted uppercase tracking-wide">
          Requirements
        </p>
        <div className="space-y-1.5">
          <RequirementRow
            label="Basics complete"
            met={isBasicsComplete}
          />
          <RequirementRow
            label="At least one enabled source"
            met={hasEnabledSources}
          />
        </div>
      </div>

      {/* Compile status */}
      {(isCompiling || status?.status === "SUCCEEDED") && (
        <KCard className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-kairo-fg">
                {getStageLabel(status)}
              </span>
              <span className="text-[12px] text-kairo-fg-muted">
                {status?.status === "SUCCEEDED" ? "100" : computeProgress(status)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-kairo-bg-elevated rounded-full overflow-hidden">
              <div
                className={`
                  h-full rounded-full transition-all duration-300
                  ${
                    status?.status === "SUCCEEDED"
                      ? "bg-kairo-success-fg"
                      : "bg-kairo-accent-500"
                  }
                `}
                style={{ width: `${status?.status === "SUCCEEDED" ? 100 : computeProgress(status)}%` }}
              />
            </div>

            {isCompiling && (
              <p className="text-[11px] text-kairo-fg-subtle">
                This may take a few minutes...
              </p>
            )}
          </div>
        </KCard>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-kairo-error-bg border border-kairo-error-fg/20">
          <p className="text-[13px] text-kairo-error-fg">{error}</p>
          <KButton
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={handleRetry}
          >
            Retry Compile
          </KButton>
        </div>
      )}

      {/* Compile buttons */}
      {!isCompiling && !status?.status && (
        <div className="space-y-3">
          <KButton
            onClick={() => handleStartCompile(false)}
            disabled={!canCompile || isStarting}
            className="w-full justify-center"
          >
            {isStarting ? (
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
                Starting...
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Compile BrandBrain
              </>
            )}
          </KButton>

          {/* Dev mode: force refresh */}
          {env.brandBrainDevMode && (
            <button
              onClick={() => handleStartCompile(true)}
              disabled={!canCompile || isStarting}
              className="w-full text-center text-[11px] text-kairo-fg-subtle hover:text-kairo-fg-muted transition-colors"
            >
              Force refresh (dev only)
            </button>
          )}

          {!canCompile && (
            <p className="text-[12px] text-kairo-fg-subtle text-center">
              Complete the requirements above to enable compilation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for requirement rows
function RequirementRow({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`
          flex items-center justify-center w-5 h-5 rounded-full
          ${met ? "bg-kairo-success-bg" : "bg-kairo-bg-elevated"}
        `}
      >
        {met ? (
          <svg
            className="w-3 h-3 text-kairo-success-fg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <span className="w-2 h-2 rounded-full bg-kairo-fg-subtle" />
        )}
      </span>
      <span
        className={`text-[13px] ${
          met ? "text-kairo-fg" : "text-kairo-fg-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

CompilePanel.displayName = "CompilePanel";
