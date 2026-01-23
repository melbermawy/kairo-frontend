/**
 * Supabase Browser Client
 *
 * Phase 1: Authentication System
 *
 * This client is used in browser/client components for:
 * - User authentication (sign up, sign in, sign out)
 * - Session management
 * - Real-time subscriptions (if needed)
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not configured. Auth will not work. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// Singleton instance for browser client to ensure consistent session state
let browserClient: SupabaseClient | null = null;

/**
 * Create a Supabase client for browser usage.
 * Uses singleton pattern to ensure consistent session state across the app.
 * This should be called in client components.
 */
export function createClient() {
  if (typeof window === "undefined") {
    // Server-side: always create new instance (should use server.ts instead)
    return createBrowserClient(supabaseUrl || "", supabaseAnonKey || "");
  }

  // Client-side: use singleton
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl || "", supabaseAnonKey || "");
  }
  return browserClient;
}
