"use client";

import { useState, useCallback } from "react";
import { KButton, KCard, KTag } from "@/components/ui";
import { api } from "@/lib/api";
import { env } from "@/lib/env";
import {
  type SourceConnection,
  type SourcePlatform,
  type SourceCapability,
  PlatformCapabilities,
} from "@/contracts";
import { AddSourceModal } from "./AddSourceModal";

interface SourcesManagerProps {
  brandId: string;
  sources: SourceConnection[];
  onSourceAdded: (source: SourceConnection) => void;
  onSourceUpdated: (source: SourceConnection) => void;
  onSourceDeleted: (sourceId: string) => void;
}

const PLATFORM_LABELS: Record<SourcePlatform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  web: "Website",
};

const CAPABILITY_LABELS: Record<SourceCapability, string> = {
  posts: "Posts",
  reels: "Reels",
  company_posts: "Company Posts",
  profile_posts: "Profile Posts",
  profile_videos: "Videos",
  channel_videos: "Channel Videos",
  crawl_pages: "Web Pages",
};

export function SourcesManager({
  brandId,
  sources,
  onSourceAdded,
  onSourceUpdated,
  onSourceDeleted,
}: SourcesManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSourceId, setLoadingSourceId] = useState<string | null>(null);

  const handleToggleSource = useCallback(
    async (source: SourceConnection) => {
      setLoadingSourceId(source.id);
      try {
        const updated = await api.updateSource(source.id, {
          is_enabled: !source.is_enabled,
        });
        onSourceUpdated(updated);
      } catch (err) {
        console.error("Failed to toggle source:", err);
      } finally {
        setLoadingSourceId(null);
      }
    },
    [onSourceUpdated]
  );

  const handleDeleteSource = useCallback(
    async (sourceId: string) => {
      if (!confirm("Are you sure you want to remove this source?")) return;

      setLoadingSourceId(sourceId);
      try {
        await api.deleteSource(sourceId);
        onSourceDeleted(sourceId);
      } catch (err) {
        console.error("Failed to delete source:", err);
      } finally {
        setLoadingSourceId(null);
      }
    },
    [onSourceDeleted]
  );

  const enabledCount = sources.filter((s) => s.is_enabled).length;

  // Filter out LinkedIn profile posts if feature flag is off
  const visibleSources = sources.filter((s) => {
    if (s.platform === "linkedin" && s.capability === "profile_posts") {
      return env.featureLiProfilePosts;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-kairo-fg mb-1">
          Connected Sources
        </h2>
        <p className="text-[13px] text-kairo-fg-muted">
          Connect your social accounts and website for Kairo to analyze.
        </p>
      </div>

      {/* Sources list */}
      <div className="space-y-3">
        {visibleSources.length === 0 ? (
          <div className="text-center py-8 text-kairo-fg-muted text-[13px]">
            <p>No sources connected yet.</p>
            <p className="mt-1 text-kairo-fg-subtle">
              Add at least one source to enable BrandBrain compilation.
            </p>
          </div>
        ) : (
          visibleSources.map((source) => (
            <div
              key={source.id}
              className={`
                flex items-center gap-4 p-4 rounded-lg border transition-all
                ${
                  source.is_enabled
                    ? "bg-kairo-bg-card border-kairo-border-subtle"
                    : "bg-kairo-bg-app border-kairo-border-subtle opacity-60"
                }
              `}
            >
              {/* Platform icon placeholder */}
              <div className="w-10 h-10 rounded-lg bg-kairo-bg-elevated flex items-center justify-center">
                <PlatformIcon platform={source.platform} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-kairo-fg">
                    {PLATFORM_LABELS[source.platform]}
                  </span>
                  <KTag variant="default" className="text-[10px]">
                    {CAPABILITY_LABELS[source.capability]}
                  </KTag>
                </div>
                <p className="text-[12px] text-kairo-fg-muted truncate mt-0.5">
                  {source.identifier}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSource(source)}
                  disabled={loadingSourceId === source.id}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${
                      source.is_enabled
                        ? "bg-kairo-accent-500"
                        : "bg-kairo-bg-elevated"
                    }
                    ${loadingSourceId === source.id ? "opacity-50" : ""}
                  `}
                  aria-label={source.is_enabled ? "Disable source" : "Enable source"}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                      ${source.is_enabled ? "left-6" : "left-1"}
                    `}
                  />
                </button>

                <button
                  onClick={() => handleDeleteSource(source.id)}
                  disabled={loadingSourceId === source.id}
                  className="
                    p-1.5 rounded-lg text-kairo-fg-muted hover:text-kairo-error-fg
                    hover:bg-kairo-error-bg transition-colors
                  "
                  aria-label="Delete source"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add source button */}
      <KButton variant="secondary" onClick={() => setIsModalOpen(true)}>
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Source
      </KButton>

      {/* Status summary */}
      <div className="text-[12px] text-kairo-fg-subtle">
        {enabledCount} of {visibleSources.length} sources enabled
      </div>

      {/* Add source modal */}
      <AddSourceModal
        brandId={brandId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSourceAdded={onSourceAdded}
      />
    </div>
  );
}

// Simple platform icon component
function PlatformIcon({ platform }: { platform: SourcePlatform }) {
  const iconClass = "w-5 h-5 text-kairo-fg-muted";

  switch (platform) {
    case "instagram":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "web":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      );
    default:
      return null;
  }
}

SourcesManager.displayName = "SourcesManager";
