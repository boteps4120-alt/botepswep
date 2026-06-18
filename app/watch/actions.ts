"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function saveWatchProgress(slug: string, progressPercent: number, lastPositionSeconds = 0, completed = false) {
  if (!hasSupabaseEnv()) return;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return;

  const decodedSlug = decodeURIComponent(slug);
  const { data: decodedCourse } = await supabase.from("courses").select("id").eq("slug", decodedSlug).maybeSingle<{ id: string }>();
  const { data: rawCourse } = decodedCourse
    ? { data: null }
    : await supabase.from("courses").select("id").eq("slug", slug).maybeSingle<{ id: string }>();
  const course = decodedCourse ?? rawCourse;

  if (!course) return;

  await supabase.from("watch_progress").upsert({
    user_id: user.id,
    course_id: course.id,
    last_position_seconds: Math.max(0, Math.round(lastPositionSeconds)),
    progress_percent: Math.min(100, Math.max(1, Math.round(progressPercent))),
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  });

  revalidatePath("/mypage");
}
