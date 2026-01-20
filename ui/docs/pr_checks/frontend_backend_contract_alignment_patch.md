# Frontend-Backend Contract Alignment Patch

**Date:** 2026-01-13
**Branch:** main
**Purpose:** Fix all mismatches between frontend API client and backend BrandBrain contract

---

## 1. Mismatches Found

| Issue | Location | Before | After |
|-------|----------|--------|-------|
| **Wrong compile status path** | `client.ts:229` | `/compile/${compileRunId}` | `/compile/${compileRunId}/status` |
| **Wrong status enum** | `brandbrain.ts:298` | `QUEUED \| RUNNING \| ...` | `PENDING \| RUNNING \| ...` |
| **Wrong progress shape** | `brandbrain.ts:307` | `{ stage, percent }` | `{ stage?, sources_completed, sources_total }` |
| **Wrong overrides PATCH payload** | `brandbrain.ts:272` | `{ set_overrides, remove_overrides, pin_paths, unpin_paths }` | `{ overrides_json, pinned_paths }` |
| **Wrong history response** | `client.ts:244` | `BrandBrainSnapshot[]` | `{ snapshots, page, page_size, total }` |
| **Wrong snapshot response** | `client.ts:238` | Direct `BrandBrainSnapshot` | Wrapped `{ snapshot_id, snapshot_json, ... }` |
| **Missing UNCHANGED handling** | `CompilePanel.tsx` | Not handled | Short-circuit on status="UNCHANGED" |

---

## 2. Before/After Code Changes

### 2.1 API Path Fix: Compile Status

**File:** `ui/src/lib/api/client.ts`

**Before:**
```typescript
async getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus> {
  return fetchApi(
    `/api/brands/${brandId}/brandbrain/compile/${compileRunId}`,
    CompileStatusSchema
  );
}
```

**After:**
```typescript
async getCompileStatus(brandId: string, compileRunId: string): Promise<CompileStatus> {
  // FIXED: Backend path includes /status suffix
  return fetchApi(
    `/api/brands/${brandId}/brandbrain/compile/${compileRunId}/status`,
    CompileStatusSchema
  );
}
```

### 2.2 Compile Status Schema

**File:** `ui/src/contracts/brandbrain.ts`

**Before:**
```typescript
export const CompileStatusValueSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export const CompileProgressSchema = z.object({
  stage: CompileStageSchema,
  percent: z.number().min(0).max(100),
});

export const CompileStatusSchema = z.object({
  compile_run_id: z.string(),
  status: CompileStatusValueSchema,
  progress: CompileProgressSchema,
  started_at: z.string(),
  updated_at: z.string(),
  error: z.string().nullable(),
});
```

**After:**
```typescript
// Backend status values: PENDING | RUNNING | SUCCEEDED | FAILED
export const CompileStatusValueSchema = z.enum([
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

// Backend progress shape: { stage?, sources_completed, sources_total }
export const CompileProgressSchema = z.object({
  stage: z.string().optional(),
  sources_completed: z.number(),
  sources_total: z.number(),
});

// Backend compile status response (GET /compile/{id}/status)
export const CompileStatusSchema = z.object({
  compile_run_id: z.string(),
  status: CompileStatusValueSchema,
  progress: CompileProgressSchema.optional(),
  evidence_status: EvidenceStatusSchema.optional(),
  snapshot: z.object({
    snapshot_id: z.string(),
    created_at: z.string(),
    snapshot_json: z.record(z.string(), z.unknown()),
  }).optional(),
  error: z.string().optional(),
});
```

### 2.3 Compile Trigger Response Schema

**File:** `ui/src/contracts/brandbrain.ts`

**New (added):**
```typescript
// Compile trigger response (POST /compile)
// 202 kickoff: { compile_run_id, status: "PENDING"|"QUEUED", poll_url }
// 200 short-circuit: { compile_run_id, status: "UNCHANGED", snapshot: {...} }
export const CompileTriggerResponseSchema = z.object({
  compile_run_id: z.string(),
  status: z.string(), // "PENDING" | "QUEUED" | "UNCHANGED"
  poll_url: z.string().optional(),
  snapshot: z.object({
    snapshot_id: z.string(),
    brand_id: z.string(),
    created_at: z.string(),
    snapshot_json: z.record(z.string(), z.unknown()),
  }).optional(),
});
```

### 2.4 Overrides PATCH Payload

**File:** `ui/src/contracts/brandbrain.ts`

**Before:**
```typescript
export const OverridesPatchRequestSchema = z.object({
  set_overrides: z.record(z.string(), z.unknown()).optional(),
  remove_overrides: z.array(z.string()).optional(),
  pin_paths: z.array(z.string()).optional(),
  unpin_paths: z.array(z.string()).optional(),
});
```

