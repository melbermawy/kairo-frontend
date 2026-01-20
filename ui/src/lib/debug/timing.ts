// src/lib/debug/timing.ts
// Minimal timing and call-count instrumentation for debugging UI freezes
// Safe and reversible - can be disabled via NEXT_PUBLIC_DEBUG_TIMING=false

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG_TIMING !== "false";
const MAX_LOGS_PER_ENDPOINT = 20;
const SUPPRESS_AFTER = MAX_LOGS_PER_ENDPOINT;

// Track call counts per endpoint
const callCounts: Map<string, number> = new Map();
const suppressedCounts: Map<string, number> = new Map();

// Track durations for performance analysis
const callDurations: Map<string, number[]> = new Map();

// Page-level tracking
interface PageMetrics {
  pageName: string;
  startTime: number;
  requests: Array<{
    endpoint: string;
    method: string;
    durationMs: number;
    status: number | string;
  }>;
}

let currentPageMetrics: PageMetrics | null = null;

// Format milliseconds for logging
function formatMs(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Get endpoint key from URL
function getEndpointKey(url: string): string {
  try {
    const parsed = new URL(url);
    // Normalize: remove query params, replace UUIDs with :id
    return parsed.pathname.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ":id"
    );
  } catch {
    return url;
  }
}

// Should we log this call?
function shouldLog(endpointKey: string): boolean {
  const count = callCounts.get(endpointKey) ?? 0;
  return count < SUPPRESS_AFTER;
}

// Log API call start
export function logApiStart(method: string, url: string): void {
  if (!DEBUG_ENABLED) return;

  const key = getEndpointKey(url);
  const count = (callCounts.get(key) ?? 0) + 1;
  callCounts.set(key, count);

  if (shouldLog(key)) {
    console.log(`[API] ${method} ${key} start (#${count})`);
  } else if (count === SUPPRESS_AFTER + 1) {
    console.log(`[API] ${key} - suppressing further logs (exceeded ${MAX_LOGS_PER_ENDPOINT})`);
  }
}

// Log API call end
export function logApiEnd(
  method: string,
  url: string,
  durationMs: number,
  status: number | "timeout" | "error"
): void {
  if (!DEBUG_ENABLED) return;

  const key = getEndpointKey(url);

  // Track duration for performance analysis
  const durations = callDurations.get(key) ?? [];
  durations.push(durationMs);
  callDurations.set(key, durations);

  // Track in page metrics if active
  if (currentPageMetrics) {
    currentPageMetrics.requests.push({
      endpoint: key,
      method,
      durationMs,
      status,
    });
  }

  if (shouldLog(key)) {
    const statusStr = typeof status === "number" ? `status=${status}` : status;
    console.log(`[API] ${method} ${key} end ${formatMs(durationMs)} ${statusStr}`);
  } else {
    // Track suppressed calls
    suppressedCounts.set(key, (suppressedCounts.get(key) ?? 0) + 1);
  }
}

// Get stats for debugging
export function getApiStats(): Record<string, { calls: number; suppressed: number }> {
  const stats: Record<string, { calls: number; suppressed: number }> = {};
  for (const [key, calls] of callCounts.entries()) {
    stats[key] = {
      calls,
      suppressed: suppressedCounts.get(key) ?? 0,
    };
  }
  return stats;
}

// Get detailed performance stats with durations
export function getPerformanceStats(): Record<string, {
  calls: number;
  totalMs: number;
  avgMs: number;
  maxMs: number;
}> {
  const stats: Record<string, { calls: number; totalMs: number; avgMs: number; maxMs: number }> = {};
  for (const [key, durations] of callDurations.entries()) {
    const totalMs = durations.reduce((a, b) => a + b, 0);
    stats[key] = {
      calls: durations.length,
      totalMs,
      avgMs: Math.round(totalMs / durations.length),
      maxMs: Math.max(...durations),
    };
  }
  return stats;
}

// Reset stats (useful for per-page tracking)
export function resetApiStats(): void {
  callCounts.clear();
  suppressedCounts.clear();
  callDurations.clear();
}

// Start tracking a page load
export function startPageMetrics(pageName: string): void {
  currentPageMetrics = {
    pageName,
    startTime: Date.now(),
    requests: [],
  };
  if (DEBUG_ENABLED) {
    console.log(`[PAGE] ${pageName} load started`);
  }
}

// End page load tracking and print summary
export function endPageMetrics(): PageMetrics | null {
  if (!currentPageMetrics) return null;

  const metrics = currentPageMetrics;
  const totalTime = Date.now() - metrics.startTime;
  const totalApiTime = metrics.requests.reduce((sum, r) => sum + r.durationMs, 0);

  if (DEBUG_ENABLED) {
    console.log(`\n[PAGE] ${metrics.pageName} load complete`);
    console.log(`  Total time: ${formatMs(totalTime)}`);
    console.log(`  API calls: ${metrics.requests.length}`);
    console.log(`  Total API time: ${formatMs(totalApiTime)}`);

    // Group by endpoint
    const byEndpoint = new Map<string, { count: number; totalMs: number }>();
    for (const req of metrics.requests) {
      const existing = byEndpoint.get(req.endpoint) ?? { count: 0, totalMs: 0 };
      byEndpoint.set(req.endpoint, {
        count: existing.count + 1,
        totalMs: existing.totalMs + req.durationMs,
      });
    }

    console.log("  Breakdown:");
    const sorted = [...byEndpoint.entries()].sort((a, b) => b[1].totalMs - a[1].totalMs);
    for (const [endpoint, data] of sorted) {
      console.log(`    ${endpoint}: ${data.count}x = ${formatMs(data.totalMs)}`);
    }
    console.log("");
  }

  currentPageMetrics = null;
  return metrics;
}

// Get current page metrics without ending
export function getCurrentPageMetrics(): PageMetrics | null {
  return currentPageMetrics;
}

// Log render with timing
export function logRender(componentName: string, renderCount: number): void {
  if (!DEBUG_ENABLED) return;
  if (renderCount <= 5 || renderCount % 10 === 0) {
    console.log(`[RENDER] ${componentName} #${renderCount}`);
  }
}

// Warn about potential infinite loop
export function warnInfiniteLoop(componentName: string, renderCount: number): void {
  if (renderCount > 50) {
    console.warn(`[WARN] ${componentName} rendered ${renderCount} times - possible infinite loop!`);
  }
}

// Export for use in API client
export const timing = {
  logApiStart,
  logApiEnd,
  getApiStats,
  getPerformanceStats,
  resetApiStats,
  startPageMetrics,
  endPageMetrics,
  getCurrentPageMetrics,
  logRender,
  warnInfiniteLoop,
};
