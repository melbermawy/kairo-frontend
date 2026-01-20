#!/usr/bin/env npx ts-node
/**
 * BrandBrain Integration Sanity Test Script
 *
 * Validates that the frontend can communicate with the backend API
 * and that response shapes match the expected Zod schemas.
 *
 * Usage:
 *   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npx ts-node scripts/brandbrain-integration-sanity.ts
 *
 * Or with a specific brand ID:
 *   BRAND_ID=brand_123 NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npx ts-node scripts/brandbrain-integration-sanity.ts
 */

import { z } from "zod";

// ============================================
// SCHEMAS (copied from contracts for standalone use)
// ============================================

const CompileStatusValueSchema = z.enum([
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

const CompileProgressSchema = z.object({
  stage: z.string().optional(),
  sources_completed: z.number(),
  sources_total: z.number(),
});

const EvidenceStatusSchema = z
  .object({
    total: z.number().optional(),
    completed: z.number().optional(),
    failed: z.number().optional(),
  })
  .passthrough();

const CompileStatusSchema = z.object({
  compile_run_id: z.string(),
  status: CompileStatusValueSchema,
  progress: CompileProgressSchema.optional(),
  evidence_status: EvidenceStatusSchema.optional(),
  snapshot: z
    .object({
      snapshot_id: z.string(),
      created_at: z.string(),
      snapshot_json: z.record(z.string(), z.unknown()),
    })
    .optional(),
  error: z.string().optional(),
});

const CompileTriggerResponseSchema = z.object({
  compile_run_id: z.string(),
  status: z.string(),
  poll_url: z.string().optional(),
  snapshot: z
    .object({
      snapshot_id: z.string(),
      brand_id: z.string(),
      created_at: z.string(),
      snapshot_json: z.record(z.string(), z.unknown()),
    })
    .optional(),
});

const BackendSnapshotResponseSchema = z.object({
  snapshot_id: z.string(),
  brand_id: z.string(),
  snapshot_json: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  compile_run_id: z.string().optional(),
});

const SnapshotHistoryItemSchema = z.object({
  snapshot_id: z.string(),
  created_at: z.string(),
  diff_summary: z.record(z.string(), z.unknown()).optional(),
});

const SnapshotHistoryResponseSchema = z.object({
  snapshots: z.array(SnapshotHistoryItemSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
});

const BrandBrainOverridesSchema = z.object({
  brand_id: z.string(),
  overrides_json: z.record(z.string(), z.unknown()),
  pinned_paths: z.array(z.string()),
  updated_at: z.string().nullable(),
});

const BrandCoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  website_url: z.string().url().nullable().optional(),
  created_at: z.string().optional(),
});

// ============================================
// TEST UTILITIES
// ============================================

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const BRAND_ID = process.env.BRAND_ID || "";

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  validationErrors?: z.ZodIssue[];
  responsePreview?: unknown;
}

const results: TestResult[] = [];