**After:**
```typescript
// Override patch request - matches backend semantics:
// - overrides_json merges; null value deletes a key
// - pinned_paths replaces entire list
export const OverridesPatchRequestSchema = z.object({
  overrides_json: z.record(z.string(), z.unknown()).optional(), // path: value | null (null deletes)
  pinned_paths: z.array(z.string()).optional(), // replaces entire list
});
```

### 2.5 Snapshot History Response

**File:** `ui/src/contracts/brandbrain.ts`

**New (added):**
```typescript
export const SnapshotHistoryItemSchema = z.object({
  snapshot_id: z.string(),
  created_at: z.string(),
  diff_summary: z.record(z.string(), z.unknown()).optional(),
});

export const SnapshotHistoryResponseSchema = z.object({
  snapshots: z.array(SnapshotHistoryItemSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
});
```

### 2.6 Backend Snapshot Response (Wrapped Format)

**File:** `ui/src/contracts/brandbrain.ts`

**New (added):**
```typescript
// Backend returns snapshot_json as a wrapper around the actual snapshot content
export const BackendSnapshotResponseSchema = z.object({
  snapshot_id: z.string(),
  brand_id: z.string(),
  snapshot_json: z.record(z.string(), z.unknown()), // contains the actual playbook content
  created_at: z.string(),
  compile_run_id: z.string().optional(),
});
```

---

## 3. Final Endpoint Mapping Table

| Action | Method | Frontend Path | Validated Schema |
|--------|--------|---------------|------------------|
| Trigger compile | POST | `/api/brands/{id}/brandbrain/compile` | `CompileTriggerResponseSchema` |
| Get compile status | GET | `/api/brands/{id}/brandbrain/compile/{run_id}/status` | `CompileStatusSchema` |
| Get latest snapshot | GET | `/api/brands/{id}/brandbrain/latest` | `BackendSnapshotResponseSchema` |
| Get snapshot history | GET | `/api/brands/{id}/brandbrain/history` | `SnapshotHistoryResponseSchema` |
| Get overrides | GET | `/api/brands/{id}/brandbrain/overrides` | `BrandBrainOverridesSchema` |
| Patch overrides | PATCH | `/api/brands/{id}/brandbrain/overrides` | `BrandBrainOverridesSchema` |

---

## 4. Final Zod Schemas

### CompileStatus
```typescript
export const CompileStatusValueSchema = z.enum([
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export const CompileProgressSchema = z.object({
  stage: z.string().optional(),
  sources_completed: z.number(),
  sources_total: z.number(),
});

export const EvidenceStatusSchema = z.object({
  total: z.number().optional(),
  completed: z.number().optional(),
  failed: z.number().optional(),
}).passthrough();

export const CompileStatusSchema = z.object({
  compile_run_id: z.string(),
  status: CompileStatusValueSchema,
  progress: CompileProgressSchema.optional(),
  evidence_status: EvidenceStatusSchema.optional(),
  snapshot: z.object({
    snapshot_id: z.string(),
    created_at: z.string(),
    snapshot_json: z.record(z.string(), z.unknown()),
  }).optional(),
  error: z.string().optional(),
});
```

### Snapshot (Backend Response)
```typescript
export const BackendSnapshotResponseSchema = z.object({
  snapshot_id: z.string(),
  brand_id: z.string(),
  snapshot_json: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  compile_run_id: z.string().optional(),
});
```

### Overrides
```typescript
export const BrandBrainOverridesSchema = z.object({
  brand_id: z.string(),
  overrides_json: z.record(z.string(), z.unknown()),
  pinned_paths: z.array(z.string()),
  updated_at: z.string().nullable(),
});

export const OverridesPatchRequestSchema = z.object({
  overrides_json: z.record(z.string(), z.unknown()).optional(),
  pinned_paths: z.array(z.string()).optional(),
});
```

### History
```typescript
export const SnapshotHistoryItemSchema = z.object({
  snapshot_id: z.string(),
  created_at: z.string(),
  diff_summary: z.record(z.string(), z.unknown()).optional(),
});

export const SnapshotHistoryResponseSchema = z.object({
  snapshots: z.array(SnapshotHistoryItemSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
});
```

---

## 5. Expected `.env.local` for Real Mode

```bash
# API mode: "mock" (default) or "real" for backend connection
NEXT_PUBLIC_API_MODE=real

# Backend base URL (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Optional: Enable dev-only features like force refresh
NEXT_PUBLIC_BRANDBRAIN_DEV_MODE=true
```

---

## 6. curl Commands for Critical Flows

