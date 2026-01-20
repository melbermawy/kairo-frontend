#!/usr/bin/env npx tsx
/**
 * smoke_ui_calls.ts
 * CLI-based smoke test for backend endpoints used by the UI.
 * Useful when DevTools is frozen and you can't inspect network requests.
 *
 * Usage:
 *   npx tsx ui/scripts/smoke_ui_calls.ts [brandId]
 *
 * Environment:
 *   NEXT_PUBLIC_API_BASE_URL - Backend URL (default: http://localhost:8000)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const TIMEOUT_MS = 15000;

interface TestResult {
  endpoint: string;
  method: string;
  status: number | "timeout" | "error";
  durationMs: number;
  responseSize?: number;
  error?: string;
}

const results: TestResult[] = [];

// Helper to make a timed fetch
async function timedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<TestResult> {
  const method = options.method || "GET";
  const url = `${API_BASE_URL}${endpoint}`;
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const duration = Date.now() - startTime;
    const text = await response.text();

    return {
      endpoint,
      method,
      status: response.status,
      durationMs: duration,
      responseSize: text.length,
    };
  } catch (err) {
    const duration = Date.now() - startTime;

    if (err instanceof Error && err.name === "AbortError") {
      return {
        endpoint,
        method,
        status: "timeout",
        durationMs: duration,
        error: `Timed out after ${TIMEOUT_MS}ms`,
      };
    }

    return {
      endpoint,
      method,
      status: "error",
      durationMs: duration,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Format bytes
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Format duration
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Print result
function printResult(result: TestResult): void {
  const statusStr =
    typeof result.status === "number"
      ? result.status >= 200 && result.status < 300
        ? `\x1b[32m${result.status}\x1b[0m` // green
        : `\x1b[31m${result.status}\x1b[0m` // red
      : `\x1b[33m${result.status}\x1b[0m`; // yellow for timeout/error

  const sizeStr = result.responseSize
    ? `(${formatBytes(result.responseSize)})`
    : "";

  console.log(
    `  ${result.method.padEnd(6)} ${result.endpoint.padEnd(50)} ${statusStr.padEnd(15)} ${formatDuration(result.durationMs).padStart(8)} ${sizeStr}`
  );

  if (result.error) {
    console.log(`         Error: ${result.error}`);
  }
}

// Main test runner
async function runTests(brandId?: string): Promise<void> {
  console.log("\n========================================");
  console.log("UI Smoke Test - Backend Endpoints");
  console.log("========================================");
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT_MS}ms`);
  console.log("");

  // Test 1: List brands
  console.log("1. Core Endpoints:");
  const brandsResult = await timedFetch("/api/brands");
  results.push(brandsResult);
  printResult(brandsResult);

  // If we got brands and no brandId provided, use the first one
  let testBrandId = brandId;
  if (!testBrandId && brandsResult.status === 200) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brands`);
      const brands = await response.json();
      if (Array.isArray(brands) && brands.length > 0) {
        testBrandId = brands[0].id;
        console.log(`   Using first brand: ${testBrandId}`);
      }
    } catch {
      console.log("   No brands available for further tests");
    }
  }

  if (!testBrandId) {
    console.log("\nNo brand ID available. Skipping brand-specific tests.");
    printSummary();
    return;
  }

  // Test 2: Brand-specific endpoints
  console.log("\n2. Brand Endpoints:");

  const brandResult = await timedFetch(`/api/brands/${testBrandId}`);
  results.push(brandResult);
  printResult(brandResult);

  const onboardingResult = await timedFetch(`/api/brands/${testBrandId}/onboarding`);
  results.push(onboardingResult);
  printResult(onboardingResult);

  const sourcesResult = await timedFetch(`/api/brands/${testBrandId}/sources`);
  results.push(sourcesResult);
  printResult(sourcesResult);

  // Test 3: BrandBrain endpoints
  console.log("\n3. BrandBrain Endpoints:");

  const snapshotResult = await timedFetch(`/api/brands/${testBrandId}/brandbrain/latest`);
  results.push(snapshotResult);
  printResult(snapshotResult);

  const overridesResult = await timedFetch(`/api/brands/${testBrandId}/brandbrain/overrides`);
  results.push(overridesResult);
  printResult(overridesResult);

  const historyResult = await timedFetch(`/api/brands/${testBrandId}/brandbrain/history`);
  results.push(historyResult);
  printResult(historyResult);

  // Test 4: Compile endpoint (POST - be careful)
  console.log("\n4. Compile Endpoint (read-only check):");
  console.log("   Skipping POST /compile to avoid triggering actual compile");
  console.log("   To test compile, manually run: curl -X POST ...");

  printSummary();
}

function printSummary(): void {
  console.log("\n========================================");
  console.log("Summary:");
  console.log("========================================");

  const successful = results.filter(
    (r) => typeof r.status === "number" && r.status >= 200 && r.status < 300
  );
  const failed = results.filter(
    (r) => typeof r.status === "number" && (r.status < 200 || r.status >= 300)
  );
  const errors = results.filter((r) => typeof r.status !== "number");

  console.log(`  Total requests: ${results.length}`);
  console.log(`  Successful (2xx): ${successful.length}`);
  console.log(`  Failed (non-2xx): ${failed.length}`);
  console.log(`  Errors/Timeouts: ${errors.length}`);

  const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0);
  const avgDuration = results.length > 0 ? totalDuration / results.length : 0;
  console.log(`  Average response time: ${formatDuration(avgDuration)}`);

  const totalSize = results.reduce((sum, r) => sum + (r.responseSize || 0), 0);
  console.log(`  Total response size: ${formatBytes(totalSize)}`);

  // Identify potential issues
  console.log("\nPotential Issues:");
  const slowRequests = results.filter((r) => r.durationMs > 3000);
  const largeResponses = results.filter((r) => (r.responseSize || 0) > 200 * 1024);

  if (slowRequests.length > 0) {
    console.log(`  - ${slowRequests.length} slow request(s) (>3s):`);
    slowRequests.forEach((r) => console.log(`    * ${r.endpoint}: ${formatDuration(r.durationMs)}`));
  }

  if (largeResponses.length > 0) {
    console.log(`  - ${largeResponses.length} large response(s) (>200KB):`);
    largeResponses.forEach((r) =>
      console.log(`    * ${r.endpoint}: ${formatBytes(r.responseSize || 0)}`)
    );
  }

  if (errors.length > 0) {
    console.log(`  - ${errors.length} error(s)/timeout(s):`);
    errors.forEach((r) => console.log(`    * ${r.endpoint}: ${r.error}`));
  }

  if (slowRequests.length === 0 && largeResponses.length === 0 && errors.length === 0) {
    console.log("  None detected - all requests completed quickly with reasonable sizes");
  }

  console.log("\n");
}

// Run
const brandIdArg = process.argv[2];
runTests(brandIdArg).catch(console.error);