async function fetchEndpoint(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`  ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function testEndpoint<T>(
  name: string,
  method: string,
  endpoint: string,
  schema: z.ZodSchema<T>,
  body?: unknown
): Promise<void> {
  const result: TestResult = {
    name,
    endpoint,
    method,
    success: false,
  };

  try {
    const { ok, status, data } = await fetchEndpoint(method, endpoint, body);
    result.statusCode = status;
    result.responsePreview = JSON.stringify(data).slice(0, 200);

    if (!ok) {
      result.error = `HTTP ${status}`;
      results.push(result);
      return;
    }

    const validation = schema.safeParse(data);
    if (!validation.success) {
      result.error = "Schema validation failed";
      result.validationErrors = validation.error.issues;
      results.push(result);
      return;
    }

    result.success = true;
    results.push(result);
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    results.push(result);
  }
}

// ============================================
// TESTS
// ============================================

async function runTests(): Promise<void> {
  console.log("\n=== BrandBrain Integration Sanity Tests ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Brand ID: ${BRAND_ID || "(will use first from list)"}\n`);

  // Get or create a brand ID for testing
  let brandId = BRAND_ID;

  if (!brandId) {
    console.log("1. Fetching brand list to get a test brand ID...");
    try {
      const { ok, data } = await fetchEndpoint("GET", "/api/brands");
      if (ok && Array.isArray(data) && data.length > 0) {
        brandId = data[0].id;
        console.log(`   Found brand: ${brandId}\n`);
      } else {
        console.log("   No brands found. Creating a test brand...");
        const createResult = await fetchEndpoint("POST", "/api/brands", {
          name: "Integration Test Brand",
          website_url: "https://example.com",
        });
        if (createResult.ok && createResult.data) {
          brandId = (createResult.data as { id: string }).id;
          console.log(`   Created brand: ${brandId}\n`);
        } else {
          console.error("   Failed to create test brand. Exiting.");
          process.exit(1);
        }
      }
    } catch (err) {
      console.error(`   Failed to get brands: ${err}`);
      process.exit(1);
    }
  }

  // Test 1: GET /api/brands/{id}
  console.log("2. Testing GET /api/brands/{id}...");
  await testEndpoint(
    "Get Brand",
    "GET",
    `/api/brands/${brandId}`,
    BrandCoreSchema
  );

  // Test 2: POST /api/brands/{id}/brandbrain/compile
  console.log("\n3. Testing POST /api/brands/{id}/brandbrain/compile...");
  await testEndpoint(
    "Trigger Compile",
    "POST",
    `/api/brands/${brandId}/brandbrain/compile`,
    CompileTriggerResponseSchema,
    { force_refresh: false }
  );

  // Extract compile_run_id for status polling test
  const compileResult = results.find((r) => r.name === "Trigger Compile");
  let compileRunId: string | undefined;
  if (compileResult?.success && compileResult.responsePreview) {
    try {
      const parsed = JSON.parse(compileResult.responsePreview as string);
      compileRunId = parsed.compile_run_id;
    } catch {
      // Try to get from full response
    }
  }

  // Test 3: GET /api/brands/{id}/brandbrain/compile/{run_id}/status
  if (compileRunId) {
    console.log(
      "\n4. Testing GET /api/brands/{id}/brandbrain/compile/{run_id}/status..."
    );
    await testEndpoint(
      "Get Compile Status",
      "GET",
      `/api/brands/${brandId}/brandbrain/compile/${compileRunId}/status`,
      CompileStatusSchema
    );
  } else {
    console.log("\n4. Skipping compile status test (no compile_run_id)");
  }

  // Test 4: GET /api/brands/{id}/brandbrain/latest
  console.log("\n5. Testing GET /api/brands/{id}/brandbrain/latest...");
  await testEndpoint(
    "Get Latest Snapshot",
    "GET",
    `/api/brands/${brandId}/brandbrain/latest`,
    BackendSnapshotResponseSchema
  );

  // Test 5: GET /api/brands/{id}/brandbrain/history
  console.log("\n6. Testing GET /api/brands/{id}/brandbrain/history...");
  await testEndpoint(
    "Get Snapshot History",
    "GET",
    `/api/brands/${brandId}/brandbrain/history`,
    SnapshotHistoryResponseSchema
  );

  // Test 6: GET /api/brands/{id}/brandbrain/overrides
  console.log("\n7. Testing GET /api/brands/{id}/brandbrain/overrides...");
  await testEndpoint(
    "Get Overrides",
    "GET",
    `/api/brands/${brandId}/brandbrain/overrides`,
    BrandBrainOverridesSchema
  );

  // Test 7: PATCH /api/brands/{id}/brandbrain/overrides
  console.log("\n8. Testing PATCH /api/brands/{id}/brandbrain/overrides...");
  await testEndpoint(
    "Patch Overrides",
    "PATCH",
    `/api/brands/${brandId}/brandbrain/overrides`,
    BrandBrainOverridesSchema,
    {
      overrides_json: { "test.path": "test value" },
      pinned_paths: [],
    }
  );

  // Clean up test override
  await fetchEndpoint("PATCH", `/api/brands/${brandId}/brandbrain/overrides`, {
    overrides_json: { "test.path": null },
    pinned_paths: [],
  });

  // ============================================
  // RESULTS SUMMARY
  // ============================================

  console.log("\n=== Results Summary ===\n");

  const passed = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`Passed: ${passed.length}/${results.length}`);
  console.log(`Failed: ${failed.length}/${results.length}\n`);

  if (failed.length > 0) {
    console.log("Failed Tests:\n");
    for (const result of failed) {
      console.log(`  [FAIL] ${result.name}`);
      console.log(`         ${result.method} ${result.endpoint}`);
      if (result.statusCode) console.log(`         Status: ${result.statusCode}`);
      if (result.error) console.log(`         Error: ${result.error}`);
      if (result.validationErrors) {
        console.log("         Validation Issues:");
        for (const issue of result.validationErrors) {
          console.log(`           - ${issue.path.join(".")}: ${issue.message}`);
        }
      }
      console.log();
    }
  }

  console.log("Passed Tests:\n");
  for (const result of passed) {
    console.log(`  [PASS] ${result.name}`);
    console.log(`         ${result.method} ${result.endpoint}`);
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
