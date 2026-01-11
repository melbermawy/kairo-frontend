"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KButton } from "@/components/ui";
import { api } from "@/lib/api";
import { env } from "@/lib/env";
import {
  type SourceConnection,
  type SourcePlatform,
  type SourceCapability,
  PlatformCapabilities,
} from "@/contracts";

interface AddSourceModalProps {
  brandId: string;
  isOpen: boolean;
  onClose: () => void;
  onSourceAdded: (source: SourceConnection) => void;
}

const PLATFORM_OPTIONS: Array<{ value: SourcePlatform; label: string }> = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "web", label: "Website" },
];

const CAPABILITY_LABELS: Record<SourceCapability, string> = {
  posts: "Posts",
  reels: "Reels",
  company_posts: "Company Posts",
  profile_posts: "Profile Posts",
  profile_videos: "Profile Videos",
  channel_videos: "Channel Videos",
  crawl_pages: "Crawl Pages",
};

const IDENTIFIER_HINTS: Record<SourcePlatform, string> = {
  instagram: "Instagram username or profile URL",
  tiktok: "TikTok username (without @)",
  linkedin: "LinkedIn company page URL",
  youtube: "YouTube channel URL",
  web: "Website URL to crawl",
};

const IDENTIFIER_PLACEHOLDERS: Record<SourcePlatform, string> = {
  instagram: "@username or https://instagram.com/username",
  tiktok: "username",
  linkedin: "https://linkedin.com/company/yourcompany",
  youtube: "https://youtube.com/@yourchannel",
  web: "https://yourwebsite.com",
};

export function AddSourceModal({
  brandId,
  isOpen,
  onClose,
  onSourceAdded,
}: AddSourceModalProps) {
  const [platform, setPlatform] = useState<SourcePlatform | null>(null);
  const [capability, setCapability] = useState<SourceCapability | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPlatform(null);
      setCapability(null);
      setIdentifier("");
      setError(null);
    }
  }, [isOpen]);

  // Auto-select capability if platform has only one option
  useEffect(() => {
    if (platform) {
      let capabilities = PlatformCapabilities[platform];

      // Filter out LinkedIn profile posts if feature flag is off
      if (platform === "linkedin" && !env.featureLiProfilePosts) {
        capabilities = capabilities.filter((c) => c !== "profile_posts");
      }

      if (capabilities.length === 1) {
        setCapability(capabilities[0]);
      } else {
        setCapability(null);
      }
    }
  }, [platform]);

  // Normalize identifier based on platform
  const normalizeIdentifier = useCallback(
    (value: string, plat: SourcePlatform): string => {
      let normalized = value.trim();

      switch (plat) {
        case "tiktok":
          // Strip leading @
          normalized = normalized.replace(/^@/, "");
          break;
        case "instagram":
          // If it's just a handle, convert to URL
          if (!normalized.includes("http") && !normalized.includes("/")) {
            normalized = normalized.replace(/^@/, "");
            normalized = `https://www.instagram.com/${normalized}/`;
          }
          break;
        case "web":
          // Ensure https://
          if (!normalized.startsWith("http")) {
            normalized = `https://${normalized}`;
          }
          break;
      }

      return normalized;
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!platform || !capability || !identifier.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const normalizedId = normalizeIdentifier(identifier, platform);

      const source = await api.createSource(brandId, {
        platform,
        capability,
        identifier: normalizedId,
        is_enabled: true,
      });

      onSourceAdded(source);
      onClose();
    } catch (err) {
      console.error("Failed to create source:", err);
      setError("Failed to add source. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    brandId,
    platform,
    capability,
    identifier,
    normalizeIdentifier,
    onSourceAdded,
    onClose,
  ]);

  // Get available capabilities for selected platform
  const availableCapabilities = platform
    ? PlatformCapabilities[platform].filter((c) => {
        // Filter out LinkedIn profile posts if feature flag is off
        if (platform === "linkedin" && c === "profile_posts") {
          return env.featureLiProfilePosts;
        }
        return true;
      })
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-kairo-bg-panel rounded-xl shadow-2xl border border-kairo-border-subtle"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-kairo-border-subtle">
                <h3 className="text-[16px] font-semibold text-kairo-fg">
                  Add Source
                </h3>
                <p className="text-[12px] text-kairo-fg-muted mt-0.5">
                  Connect a social account or website
                </p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Platform selection */}
                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-kairo-fg">
                    Platform
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORM_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPlatform(opt.value)}
                        className={`
                          px-3 py-2 rounded-lg text-[12px] font-medium transition-all
                          border
                          ${
                            platform === opt.value
                              ? "bg-kairo-accent-500/10 border-kairo-accent-500 text-kairo-fg"
                              : "bg-kairo-bg-elevated border-kairo-border-subtle text-kairo-fg-muted hover:border-kairo-border-strong"
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capability selection */}
                {platform && availableCapabilities.length > 1 && (
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-kairo-fg">
                      Content Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableCapabilities.map((cap) => (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => setCapability(cap)}
                          className={`
                            px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all
                            border
                            ${
                              capability === cap
                                ? "bg-kairo-accent-500/10 border-kairo-accent-500 text-kairo-fg"
                                : "bg-kairo-bg-elevated border-kairo-border-subtle text-kairo-fg-muted hover:border-kairo-border-strong"
                            }
                          `}
                        >
                          {CAPABILITY_LABELS[cap]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Identifier input */}
                {platform && capability && (
                  <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-kairo-fg">
                      {IDENTIFIER_HINTS[platform]}
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={IDENTIFIER_PLACEHOLDERS[platform]}
                      className="
                        w-full px-3 py-2 rounded-lg text-[13px]
                        bg-kairo-bg-elevated border border-kairo-border-subtle
                        text-kairo-fg placeholder:text-kairo-fg-subtle
                        focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50
                      "
                    />
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <p className="text-[12px] text-kairo-error-fg">{error}</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-kairo-border-subtle flex justify-end gap-3">
                <KButton variant="secondary" onClick={onClose}>
                  Cancel
                </KButton>
                <KButton
                  onClick={handleSubmit}
                  disabled={!platform || !capability || !identifier.trim() || isLoading}
                >
                  {isLoading ? "Adding..." : "Add Source"}
                </KButton>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

AddSourceModal.displayName = "AddSourceModal";
