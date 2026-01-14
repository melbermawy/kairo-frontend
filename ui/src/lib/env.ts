// src/lib/env.ts
// Centralized environment configuration

export type ApiMode = "mock" | "real";

// Determine if we're running on server or browser
const isServer = typeof window === "undefined";

// Get API base URL with fallback
// Note: Using 0.0.0.0 works for server-side but fails in browser
// Always normalize to localhost for browser compatibility
function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Replace 0.0.0.0 with localhost for browser compatibility
  if (!isServer && configuredUrl.includes("0.0.0.0")) {
    return configuredUrl.replace("0.0.0.0", "localhost");
  }

  return configuredUrl;
}

export const env = {
  // API mode: mock (fixture data) or real (backend HTTP)
  apiMode: (process.env.NEXT_PUBLIC_API_MODE || "mock") as ApiMode,

  // Backend base URL (only used in real mode)
  // Normalized to use localhost in browser (0.0.0.0 doesn't work in browsers)
  apiBaseUrl: getApiBaseUrl(),

  // BrandBrain dev mode (enables force refresh compile, debug tools)
  brandBrainDevMode: process.env.NEXT_PUBLIC_BRANDBRAIN_DEV_MODE === "true",

  // Feature flags
  featureLiProfilePosts: process.env.NEXT_PUBLIC_FEATURE_LI_PROFILE_POSTS === "true",
} as const;

// Log API configuration once on initialization (helps debug connection issues)
let _loggedApiBase = false;
export function logApiBaseOnce(): void {
  if (_loggedApiBase) return;
  _loggedApiBase = true;
  console.log(`[API_BASE] ${isServer ? "server" : "browser"}=${env.apiBaseUrl}`);
}

// Type-safe check for API mode
export function isRealApiMode(): boolean {
  return env.apiMode === "real";
}

export function isMockApiMode(): boolean {
  return env.apiMode === "mock";
}
