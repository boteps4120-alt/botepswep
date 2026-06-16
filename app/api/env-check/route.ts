import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function GET() {
  return NextResponse.json({
    supabaseConfigured: hasSupabaseEnv(),
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabasePublishableKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL)
  });
}
