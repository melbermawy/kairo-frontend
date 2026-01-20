# UI Freeze Diagnosis Report

## Summary

Added diagnostic mode (`NEXT_PUBLIC_DIAG_FREEZE=1`) with:
- Render counters for key components
- Request metrics (count, duration, payload size)
- Kill-switch flags for isolation testing
- Single-flight poller guard

## Test Results

### Environment

```
NEXT_PUBLIC_DIAG_FREEZE=1
npm run dev
```

### Initial Observations

1. **Page loads successfully** - Both onboarding and strategy pages load without freeze
2. **Bootstrap endpoint works** - Single request consolidation is functioning
3. **Timing metrics collected** - API calls tracked with ~1-1.5s response times

### Metrics Before Any Freeze (Baseline)

From server logs:
```
[API] GET /api/brands end 839ms status=200
[API] GET /api/brands/:id/bootstrap end 1.27s status=200
[BOOTSTRAP] GET /api/brands/:id/bootstrap ms=1270
GET /brands/:id/onboarding 200 in 3.9s (compile: 2.5s, render: 1407ms)
```

### Kill-Switch Test Results

| Kill Switch | Flag | Effect |
|-------------|------|--------|
| DIAG_DISABLE_BRANDBRAIN_CLIENT | Disables entire BrandBrain client render | Shows placeholder message |
| DIAG_DISABLE_SNAPSHOT_RENDER | Disables snapshot section rendering | Shows summary stats only |
| DIAG_DISABLE_POLLING | Disables compile polling | Prevents poll loop from starting |

### Root Cause Analysis

The original freeze was caused by **blocking `while` loop** in BrandBrainClient.tsx (fixed in previous session). The current implementation uses:

1. **Non-blocking polling** with `setTimeout` instead of blocking `while`
2. **Exponential backoff** (2s -> 4s -> 8s -> 10s max)
3. **5-minute total timeout** with proper cleanup
4. **Single-flight guard** prevents duplicate pollers
5. **AbortController** for fetch cancellation on unmount

### Diagnostic Mode Files

1. **`src/lib/debug/diagnostics.ts`** - Core diagnostic infrastructure
   - Render tracking (`trackRender`, `getRenderStats`)
   - Request metrics (`trackRequestStart`, `trackRequestEnd`, `getRequestMetrics`)
   - Poller guard (`registerPoller`, `unregisterPoller`, `setPollerTimeout`)
   - Kill switches (`killSwitches.disable*`)

2. **`src/components/debug/DiagnosticOverlay.tsx`** - Visual overlay
   - Shows render counts per component
   - Shows request counts, avg duration, payload sizes
   - Shows active poller count
   - Collapsible UI

### How to Use

1. **Enable diagnostic mode:**
   ```bash
   NEXT_PUBLIC_DIAG_FREEZE=1 npm run dev
   ```

2. **Enable kill switches (test isolation):**
   ```bash
   NEXT_PUBLIC_DIAG_FREEZE=1 \
   NEXT_PUBLIC_DIAG_DISABLE_BRANDBRAIN_CLIENT=1 \
   npm run dev
   ```

3. **View overlay:**
   - Look for green `[DIAG]` badge in bottom-right corner
   - Click to expand/collapse

4. **Check console:**
   - Every 5 seconds: `[DIAG] renders=[...] requests=[...] pollers=N`

### Recommended Next Steps

1. If freeze occurs in production:
   - Enable `NEXT_PUBLIC_DIAG_FREEZE=1`
   - Check overlay metrics before freeze
   - Try each kill switch to isolate component

2. If polling causes issues:
   - Set `NEXT_PUBLIC_DIAG_DISABLE_POLLING=1`
   - Verify freeze stops
   - Check poller guard logs for "Blocked duplicate poller"

3. If render loop detected:
   - Check render counts - >2/sec indicates problem
   - Look for components with rapidly increasing counts

## Files Modified

### New Files
- `src/lib/debug/diagnostics.ts` - Diagnostic infrastructure
- `src/components/debug/DiagnosticOverlay.tsx` - Visual overlay

### Modified Files
- `src/lib/api/client.ts` - Added request metrics tracking
- `src/components/brandbrain/BrandBrainClient.tsx` - Added render tracking, kill switches, single-flight guard
- `src/components/brandbrain/BrandBrainSection.tsx` - Added render tracking
- `src/app/layout.tsx` - Added DiagnosticOverlay
- `src/contracts/brandbrain.ts` - Fixed optional fields for bootstrap response

## Conclusion

**No freeze detected** in current testing with diagnostic mode enabled. The previous blocking loop fix appears to have resolved the core issue. The diagnostic infrastructure is now in place for future debugging.
