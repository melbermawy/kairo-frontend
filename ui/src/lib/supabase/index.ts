/**
 * Supabase client exports
 *
 * Phase 1: Authentication System
 */

export { createClient } from "./client";
export { createClient as createServerClient, getServerUser, getServerSession } from "./server";
