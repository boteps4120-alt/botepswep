import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, CreditCard, PlayCircle, Settings, UserRound } from "lucide-react";
import { courses, currentUser, payments } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SubscriptionRow = {
  status: string;
  current_period_end: string | null;
};

function subscriptionLabel(status?: string) {
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

function formatDate(date?: string | null) {
  if (!date) return "결제 연동 전";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date));
}

export default async function MyPage() {
  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (hasSupabaseEnv() && !user) {
    redirect("/login?next=/mypage");
  }

  const { data: subscription } =
    supabase && user
      ? await supabase
          .from("subscriptions")
          .select("status,current_period_end")
          .eq("user_id", user.id)
          .maybeSingle<SubscriptionRow>()
      : { data: null };

  const profileName =
    user?.user_metadata?.display_name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    currentUser.name;
  const subscriptionStatus = subscriptionLabel(subscription?.status);
  const renewsAt = subscription?.status === "active" ? formatDate(subscription.current_period_end) : "결제 연동 전";
  const watching = courses.filter((course) => course.progress > 0);

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">마이페이지</p>
        <h1>{profileName}</h1>
        <p>계정, 구독 상태, 시청 기록, 찜한 강의를 한 화면에서 확인합니다.</p>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <UserRound size={24} color="#2458a8" />
          <span className="stat-label">계정</span>
          <strong>{user ? "로그인 완료" : currentUser.role}</strong>
        </div>
        <div className="metric-card">
          <CreditCard size={24} color="#167c76" />
          <span className="stat-label">구독 상태</span>
          <strong>{subscriptionStatus}</strong>
        </div>
        <div className="metric-card">
          <Settings size={24} color="#c18a2b" />
          <span className="stat-label">다음 갱신</span>
          <strong>{renewsAt}</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="player-panel">
          <h2>이어보기</h2>
          <div className="integration-list">
            {watching.map((course) => (
              <Link className="integration-item" key={course.slug} href={`/watch/${course.slug}`}>
                <span>{course.title}</span>
                <strong>{course.progress}%</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="player-panel">
          <h2>찜한 강의</h2>
          <div className="integration-list">
            {courses.slice(0, 3).map((course) => (
              <Link className="integration-item" key={course.slug} href={`/courses/${course.slug}`}>
                <span>{course.poomsae}</span>
                <Bookmark size={18} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <h2>결제 내역</h2>
        {user && subscription?.status !== "active" ? (
          <div className="empty-state">아직 결제 내역이 없습니다. Toss/Stripe 연동 후 이 영역에 실제 결제 내역을 표시합니다.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>결제번호</th>
                <th>날짜</th>
                <th>금액</th>
                <th>상태</th>
                <th>결제 서비스</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.date}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.status}</td>
                  <td>{payment.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="form-actions">
        <Link className="icon-button primary large" href={`/watch/${watching[0]?.slug ?? courses[0].slug}`}>
          <PlayCircle size={20} />
          <span>마지막 강의 이어보기</span>
        </Link>
        <button className="icon-button subtle large">
          <Settings size={20} />
          <span>계정 설정</span>
        </button>
      </div>
    </section>
  );
}
