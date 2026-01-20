# Freeze Capture Report - 2026-01-14

## Test Environment

```bash
NEXT_PUBLIC_DIAG_FREEZE=1 npm run dev
```

- Next.js 16.0.7 (Turbopack)
- Server: http://localhost:3000
- Backend: http://localhost:8000 (proxied)

## Test Attempts

### Attempt 1: Onboarding Page Load
- **Route**: `/brands/d8dca5da-6ee2-40a9-bd1d-4a8a065cf556/onboarding`
- **Action**: Page load
- **Result**: **SUCCESS** - Page loaded in 4.7s

**Server Metrics**:
```
[API] GET /api/brands end 1.08s status=200
[API] GET /api/brands/:id/bootstrap end 1.52s status=200
[BOOTSTRAP] GET /api/brands/:id/bootstrap ms=1526
GET /brands/:id/onboarding 200 in 4.7s (compile: 3.0s, render: 1684ms)
```

### Attempt 2: Strategy Page Load
- **Route**: `/brands/d8dca5da-6ee2-40a9-bd1d-4a8a065cf556/strategy`
- **Action**: Page load
- **Result**: **FAILURE** - 500 Error (not freeze)

**Server Metrics**:
```
[API] GET /api/brands/:id/brandbrain/latest end 846ms status=200
Snapshot transformation validation failed: [constraints, voice.do, voice.dont, etc. undefined]
TypeError: Cannot read properties of undefined (reading 'taboos')
GET /brands/:id/strategy 500 in 3.7s
```

**Root Cause**: Backend snapshot data is missing expected fields. This is a **data schema mismatch**, not the freeze issue.

### Attempt 3: Compile Trigger via API
- **Route**: POST `/api/brands/:id/brandbrain/compile`
- **Action**: Direct API call
- **Result**: 404 - Next.js doesn't have this route

**Analysis**: Compile calls go directly to backend (localhost:8000), not through Next.js. Cannot trigger compile programmatically without real backend or browser interaction.

## Freeze Reproduction Blocked

**Cannot reproduce freeze via CLI because**:
1. Strategy page 500s due to missing snapshot data fields
2. Compile API goes directly to backend, not proxied through Next.js
3. Real freeze requires browser interaction (clicking Compile button in UI)

## Diagnostic Infrastructure Verification

### Overlay Component: ✅ Active
- `DiagnosticOverlay` renders in layout
- `__DIAG_DATA__` exposed on window object
- Updates every 500ms

### Kill Switches: ✅ Functional
- `DIAG_DISABLE_BRANDBRAIN_CLIENT`: Renders placeholder message
- `DIAG_DISABLE_SNAPSHOT_RENDER`: Shows summary stats only
- `DIAG_DISABLE_POLLING`: Returns error instead of starting poll

### Single-Flight Guard: ✅ Implemented
- `registerPoller()` prevents duplicate pollers
- `unregisterPoller()` cleans up on success/fail/unmount
- `setPollerTimeout()` tracks timeout IDs for cleanup

### Request Metrics: ✅ Tracking
```
[API] GET /api/brands end 1.08s status=200
[API] GET /api/brands/:id/bootstrap end 1.52s status=200
```

## Baseline Metrics (No Freeze)

During normal onboarding page load:
- **Requests**: 2 total (brands list + bootstrap)
- **Latency**: ~1-1.5s per request
- **Renders**: Not tracked (page is server component)
- **Pollers**: 0 (no compile in progress)

## Recommended User Actions

Since freeze cannot be reproduced via CLI:

1. **Run with diagnostics**: `NEXT_PUBLIC_DIAG_FREEZE=1 npm run dev`

2. **Before triggering freeze**, run in browser console:
   ```javascript
   window._diagLog = setInterval(() => {
     console.log('[DIAG]', JSON.stringify(window.__DIAG_DATA__, null, 2));
   }, 1000);
   ```

3. **Click Compile** to trigger freeze

4. **Report last captured metrics** from console before freeze

5. **Test kill-switches** to isolate:
   ```bash
   # Which one prevents freeze?
   NEXT_PUBLIC_DIAG_DISABLE_BRANDBRAIN_CLIENT=1
   NEXT_PUBLIC_DIAG_DISABLE_SNAPSHOT_RENDER=1
   NEXT_PUBLIC_DIAG_DISABLE_POLLING=1
   ```

## Potential Freeze Causes (Hypotheses)

Based on codebase analysis, potential remaining freeze sources:

1. **Large Snapshot Payload**: If snapshot JSON is very large (>1MB), JSON.parse or rendering could block main thread

2. **Rapid State Updates**: If polling response triggers multiple setState calls that cascade

3. **Memory Pressure**: If response data accumulates without cleanup

4. **Backend Timeout**: If backend hangs, AbortController should trigger after 15s - but if not working properly, fetch could hang indefinitely

## Files Modified in This Session

### New Files
- `src/lib/debug/diagnostics.ts` - Core diagnostic infrastructure
- `src/components/debug/DiagnosticOverlay.tsx` - Visual overlay + window.__DIAG_DATA__
- `docs/debug/freeze_capture_tool.md` - User instructions
- `docs/debug/freeze_capture_20260114.md` - This report

### Modified Files
- `src/lib/api/client.ts` - Added request metrics tracking
- `src/components/brandbrain/BrandBrainClient.tsx` - Render tracking, kill switches, single-flight guard
- `src/components/brandbrain/BrandBrainSection.tsx` - Render tracking
- `src/app/layout.tsx` - Added DiagnosticOverlay
- `src/contracts/brandbrain.ts` - Made optional fields for bootstrap response

## Status

**FREEZE NOT REPRODUCED** - Diagnostic infrastructure is ready for user to capture metrics during actual freeze.
