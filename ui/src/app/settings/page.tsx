"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { realApi } from "@/lib/api/client";
import type { UserAPIKeysStatus, ValidateAPIKeysResponse } from "@/contracts";

type KeyField = "apify" | "openai";

interface ValidationState {
  apify: { valid: boolean | null; error: string | null; testing: boolean };
  openai: { valid: boolean | null; error: string | null; testing: boolean };
}

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<UserAPIKeysStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state - these are the NEW values being entered
  const [apifyToken, setApifyToken] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");

  // Track which fields have been modified
  const [dirtyFields, setDirtyFields] = useState<Set<KeyField>>(new Set());

  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    apify: { valid: null, error: null, testing: false },
    openai: { valid: null, error: null, testing: false },
  });

  // Load current status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await realApi.getApiKeysStatus();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load API keys status:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const markDirty = (field: KeyField) => {
    setDirtyFields((prev) => new Set(prev).add(field));
    // Clear validation when field changes
    setValidation((prev) => ({
      ...prev,
      [field]: { valid: null, error: null, testing: false },
    }));
  };

  const validateKey = async (field: KeyField) => {
    const value = field === "apify" ? apifyToken : openaiKey;
    if (!value.trim()) {
      setValidation((prev) => ({
        ...prev,
        [field]: { valid: false, error: "Key cannot be empty", testing: false },
      }));
      return false;
    }

    setValidation((prev) => ({
      ...prev,
      [field]: { ...prev[field], testing: true },
    }));

    try {
      const payload = field === "apify"
        ? { apify_token: value }
        : { openai_key: value };

      const result = await realApi.validateApiKeys(payload);

      const isValid = field === "apify" ? result.apify_valid : result.openai_valid;
      const errorMsg = field === "apify" ? result.apify_error : result.openai_error;

      setValidation((prev) => ({
        ...prev,
        [field]: { valid: isValid ?? false, error: errorMsg, testing: false },
      }));

      return isValid ?? false;
    } catch (err) {
      console.error(`Failed to validate ${field} key:`, err);
      setValidation((prev) => ({
        ...prev,
        [field]: { valid: false, error: "Validation failed", testing: false },
      }));
      return false;
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const payload: { apify_token?: string | null; openai_key?: string | null } = {};

      // Only include fields that have been modified
      if (dirtyFields.has("apify")) {
        payload.apify_token = apifyToken.trim() || null;
      }
      if (dirtyFields.has("openai")) {
        payload.openai_key = openaiKey.trim() || null;
      }

      if (Object.keys(payload).length === 0) {
        setError("No changes to save");
        return;
      }

      const newStatus = await realApi.saveApiKeys(payload);
      setStatus(newStatus);
      setDirtyFields(new Set());
      setApifyToken("");
      setOpenaiKey("");
      setSuccessMessage("API keys saved successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save API keys:", err);
      setError("Failed to save API keys. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearKey = async (field: KeyField) => {
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const payload = field === "apify"
        ? { apify_token: null }
        : { openai_key: null };

      const newStatus = await realApi.saveApiKeys(payload);
      setStatus(newStatus);
      setSuccessMessage(`${field === "apify" ? "Apify" : "OpenAI"} key cleared`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(`Failed to clear ${field} key:`, err);
      setError("Failed to clear key. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-kairo-bg-app flex items-center justify-center">
        <div className="text-kairo-fg-muted">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kairo-bg-app">
      {/* Header */}
      <div className="border-b border-kairo-border-subtle bg-kairo-bg-panel">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-kairo-fg-muted hover:text-kairo-fg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-kairo-fg">Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        {/* API Keys Section */}
        <section className="bg-kairo-bg-panel border border-kairo-border-subtle rounded-lg p-6">
          <h2 className="text-lg font-medium text-kairo-fg mb-2">API Keys</h2>
          <p className="text-sm text-kairo-fg-muted mb-6">
            Configure your own API keys for external services. When set, Kairo will use your keys
            instead of the shared demo keys.
          </p>

          {/* Apify Token */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-kairo-fg mb-2">
              Apify API Token
            </label>
            <p className="text-xs text-kairo-fg-muted mb-2">
              Used for fetching social media content. Get your token from{" "}
              <a
                href="https://console.apify.com/account/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-kairo-accent-400 hover:underline"
              >
                Apify Console
              </a>
            </p>

            {status?.has_apify_token && !dirtyFields.has("apify") ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 px-3 py-2 bg-kairo-bg-elevated border border-kairo-border-subtle rounded-md text-kairo-fg-muted">
                  ••••••••••••{status.apify_last4}
                </div>
                <button
                  onClick={() => handleClearKey("apify")}
                  disabled={isSaving}
                  className="px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    markDirty("apify");
                  }}
                  className="px-3 py-2 text-sm text-kairo-accent-400 hover:text-kairo-accent-300 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apifyToken}
                    onChange={(e) => {
                      setApifyToken(e.target.value);
                      markDirty("apify");
                    }}
                    placeholder="apify_api_..."
                    className="flex-1 px-3 py-2 bg-kairo-bg-elevated border border-kairo-border-subtle rounded-md text-kairo-fg placeholder:text-kairo-fg-muted focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50"
                  />
                  <button
                    onClick={() => validateKey("apify")}
                    disabled={!apifyToken.trim() || validation.apify.testing}
                    className="px-4 py-2 text-sm bg-kairo-bg-hover text-kairo-fg rounded-md hover:bg-kairo-bg-elevated transition-colors disabled:opacity-50"
                  >
                    {validation.apify.testing ? "Testing..." : "Test"}
                  </button>
                </div>
                {validation.apify.valid !== null && (
                  <div
                    className={`text-xs ${
                      validation.apify.valid ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {validation.apify.valid
                      ? "Key is valid"
                      : validation.apify.error || "Key is invalid"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OpenAI Key */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-kairo-fg mb-2">
              OpenAI API Key
            </label>
            <p className="text-xs text-kairo-fg-muted mb-2">
              Used for AI-powered content generation. Get your key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-kairo-accent-400 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>

            {status?.has_openai_key && !dirtyFields.has("openai") ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 px-3 py-2 bg-kairo-bg-elevated border border-kairo-border-subtle rounded-md text-kairo-fg-muted">
                  ••••••••••••{status.openai_last4}
                </div>
                <button
                  onClick={() => handleClearKey("openai")}
                  disabled={isSaving}
                  className="px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    markDirty("openai");
                  }}
                  className="px-3 py-2 text-sm text-kairo-accent-400 hover:text-kairo-accent-300 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => {
                      setOpenaiKey(e.target.value);
                      markDirty("openai");
                    }}
                    placeholder="sk-..."
                    className="flex-1 px-3 py-2 bg-kairo-bg-elevated border border-kairo-border-subtle rounded-md text-kairo-fg placeholder:text-kairo-fg-muted focus:outline-none focus:ring-2 focus:ring-kairo-accent-500/50"
                  />
                  <button
                    onClick={() => validateKey("openai")}
                    disabled={!openaiKey.trim() || validation.openai.testing}
                    className="px-4 py-2 text-sm bg-kairo-bg-hover text-kairo-fg rounded-md hover:bg-kairo-bg-elevated transition-colors disabled:opacity-50"
                  >
                    {validation.openai.testing ? "Testing..." : "Test"}
                  </button>
                </div>
                {validation.openai.valid !== null && (
                  <div
                    className={`text-xs ${
                      validation.openai.valid ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {validation.openai.valid
                      ? "Key is valid"
                      : validation.openai.error || "Key is invalid"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save Button */}
          {dirtyFields.size > 0 && (
            <div className="flex justify-end pt-4 border-t border-kairo-border-subtle">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-kairo-accent-500 text-white rounded-md hover:bg-kairo-accent-600 transition-colors disabled:opacity-50 font-medium"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </section>

        {/* Demo Mode Info */}
        <section className="mt-6 p-4 bg-kairo-bg-panel/50 border border-kairo-border-subtle rounded-lg">
          <h3 className="text-sm font-medium text-kairo-fg mb-2">Demo Mode</h3>
          <p className="text-xs text-kairo-fg-muted">
            {status?.has_apify_token && status?.has_openai_key ? (
              <>
                You have both API keys configured. Kairo will use your personal keys for all
                operations, giving you full access without demo limitations.
              </>
            ) : (
              <>
                When API keys are not configured, Kairo runs in Demo Mode with shared resources.
                Configure your own keys above to unlock full functionality and avoid rate limits.
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
