// src/lib/debug/diagnostics.ts
// Diagnostic mode for freeze detection - gated by NEXT_PUBLIC_DIAG_FREEZE=1

// ============================================
// DIAGNOSTIC MODE GATE
// ============================================

const DIAG_ENABLED = typeof window !== "undefined" && process.env.NEXT_PUBLIC_DIAG_FREEZE === "1";

// Kill switches - read once at module load
export const killSwitches = {
  disableBrandBrainClient: process.env.NEXT_PUBLIC_DIAG_DISABLE_BRANDBRAIN_CLIENT === "1",
  disableSnapshotRender: process.env.NEXT_PUBLIC_DIAG_DISABLE_SNAPSHOT_RENDER === "1",
  disablePolling: process.env.NEXT_PUBLIC_DIAG_DISABLE_POLLING === "1",
};

// ============================================
// RENDER COUNTERS
// ============================================

interface RenderStats {
  count: number;
  lastRenderTime: number;
  renderTimestamps: number[]; // Last 10 render times for rate calculation
}

const renderCounters: Map<string, RenderStats> = new Map();

export function trackRender(componentName: string): number {
  if (!DIAG_ENABLED) return 0;

  const now = Date.now();
  const stats = renderCounters.get(componentName) ?? {
    count: 0,
    lastRenderTime: 0,
    renderTimestamps: [],
  };

  stats.count += 1;
  stats.lastRenderTime = now;
  stats.renderTimestamps.push(now);
  // Keep only last 10 timestamps
  if (stats.renderTimestamps.length > 10) {
    stats.renderTimestamps.shift();
  }

  renderCounters.set(componentName, stats);
  return stats.count;
}

export function getRenderStats(): Record<string, { count: number; ratePerSec: number }> {
  const result: Record<string, { count: number; ratePerSec: number }> = {};
  const now = Date.now();

  for (const [name, stats] of renderCounters.entries()) {
    // Calculate rate from timestamps in last 5 seconds
    const recent = stats.renderTimestamps.filter((t) => now - t < 5000);
    const ratePerSec = recent.length > 0 ? recent.length / 5 : 0;

    result[name] = {
      count: stats.count,
      ratePerSec: Math.round(ratePerSec * 10) / 10,
    };
  }

  return result;
}

// ============================================
// API REQUEST METRICS
// ============================================

interface RequestMetrics {
  count: number;
  totalDurationMs: number;
  totalPayloadBytes: number;
  lastDurationMs: number;
  lastPayloadBytes: number;
  inFlight: number;
}

const requestMetrics: Map<string, RequestMetrics> = new Map();

// Normalize endpoint (replace UUIDs with :id)
function normalizeEndpoint(url: string): string {
  return url
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id")
    .replace(/^https?:\/\/[^/]+/, ""); // Remove host
}

export function trackRequestStart(endpoint: string): void {
  if (!DIAG_ENABLED) return;

  const key = normalizeEndpoint(endpoint);
  const metrics = requestMetrics.get(key) ?? {
    count: 0,
    totalDurationMs: 0,
    totalPayloadBytes: 0,
    lastDurationMs: 0,
    lastPayloadBytes: 0,
    inFlight: 0,
  };

  metrics.inFlight += 1;
  requestMetrics.set(key, metrics);
}

export function trackRequestEnd(
  endpoint: string,
  durationMs: number,
  payloadBytes: number
): void {
  if (!DIAG_ENABLED) return;

  const key = normalizeEndpoint(endpoint);
  const metrics = requestMetrics.get(key) ?? {
    count: 0,
    totalDurationMs: 0,
    totalPayloadBytes: 0,
    lastDurationMs: 0,
    lastPayloadBytes: 0,
    inFlight: 0,
  };

  metrics.count += 1;
  metrics.totalDurationMs += durationMs;
  metrics.totalPayloadBytes += payloadBytes;
  metrics.lastDurationMs = durationMs;
  metrics.lastPayloadBytes = payloadBytes;
  metrics.inFlight = Math.max(0, metrics.inFlight - 1);

  requestMetrics.set(key, metrics);
}

export function getRequestMetrics(): Record<
  string,
  { count: number; avgMs: number; totalKB: number; lastKB: number; inFlight: number }
> {
  const result: Record<string, { count: number; avgMs: number; totalKB: number; lastKB: number; inFlight: number }> = {};

  for (const [key, m] of requestMetrics.entries()) {
    result[key] = {
      count: m.count,
      avgMs: m.count > 0 ? Math.round(m.totalDurationMs / m.count) : 0,
      totalKB: Math.round(m.totalPayloadBytes / 1024 * 10) / 10,
      lastKB: Math.round(m.lastPayloadBytes / 1024 * 10) / 10,
      inFlight: m.inFlight,
    };
  }

  return result;
}

