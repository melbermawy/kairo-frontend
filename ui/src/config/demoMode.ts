// src/config/demoMode.ts
// Controls whether the app runs in demo mode with in-memory fixtures
// or connects to a real backend API.

export const demoMode = true;

/**
 * Logs a warning if a write operation is called when not in demo mode.
 * In demo mode, writes are no-ops that only console.log.
 * When demoMode=false, this will warn that real API wiring is needed.
 */
export function assertDemoMode(feature: string): void {
  if (!demoMode) {
    console.warn(
      `[kairo] '${feature}' called but demoMode=false. Wire real API before using.`
    );
  }
}
