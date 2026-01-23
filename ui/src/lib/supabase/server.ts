/**
 * Supabase Server Client
 *
 * Phase 1: Authentication System
 *
 * This client is used in Server Components and Server Actions for:
 * - Reading session/user data
 * - Server-side authentication checks
 *
 * Uses cookies for session storage in SSR context.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for server-side usage.
 * This should be called in Server Components, Server Actions, or Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl || "", supabaseAnonKey || "", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

/**
 * Get the current user from server-side context.
 * Returns null if not authenticated.
 */
export async function getServerUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session from server-side context.
 * Returns null if not authenticated.
 */
export async function getServerSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
