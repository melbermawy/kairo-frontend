// src/lib/env.ts
// Centralized environment configuration

export type ApiMode = "mock" | "real";

export const env = {
  // API mode: mock (fixture data) or real (backend HTTP)
  apiMode: (process.env.NEXT_PUBLIC_API_MODE || "mock") as ApiMode,

  // Backend base URL (only used in real mode)
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",

  // BrandBrain dev mode (enables force refresh compile, debug tools)
  brandBrainDevMode: process.env.NEXT_PUBLIC_BRANDBRAIN_DEV_MODE === "true",

  // Feature flags
  featureLiProfilePosts: process.env.NEXT_PUBLIC_FEATURE_LI_PROFILE_POSTS === "true",
} as const;

// Type-safe check for API mode
export function isRealApiMode(): boolean {
  return env.apiMode === "real";
}

export function isMockApiMode(): boolean {
  return env.apiMode === "mock";
}