### 6.a Create Brand + Onboarding + Sources

```bash
# 1. Create a brand
curl -X POST http://localhost:8000/api/brands \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Brand", "website_url": "https://example.com"}'
# Response: {"id": "brand_xxx", "name": "Test Brand", ...}

# 2. Save onboarding answers
curl -X PUT http://localhost:8000/api/brands/brand_xxx/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "tier": 0,
    "answers_json": {
      "tier0.what_we_do": "We make software",
      "tier0.who_for": "Developers",
      "tier0.primary_goal": "engagement",
      "tier0.cta_posture": "balanced"
    }
  }'

# 3. Add a source
curl -X POST http://localhost:8000/api/brands/brand_xxx/sources \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "capability": "posts",
    "identifier": "https://www.instagram.com/testbrand/",
    "is_enabled": true
  }'
```

### 6.b Trigger Compile + Poll Status

```bash
# 1. Trigger compile
curl -X POST http://localhost:8000/api/brands/brand_xxx/brandbrain/compile \
  -H "Content-Type: application/json" \
  -d '{"force_refresh": false}'
# Response: {"compile_run_id": "run_xxx", "status": "PENDING", "poll_url": "..."}

# 2. Poll status (repeat until SUCCEEDED or FAILED)
curl http://localhost:8000/api/brands/brand_xxx/brandbrain/compile/run_xxx/status
# Response: {"compile_run_id": "run_xxx", "status": "RUNNING", "progress": {"sources_completed": 2, "sources_total": 5}}
# ...
# Response: {"compile_run_id": "run_xxx", "status": "SUCCEEDED", "snapshot": {...}}
```

### 6.c Load Latest + Patch Overrides

```bash
# 1. Get latest snapshot
curl http://localhost:8000/api/brands/brand_xxx/brandbrain/latest
# Response: {"snapshot_id": "snap_xxx", "brand_id": "brand_xxx", "snapshot_json": {...}, "created_at": "..."}

# 2. Get current overrides
curl http://localhost:8000/api/brands/brand_xxx/brandbrain/overrides
# Response: {"brand_id": "brand_xxx", "overrides_json": {}, "pinned_paths": [], "updated_at": null}

# 3. Set an override (merges with existing)
curl -X PATCH http://localhost:8000/api/brands/brand_xxx/brandbrain/overrides \
  -H "Content-Type: application/json" \
  -d '{
    "overrides_json": {"positioning.what_we_do": "Custom description"},
    "pinned_paths": ["positioning.what_we_do"]
  }'
# Response: {"brand_id": "brand_xxx", "overrides_json": {"positioning.what_we_do": "Custom description"}, "pinned_paths": ["positioning.what_we_do"], "updated_at": "..."}

# 4. Remove an override (null deletes)
curl -X PATCH http://localhost:8000/api/brands/brand_xxx/brandbrain/overrides \
  -H "Content-Type: application/json" \
  -d '{
    "overrides_json": {"positioning.what_we_do": null},
    "pinned_paths": []
  }'
# Response: {"brand_id": "brand_xxx", "overrides_json": {}, "pinned_paths": [], "updated_at": "..."}
```

---

## 7. Files Modified

| File | Changes |
|------|---------|
| `ui/src/contracts/brandbrain.ts` | Fixed schemas: CompileStatus, Overrides, added BackendSnapshotResponse, SnapshotHistory, CompileTriggerResponse, transformBackendSnapshot helper |
| `ui/src/lib/api/client.ts` | Fixed compile status path, updated return types |
| `ui/src/lib/api/index.ts` | Updated interface types |
| `ui/src/lib/api/mockBrandBrain.ts` | Updated to return backend-compatible shapes |
| `ui/src/components/onboarding/CompilePanel.tsx` | Handle PENDING status, sources_completed/sources_total progress, UNCHANGED short-circuit |
| `ui/src/components/brandbrain/BrandBrainClient.tsx` | Use transformBackendSnapshot, new overrides patch semantics |
| `ui/src/app/brands/[brandId]/strategy/page.tsx` | Transform backend snapshot before passing to component |
| `ui/scripts/brandbrain-integration-sanity.ts` | **NEW** - Integration test script |

---

## 8. Running the Sanity Test

```bash
cd ui

# With backend running on localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npx ts-node scripts/brandbrain-integration-sanity.ts

# With a specific brand ID
BRAND_ID=brand_123 NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npx ts-node scripts/brandbrain-integration-sanity.ts
```

The script will:
1. Create or find a test brand
2. Test all 6 BrandBrain endpoints
3. Validate responses against Zod schemas
4. Report pass/fail with detailed validation errors
