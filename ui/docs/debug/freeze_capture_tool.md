# Freeze Capture Tool

## Instructions for User

Since the freeze makes DevTools unresponsive, capture metrics **before** triggering the freeze.

### Method 1: Pre-Freeze Capture (Recommended)

1. Start the app with diagnostic mode:
   ```bash
   NEXT_PUBLIC_DIAG_FREEZE=1 npm run dev
   ```

2. Navigate to the page that causes freeze (strategy or onboarding)

3. **Before clicking Compile**, open browser DevTools console and run:
   ```javascript
   // Start continuous logging
   window._diagInterval = setInterval(() => {
     const data = window.__DIAG_DATA__;
     if (data) {
       console.log('[DIAG SNAPSHOT]', JSON.stringify(data, null, 2));
     }
   }, 1000);
   ```

4. Click Compile to trigger the freeze

5. When unfrozen (or after force-killing browser tab), check console for last captured data

### Method 2: Overlay Screenshot

1. Start with `NEXT_PUBLIC_DIAG_FREEZE=1 npm run dev`
2. Navigate to the problem page
3. The green `[DIAG]` overlay appears in bottom-right
4. **Before clicking Compile**, take a screenshot of the overlay
5. Click Compile
6. If UI freezes, the overlay will stop updating - screenshot shows last good state

### Method 3: Server-Side Logging

The diagnostic logs print to server terminal every 5 seconds:
```
[DIAG] renders=[BrandBrainClient:5 Snapshot:Positioning:3] requests=[bootstrap:2] pollers=0
```

Watch the terminal during freeze to see:
- Render counts spiking
- Request counts increasing
- Poller count > 0 (should be 1 max during compile)

### Kill-Switch Testing

To isolate the freeze source, test with each kill-switch:

```bash
# Test 1: Disable entire BrandBrain client
NEXT_PUBLIC_DIAG_FREEZE=1 NEXT_PUBLIC_DIAG_DISABLE_BRANDBRAIN_CLIENT=1 npm run dev

# Test 2: Disable snapshot rendering (client loads but no data sections)
NEXT_PUBLIC_DIAG_FREEZE=1 NEXT_PUBLIC_DIAG_DISABLE_SNAPSHOT_RENDER=1 npm run dev

# Test 3: Disable polling (compile button shows error instead of polling)
NEXT_PUBLIC_DIAG_FREEZE=1 NEXT_PUBLIC_DIAG_DISABLE_POLLING=1 npm run dev
```

**Which kill-switch stops the freeze = the freeze is in that component.**

## What to Report

Please capture and report:

1. **Route**: Which page (`/brands/:id/strategy` or `/brands/:id/onboarding`)
2. **Action**: What you clicked (Compile, Recompile, etc.)
3. **Overlay Metrics** (if visible):
   - Render counts per component
   - Request counts per endpoint
   - Active pollers count
4. **Server Logs**: Last 20 lines from terminal during freeze
5. **Kill-Switch Results**: Which flag (if any) prevents the freeze

## Expected Values

Normal operation during compile:
- BrandBrainClient renders: 1-5 (should NOT increase rapidly)
- Snapshot:* renders: 1-3 per section
- bootstrap requests: 1
- compile requests: 1
- status requests: increases by 1 every 2-10 seconds (backoff)
- Active pollers: 1 (NEVER more than 1)

**Red flags indicating freeze cause:**
- Renders/sec > 10 for any component = render loop
- Active pollers > 1 = duplicate polling loops
- Status requests > 20 in 30 seconds = missing backoff
- Memory growing in browser = payload too large
