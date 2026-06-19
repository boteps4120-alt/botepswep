import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
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

function subscriptionLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "구독 중";
    case "past_due":
      return "결제 확인 필요";
    case "canceled":
      return "해지됨";
    case "expired":
      return "만료됨";
    case "inactive":
    default:
      return "미구독";
  }
}

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
        <div className="access-denied-layout">
          <div className="page-title access-denied-copy">
            <p className="eyebrow">구독자 전용 강의</p>
            <h1>구독 권한이 필요합니다</h1>
            <p>
              <strong>{course.title}</strong> 강의는 월구독 회원에게 제공됩니다. 지금은 Toss 결제 연동 전이라 관리자가 회원관리에서
              구독 상태를 직접 변경해 접근 테스트를 진행할 수 있습니다.
            </p>
          </div>

          <section className="player-panel access-denied-panel">
            <div className="access-lock-icon">
              <LockKeyhole size={32} />
            </div>
            <h2>현재 계정은 아직 구독 중이 아닙니다</h2>
            <div className="access-status-grid">
              <div>
                <span className="stat-label">현재 구독 상태</span>
                <strong>{subscriptionLabel(subscription?.status)}</strong>
              </div>
              <div>
                <span className="stat-label">강의 권한</span>
                <strong>구독자 전용</strong>
              </div>
            </div>
            <ol className="access-flow-list">
              <li>
                <ShieldCheck size={18} />
                <span>관리자 계정으로 로그인합니다.</span>
              </li>
              <li>
                <ShieldCheck size={18} />
                <span>관리자 &gt; 회원관리에서 해당 회원의 구독 변경을 구독 중으로 저장합니다.</span>
              </li>
              <li>
                <ShieldCheck size={18} />
                <span>회원이 페이지를 새로고침하면 구독자 전용 강의를 바로 시청할 수 있습니다.</span>
              </li>
            </ol>
            <div className="form-actions">
              <Link className="icon-button primary large" href="/subscribe">
                월구독 안내 보기
                <ArrowRight size={18} />
              </Link>
              <Link className="icon-button subtle large" href="/courses">
                강의 목록으로 이동
              </Link>
            </div>
          </section>
        </div>
      </section>
    );
  }

  return <WatchPlayer key={course.slug} course={course} initialBookmarked={Boolean(bookmark)} nextCourse={await getRuntimeNextCourse(course.slug)} />;
}
