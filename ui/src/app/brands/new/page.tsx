"use client";

/**
 * Create Brand Page
 *
 * Phase 1: Authentication System
 *
 * Simple form to create a new brand.
 * Redirects to brand's onboarding page after creation.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KButton } from "@/components/ui/KButton";
import { KCard } from "@/components/ui/KCard";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function NewBrandPage() {
  const router = useRouter();
  const { loading: authLoading, session } = useAuth();

  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Wait for auth to initialize before allowing form submission
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kairo-bg-app">
        <div className="text-kairo-fg-muted">Loading...</div>
      </div>
    );
  }

  // Debug: Log session state
  if (!session) {
    console.warn("[NewBrandPage] No session found after auth loaded");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Brand name is required");
      return;
    }

    setLoading(true);

    try {
      const brand = await api.createBrand({
        name: name.trim(),
        website_url: websiteUrl.trim() || undefined,
      });

      // Redirect to the brand's onboarding page
      router.push(`/brands/${brand.id}/onboarding`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create brand");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kairo-bg-app p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-kairo-fg">Create your brand</h1>
          <p className="text-kairo-fg-muted mt-2">
            Let&apos;s get started with your brand&apos;s content strategy
          </p>
        </div>

        <KCard elevated>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="p-3 rounded-(--kairo-radius-sm) bg-kairo-error-bg text-kairo-error-fg text-sm">
                {error}
              </div>
            )}

            {/* Brand name field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-kairo-fg mb-1.5"
              >
                Brand Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2 rounded-(--kairo-radius-sm) bg-kairo-bg-elevated border border-kairo-border-subtle text-kairo-fg placeholder:text-kairo-fg-subtle focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent transition-all"
                placeholder="e.g., Acme Corp"
              />
            </div>

            {/* Website URL field */}
            <div>
              <label
                htmlFor="websiteUrl"
                className="block text-sm font-medium text-kairo-fg mb-1.5"
              >
                Website URL <span className="text-kairo-fg-subtle">(optional)</span>
              </label>
              <input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-(--kairo-radius-sm) bg-kairo-bg-elevated border border-kairo-border-subtle text-kairo-fg placeholder:text-kairo-fg-subtle focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent transition-all"
                placeholder="https://example.com"
              />
            </div>

            {/* Submit button */}
            <KButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Brand"}
            </KButton>
          </form>
        </KCard>
      </div>
    </div>
  );
}
