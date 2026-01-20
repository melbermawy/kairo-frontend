// src/hooks/useLazySnapshotHistory.ts
// Lazy-loading hook for snapshot history - only fetches when explicitly requested
// Prevents wasteful API calls on page load

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { SnapshotHistoryResponse } from "@/contracts";

interface UseLazySnapshotHistoryResult {
  // Data state
  history: SnapshotHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;

  // Actions
  loadHistory: () => Promise<void>;
  reset: () => void;
}

/**
 * Lazy-loading hook for snapshot history.
 * Does NOT fetch on mount - only when loadHistory() is called.
 * Use this for "Show History" buttons or expandable sections.
 *
 * @example
 * ```tsx
 * function HistoryPanel({ brandId }) {
 *   const { history, isLoading, loadHistory, hasLoaded } = useLazySnapshotHistory(brandId);
 *
 *   return (
 *     <div>
 *       {!hasLoaded && (
 *         <button onClick={loadHistory}>Show History</button>
 *       )}
 *       {isLoading && <Spinner />}
 *       {history && (
 *         <ul>
 *           {history.snapshots.map(s => <li key={s.snapshot_id}>{s.created_at}</li>)}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLazySnapshotHistory(brandId: string): UseLazySnapshotHistoryResult {
  const [history, setHistory] = useState<SnapshotHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadHistory = useCallback(async () => {
    if (isLoading) return; // Prevent duplicate calls

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getSnapshotHistory(brandId);
      setHistory(data);
      setHasLoaded(true);
    } catch (err) {
      console.error("Failed to load snapshot history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [brandId, isLoading]);

  const reset = useCallback(() => {
    setHistory(null);
    setIsLoading(false);
    setError(null);
    setHasLoaded(false);
  }, []);

  return {
    history,
    isLoading,
    error,
    hasLoaded,
    loadHistory,
    reset,
  };
}
