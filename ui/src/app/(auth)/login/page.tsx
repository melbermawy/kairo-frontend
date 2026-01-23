"use client";

/**
 * Login Page
 *
 * Phase 1: Authentication System
 *
 * Simple email/password login using Supabase Auth.
 * Redirects to /brands on successful login.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { KButton } from "@/components/ui/KButton";
import { KCard } from "@/components/ui/KCard";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Redirect to home on success
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kairo-bg-app p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-kairo-fg">Kairo</h1>
          <p className="text-kairo-fg-muted mt-2">
            Sign in to your account
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
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-(--kairo-radius-sm) bg-kairo-bg-elevated border border-kairo-border-subtle text-kairo-fg placeholder:text-kairo-fg-subtle focus:outline-none focus:ring-2 focus:ring-kairo-accent-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit button */}
            <KButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign in"}
            </KButton>
          </form>

          {/* Sign up link */}
          <div className="mt-6 pt-5 border-t border-kairo-border-subtle text-center">
            <span className="text-kairo-fg-muted text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-kairo-accent-400 hover:text-kairo-accent-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </span>
          </div>
        </KCard>
      </div>
    </div>
  );
}
