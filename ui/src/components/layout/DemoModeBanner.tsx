"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { realApi } from "@/lib/api/client";
import type { UserAPIKeysStatus } from "@/contracts";

/**
 * DemoModeBanner - Shows when user doesn't have their own API keys configured.
 *
 * Phase 2: BYOK (Bring Your Own Key)
 *
 * This banner appears when:
 * - User is logged in
 * - User hasn't configured their own Apify OR OpenAI API keys
 *
 * It encourages users to configure their own keys for better experience.
 */
export function DemoModeBanner() {
  const [status, setStatus] = useState<UserAPIKeysStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem("demo-mode-banner-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      setIsLoading(false);
      return;
    }

    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await realApi.getApiKeysStatus();
      setStatus(data);
    } catch (err) {
      // If we can't load status, don't show the banner
      console.warn("Could not load API keys status for demo mode banner:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("demo-mode-banner-dismissed", "true");
  };

  // Don't show while loading
  if (isLoading) {
    return null;
  }

  // Don't show if dismissed
  if (isDismissed) {
    return null;
  }

  // Don't show if no status (failed to load or not logged in)
  if (!status) {
    return null;
  }

  // Don't show if user has both keys configured
  if (status.has_apify_token && status.has_openai_key) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-b border-amber-500/30">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-amber-100">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">
              Set up your API keys to unlock full functionality
            </p>
            <p className="text-xs text-amber-200/70 mt-0.5">
              Kairo needs Apify and OpenAI API keys to generate content. Without them, you're in demo mode with limited features.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium rounded-md transition-colors"
          >
            Configure Keys
          </Link>
          <button
            onClick={handleDismiss}
            className="text-amber-300 hover:text-amber-100 p-1.5 rounded transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

DemoModeBanner.displayName = "DemoModeBanner";
