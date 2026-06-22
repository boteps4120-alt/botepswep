import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getRuntimeCourse, getRuntimeNextCourse } from "@/lib/server-courses";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { trackCourseEvent } from "../actions";
import type { CourseComment } from "./engagement-panel";
import { WatchPlayer } from "./watch-player";

export const dynamic = "force-dynamic";

type ProfileRow = {
  role: string;
};

type BookmarkRow = {
  course_id: string;
};

type CourseIdRow = {
  id: string;
};

type LikeRow = {
  user_id: string;
};

type CommentRow = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getRuntimeCourse(slug);

  if (!course) {
    notFound();
  }

  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (hasSupabaseEnv() && course.isPremium && !user) {
    await trackCourseEvent(course.slug, "premium_click");
    redirect(`/login?next=/watch/${course.slug}`);
  }

  const [{ data: subscription }, { data: profile }, { data: bookmark }] =
    supabase && user
      ? await Promise.all([
          supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle<{ status: string }>(),
          supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>(),
          supabase
            .from("bookmarks")
            .select("course_id,courses!inner(slug)")
            .eq("user_id", user.id)
            .eq("courses.slug", course.slug)
            .maybeSingle<BookmarkRow>()
        ])
      : [{ data: null }, { data: null }, { data: null }];

  const isAdmin = profile?.role === "admin";
  const hasAccess = !course.isPremium || !hasSupabaseEnv() || isAdmin || subscription?.status === "active";

  if (!hasAccess) {
    await trackCourseEvent(course.slug, "premium_click");

    return (
      <section className="page-shell">
        <div className="page-title access-denied-copy">
          <p className="eyebrow">구독자 전용 강의</p>
          <h1>구독 권한이 필요합니다</h1>
          <p>
            <strong>{course.title}</strong> 강의는 구독 회원에게 제공됩니다. 구독을 활성화한 뒤 다시 시도해주세요.
          </p>
          <div className="form-actions">
            <Link className="icon-button primary large" href="/subscribe">
              구독 안내 보기
              <ArrowRight size={18} />
            </Link>
            <Link className="icon-button subtle large" href="/courses">
              강의 목록으로 이동
            </Link>
          </div>
        </div>
      </section>
    );
  }

  await trackCourseEvent(course.slug, "course_view");

  let initialLiked = false;
  let initialLikeCount = 0;
  let initialComments: CourseComment[] = [];

  if (supabase) {
    const decodedSlug = decodeURIComponent(course.slug);
    const { data: courseRow } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", decodedSlug)
      .maybeSingle<CourseIdRow>();

    const courseId = courseRow?.id;

    if (courseId) {
      const [likeCountResult, likeResult, commentsResult] = await Promise.all([
        supabase.from("course_likes").select("*", { count: "exact", head: true }).eq("course_id", courseId),
        user
          ? supabase.from("course_likes").select("user_id").eq("course_id", courseId).eq("user_id", user.id).maybeSingle<LikeRow>()
          : Promise.resolve({ data: null }),
        supabase
          .from("course_comments")
          .select("id,author_name,body,created_at")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false })
          .limit(20)
      ]);

      initialLiked = Boolean(likeResult.data);
      initialLikeCount = likeCountResult.count ?? 0;
      initialComments = ((commentsResult.data ?? []) as CommentRow[]).map((item) => ({
        id: item.id,
        authorName: item.author_name,
        body: item.body,
        createdAt: item.created_at
      }));
    }
  }

  return (
    <WatchPlayer
      key={course.slug}
      course={course}
      initialBookmarked={Boolean(bookmark)}
      initialComments={initialComments}
      initialLiked={initialLiked}
      initialLikeCount={initialLikeCount}
      nextCourse={await getRuntimeNextCourse(course.slug)}
    />
  );
}
