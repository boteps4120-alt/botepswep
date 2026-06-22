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

export async function toggleCourseLike(slug: string, shouldLike: boolean) {
  if (!hasSupabaseEnv()) {
    return { ok: false, liked: false, message: "Supabase 연결 후 좋아요를 사용할 수 있습니다." };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { ok: false, liked: false, message: "로그인 후 좋아요를 누를 수 있습니다." };
  }

  const courseId = await findCourseId(supabase, slug);
  if (!courseId) {
    return { ok: false, liked: false, message: "강의를 찾을 수 없습니다." };
  }

  const { error } = shouldLike
    ? await supabase.from("course_likes").upsert({ user_id: user.id, course_id: courseId })
    : await supabase.from("course_likes").delete().eq("user_id", user.id).eq("course_id", courseId);

  if (error) {
    return { ok: false, liked: !shouldLike, message: "좋아요 저장에 실패했습니다. Supabase 테이블 설정을 확인해주세요." };
  }

  revalidatePath(`/watch/${slug}`);

  return { ok: true, liked: shouldLike, message: shouldLike ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다." };
}

export async function addCourseComment(slug: string, body: string, parentCommentId?: string) {
  const trimmedBody = body.trim();

  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase 연결 후 댓글을 사용할 수 있습니다." };
  }

  if (!trimmedBody) {
    return { ok: false, message: "댓글 내용을 입력해주세요." };
  }

  if (trimmedBody.length > 500) {
    return { ok: false, message: "댓글은 500자 이내로 입력해주세요." };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { ok: false, message: "로그인 후 댓글을 작성할 수 있습니다." };
  }

  const courseId = await findCourseId(supabase, slug);
  if (!courseId) {
    return { ok: false, message: "강의를 찾을 수 없습니다." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,full_name,email")
    .eq("id", user.id)
    .maybeSingle<{ display_name: string | null; full_name: string | null; email: string | null }>();

  const authorName = profile?.full_name || profile?.display_name || profile?.email?.split("@")[0] || "BOTEPS 회원";

  const { error } = await supabase.from("course_comments").insert({
    course_id: courseId,
    parent_comment_id: parentCommentId || null,
    user_id: user.id,
    author_name: authorName,
    body: trimmedBody
  });

  if (error) {
    return { ok: false, message: "댓글 저장에 실패했습니다. Supabase 테이블 설정을 확인해주세요." };
  }

  revalidatePath(`/watch/${slug}`);

  return { ok: true, message: "댓글이 등록되었습니다." };
}

export async function updateCourseComment(slug: string, commentId: string, body: string) {
  const trimmedBody = body.trim();

  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase 연결 후 댓글을 수정할 수 있습니다." };
  }

  if (!trimmedBody) {
    return { ok: false, message: "수정할 댓글 내용을 입력해주세요." };
  }

  if (trimmedBody.length > 500) {
    return { ok: false, message: "댓글은 500자 이내로 입력해주세요." };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { ok: false, message: "로그인 후 댓글을 수정할 수 있습니다." };
  }

  const { error } = await supabase
    .from("course_comments")
    .update({ body: trimmedBody, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: "댓글 수정에 실패했습니다." };
  }

  revalidatePath(`/watch/${slug}`);

  return { ok: true, message: "댓글이 수정되었습니다." };
}

export async function deleteCourseComment(slug: string, commentId: string) {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase 연결 후 댓글을 삭제할 수 있습니다." };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { ok: false, message: "로그인 후 댓글을 삭제할 수 있습니다." };
  }

  const { error } = await supabase.from("course_comments").delete().eq("id", commentId);

  if (error) {
    return { ok: false, message: "댓글 삭제에 실패했습니다." };
  }

  revalidatePath(`/watch/${slug}`);

  return { ok: true, message: "댓글이 삭제되었습니다." };
}
