import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getRuntimeCourse, getRuntimeNextCourse } from "@/lib/server-courses";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { WatchPlayer } from "./watch-player";

export const dynamic = "force-dynamic";

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

  return <WatchPlayer key={course.slug} course={course} initialBookmarked={Boolean(bookmark)} nextCourse={await getRuntimeNextCourse(course.slug)} />;
}
