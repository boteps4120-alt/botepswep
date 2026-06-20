"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CourseEventType = "course_view" | "play_start" | "watch_complete" | "premium_click" | "bookmark_add";

async function findCourseId(supabase: Awaited<ReturnType<typeof createClient>>, slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const { data: decodedCourse } = await supabase.from("courses").select("id").eq("slug", decodedSlug).maybeSingle<{ id: string }>();
  const { data: rawCourse } = decodedCourse
    ? { data: null }
    : await supabase.from("courses").select("id").eq("slug", slug).maybeSingle<{ id: string }>();

  return decodedCourse?.id ?? rawCourse?.id ?? null;
}

export async function trackCourseEvent(slug: string, eventType: CourseEventType) {
  if (!hasSupabaseEnv()) return;

  const supabase = await createClient();
  const courseId = await findCourseId(supabase, slug);
  if (!courseId) return;

  const { data: authData } = await supabase.auth.getUser();

  await supabase.from("course_events").insert({
    course_id: courseId,
    user_id: authData.user?.id ?? null,
    event_type: eventType
  });
}

export async function saveWatchProgress(slug: string, progressPercent: number, lastPositionSeconds = 0, completed = false) {
  if (!hasSupabaseEnv()) return;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return;

  const courseId = await findCourseId(supabase, slug);

  if (!courseId) return;

  await supabase.from("watch_progress").upsert({
    user_id: user.id,
    course_id: courseId,
    last_position_seconds: Math.max(0, Math.round(lastPositionSeconds)),
    progress_percent: Math.min(100, Math.max(1, Math.round(progressPercent))),
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  });

  if (completed) {
    await supabase.from("course_events").insert({
      course_id: courseId,
      user_id: user.id,
      event_type: "watch_complete"
    });
  }

  revalidatePath("/mypage");
}
