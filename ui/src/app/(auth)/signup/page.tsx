"use client";

/**
 * Signup Page
 *
 * Phase 1: Authentication System
 *
 * Email/password signup using Supabase Auth.
 * Shows confirmation message after successful signup (email verification).
 */

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { KButton } from "@/components/ui/KButton";
import { KCard } from "@/components/ui/KCard";

export default function SignupPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Show success message
    setSuccess(true);
    setLoading(false);
  };

  // Success state - show confirmation message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kairo-bg-app p-4">
        <div className="w-full max-w-md">
          <KCard elevated>
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-kairo-success-bg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-kairo-success-fg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-kairo-fg mb-2">
                Check your email
              </h2>
              <p className="text-kairo-fg-muted mb-6">
                We&apos;ve sent a confirmation link to{" "}
                <span className="text-kairo-fg font-medium">{email}</span>.
                Click the link to activate your account.
              </p>
              <Link
                href="/login"
                className="text-kairo-accent-400 hover:text-kairo-accent-300 font-medium transition-colors"
              >
                Back to login
              </Link>
            </div>
          </KCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-kairo-bg-app p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-kairo-fg">Kairo</h1>
          <p className="text-kairo-fg-muted mt-2">
            Create your account
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

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-kairo-fg mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 rounded-(--kairo-radius-sm) bg-kairo-bg-elevated border border-kairo-border-subtle text-kairo-fg placeholder:text-kairo-fg-subtle focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-kairo-fg mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-(--kairo-radius-sm) bg-kairo-bg-elevated border border-kairo-border-subtle text-kairo-fg placeholder:text-kairo-fg-subtle focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent transition-all"
                placeholder="At least 8 characters"
              />
            </div>

            {/* Confirm Password field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-kairo-fg mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-(--kairo-radius-sm) bg-kairo-bg-elevated border border-kairo-border-subtle text-kairo-fg placeholder:text-kairo-fg-subtle focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
            </div>

            {/* Submit button */}
            <KButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating account..." : "Create account"}
            </KButton>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-5 border-t border-kairo-border-subtle text-center">
            <span className="text-kairo-fg-muted text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-kairo-accent-400 hover:text-kairo-accent-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </span>
          </div>
        </KCard>
      </div>
    </div>
  );
}