// ============================================
// SINGLE-FLIGHT POLLER GUARD
// ============================================

interface PollerEntry {
  abortController: AbortController;
  timeoutId: NodeJS.Timeout | null;
  startTime: number;
}

const activePollers: Map<string, PollerEntry> = new Map();

/**
 * Create a poller key from brandId and compileRunId
 */
function getPollerKey(brandId: string, compileRunId: string): string {
  return `${brandId}:${compileRunId}`;
}

/**
 * Register a new poller. Returns null if a poller already exists for this key.
 * Otherwise, returns an AbortController to use for fetch requests.
 */
export function registerPoller(
  brandId: string,
  compileRunId: string
): AbortController | null {
  const key = getPollerKey(brandId, compileRunId);

  if (activePollers.has(key)) {
    if (DIAG_ENABLED) {
      console.warn(`[DIAG] Blocked duplicate poller for ${key}`);
    }
    return null; // Poller already exists
  }

  const entry: PollerEntry = {
    abortController: new AbortController(),
    timeoutId: null,
    startTime: Date.now(),
  };

  activePollers.set(key, entry);

  if (DIAG_ENABLED) {
    console.log(`[DIAG] Registered poller for ${key}`);
  }

  return entry.abortController;
}

/**
 * Set the timeout ID for a poller (for cleanup)
 */
export function setPollerTimeout(
  brandId: string,
  compileRunId: string,
  timeoutId: NodeJS.Timeout
): void {
  const key = getPollerKey(brandId, compileRunId);
  const entry = activePollers.get(key);
  if (entry) {
    entry.timeoutId = timeoutId;
  }
}

/**
 * Unregister and cleanup a poller
 */
export function unregisterPoller(brandId: string, compileRunId: string): void {
  const key = getPollerKey(brandId, compileRunId);
  const entry = activePollers.get(key);

  if (entry) {
    // Abort any pending fetches
    entry.abortController.abort();

    // Clear any pending timeout
    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }

    activePollers.delete(key);

    if (DIAG_ENABLED) {
      const duration = Date.now() - entry.startTime;
      console.log(`[DIAG] Unregistered poller for ${key} (ran ${duration}ms)`);
    }
  }
}

/**
 * Get active poller count (for diagnostics)
 */
export function getActivePollerCount(): number {
  return activePollers.size;
}

/**
 * Get active poller keys (for diagnostics)
 */
export function getActivePollers(): string[] {
  return Array.from(activePollers.keys());
}

// ============================================
// SUMMARY LOGGING (once per 5 seconds)
// ============================================

let lastSummaryTime = 0;
const SUMMARY_INTERVAL = 5000; // 5 seconds

export function maybePrintSummary(): void {
  if (!DIAG_ENABLED) return;

  const now = Date.now();
  if (now - lastSummaryTime < SUMMARY_INTERVAL) return;

  lastSummaryTime = now;

  const renders = getRenderStats();
  const requests = getRequestMetrics();
  const pollers = getActivePollerCount();

  // Build summary line
  const renderSummary = Object.entries(renders)
    .map(([name, r]) => `${name}:${r.count}`)
    .join(" ");

  const requestSummary = Object.entries(requests)
    .map(([ep, r]) => `${ep.split("/").pop()}:${r.count}`)
    .join(" ");

  console.log(
    `[DIAG] renders=[${renderSummary}] requests=[${requestSummary}] pollers=${pollers}`
  );
}

// ============================================
// DIAGNOSTIC OVERLAY DATA
// ============================================

export interface DiagnosticData {
  enabled: boolean;
  killSwitches: typeof killSwitches;
  renders: ReturnType<typeof getRenderStats>;
  requests: ReturnType<typeof getRequestMetrics>;
  activePollers: number;
  pollerKeys: string[];
}

export function getDiagnosticData(): DiagnosticData {
  return {
    enabled: DIAG_ENABLED,
    killSwitches,
    renders: getRenderStats(),
    requests: getRequestMetrics(),
    activePollers: getActivePollerCount(),
    pollerKeys: getActivePollers(),
  };
}

// ============================================
// EXPORTS
// ============================================

export const diagnostics = {
  enabled: DIAG_ENABLED,
  killSwitches,
  trackRender,
  getRenderStats,
  trackRequestStart,
  trackRequestEnd,
  getRequestMetrics,
  registerPoller,
  setPollerTimeout,
  unregisterPoller,
  getActivePollerCount,
  getActivePollers,
  maybePrintSummary,
  getDiagnosticData,
};
