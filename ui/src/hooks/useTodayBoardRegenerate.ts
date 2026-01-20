/**
 * useTodayBoardRegenerate Hook
 *
 * Phase 3: Handles regenerate flow with polling.
 *
 * Polling rules (NON-NEGOTIABLE per convergence_plan.md):
 * - Poll only while: state === "generating" or state === "not_generated_yet"
 * - Stop polling immediately when: state === "ready" | "insufficient_evidence" | "error"
 * - Poll interval: 2-3 seconds
 * - Hard stop after timeout (no infinite loops)
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { realApi } from "@/lib/api/client";
import { adaptTodayBoard, type UITodayBoard } from "@/lib/todayAdapter";
import type { TodayBoardState } from "@/contracts/backendContracts";

// Polling configuration
const POLL_INTERVAL_MS = 2500; // 2.5 seconds
const MAX_POLL_DURATION_MS = 300000; // 5 minutes hard timeout

// Terminal states - stop polling when reached
const TERMINAL_STATES: TodayBoardState[] = [
  "ready",
  "insufficient_evidence",
  "error",
];

interface RegenerateState {
  isRegenerating: boolean;
  error: string | null;
  board: UITodayBoard | null;
}

interface UseTodayBoardRegenerateResult {
  /** Current state of regeneration */
  state: RegenerateState;
  /** Trigger regeneration - POST then poll */
  regenerate: () => Promise<void>;
  /** Cancel ongoing polling */
  cancel: () => void;
  /** Whether we're currently polling */
  isPolling: boolean;
}

export function useTodayBoardRegenerate(
  brandId: string,
  initialBoard: UITodayBoard
): UseTodayBoardRegenerateResult {
  const [state, setState] = useState<RegenerateState>({
    isRegenerating: false,
    error: null,
    board: initialBoard,
  });

  const [isPolling, setIsPolling] = useState(false);

  // Refs for cleanup
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollStartTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-poll on mount if initial state is "generating" or "not_generated_yet"
  useEffect(() => {
    const initialState = initialBoard.meta.state;
    if (initialState === "generating" || initialState === "not_generated_yet") {
      console.log(
        `[useTodayBoardRegenerate] Initial state is "${initialState}", starting auto-poll...`
      );
      setState((prev) => ({ ...prev, isRegenerating: true }));
      pollStartTimeRef.current = Date.now();
      setIsPolling(true);
      // Start polling immediately
      pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const cancel = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPolling(false);
    setState((prev) => ({ ...prev, isRegenerating: false }));
  }, []);

  const poll = useCallback(async () => {
    // Check hard timeout
    const elapsed = Date.now() - pollStartTimeRef.current;
    if (elapsed > MAX_POLL_DURATION_MS) {
      console.warn("[useTodayBoardRegenerate] Hard timeout reached, stopping poll");
      setState((prev) => ({
        ...prev,
        isRegenerating: false,
        error: "Regeneration timed out. Please try again.",
      }));
      setIsPolling(false);
      return;
    }

    try {
      const backendBoard = await realApi.getTodayBoard(brandId);
      const uiBoard = adaptTodayBoard(backendBoard);

      // Update board state
      setState((prev) => ({
        ...prev,
        board: uiBoard,
        error: null,
      }));

      // Check if terminal state reached
      if (TERMINAL_STATES.includes(backendBoard.meta.state)) {
        console.log(
          `[useTodayBoardRegenerate] Terminal state reached: ${backendBoard.meta.state}`
        );
        setState((prev) => ({ ...prev, isRegenerating: false }));
        setIsPolling(false);
        return;
      }

      // Continue polling for non-terminal states (generating, not_generated_yet)
      console.log(
        `[useTodayBoardRegenerate] State: ${backendBoard.meta.state}, continuing poll...`
      );
      pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    } catch (err) {
      console.error("[useTodayBoardRegenerate] Poll error:", err);
      // Try to fetch the board one more time to get the final state
      // This handles cases where the job failed but the board state was updated
      try {
        const finalBoard = await realApi.getTodayBoard(brandId);
        const uiFinalBoard = adaptTodayBoard(finalBoard);
        setState((prev) => ({
          ...prev,
          isRegenerating: false,
          board: uiFinalBoard,
          error: err instanceof Error ? err.message : "Failed to fetch board status",
        }));
      } catch {
        // If even the final fetch fails, just report the error
        setState((prev) => ({
          ...prev,
          isRegenerating: false,
          error: err instanceof Error ? err.message : "Failed to fetch board status",
        }));
      }
      setIsPolling(false);
    }
  }, [brandId]);

  const regenerate = useCallback(async () => {
    // Cancel any existing polling
    cancel();

    // Reset state
    setState((prev) => ({
      ...prev,
      isRegenerating: true,
      error: null,
    }));

    try {
      // POST to trigger regeneration
      console.log("[useTodayBoardRegenerate] Triggering regenerate...");
      const response = await realApi.triggerRegenerate(brandId);
      console.log(
        `[useTodayBoardRegenerate] Regenerate accepted, job_id: ${response.job_id}`
      );

      // Start polling
      abortControllerRef.current = new AbortController();
      pollStartTimeRef.current = Date.now();
      setIsPolling(true);

      // Begin polling after short delay to allow backend to update state
      pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    } catch (err) {
      console.error("[useTodayBoardRegenerate] Regenerate error:", err);
      setState((prev) => ({
        ...prev,
        isRegenerating: false,
        error: err instanceof Error ? err.message : "Failed to trigger regeneration",
      }));
    }
  }, [brandId, cancel, poll]);

  return {
    state,
    regenerate,
    cancel,
    isPolling,
  };
}
