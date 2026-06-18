import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { getRuntimeCourse, getRuntimeNextCourse } from "@/lib/server-courses";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { WatchPlayer } from "./watch-player";

export const dynamic = "force-dynamic";

type SubscriptionRow = {
  status: string;
};

type ProfileRow = {
  role: string;
};

type BookmarkRow = {
  course_id: string;
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
    redirect(`/login?next=/watch/${course.slug}`);
  }

  const [{ data: subscription }, { data: profile }, { data: bookmark }] =
    supabase && user
      ? await Promise.all([
          supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle<SubscriptionRow>(),
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
    return (
      <section className="page-shell">
        <div className="page-title">
          <p className="eyebrow">구독 전용 강의</p>
          <h1>{course.title}</h1>
          <p>이 강의는 월구독 회원에게 제공됩니다. 구독 결제 연동 전까지는 관리자 화면에서 구독 상태를 active로 바꾸면 접근 테스트가 가능합니다.</p>
        </div>

        <section className="player-panel">
          <div className="metric-card">
            <LockKeyhole size={28} color="#d33333" />
            <span className="stat-label">현재 구독 상태</span>
            <strong>{subscription?.status ?? "inactive"}</strong>
          </div>
          <div className="form-actions">
            <Link className="icon-button primary large" href="/subscribe">
              월구독 안내 보기
            </Link>
            <Link className="icon-button subtle large" href="/courses">
              강의 목록으로 이동
            </Link>
          </div>
        </section>
      </section>
    );
  }

  return <WatchPlayer course={course} initialBookmarked={Boolean(bookmark)} nextCourse={await getRuntimeNextCourse(course.slug)} />;
}
