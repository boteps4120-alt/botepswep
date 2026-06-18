import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, CreditCard, PlayCircle, Settings, UserRound } from "lucide-react";
import { courses, currentUser, payments } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MyPageTab = "profile" | "history" | "payments";

type ProfileRow = {
  email: string | null;
  display_name: string | null;
  full_name: string | null;
  birth_date: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  role: string;
};

type SubscriptionRow = {
  status: string;
  current_period_end: string | null;
};

const mypageTabs: { key: MyPageTab; label: string }[] = [
  { key: "profile", label: "회원정보" },
  { key: "history", label: "강의 내역" },
  { key: "payments", label: "결제내역" }
];

function getTab(value?: string): MyPageTab {
  if (value === "history" || value === "payments") return value;
  return "profile";
}

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

function genderLabel(gender?: string | null) {
  switch (gender) {
    case "male":
      return "남성";
    case "female":
      return "여성";
    default:
      return "-";
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

function valueOrDash(value?: string | null) {
  return value?.trim() ? value : "-";
}

export default async function MyPage({
  searchParams
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = getTab(params?.tab);
  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (hasSupabaseEnv() && !user) {
    redirect("/login?next=/mypage");
  }

  const [{ data: subscription }, { data: profile }] =
    supabase && user
      ? await Promise.all([
          supabase
            .from("subscriptions")
            .select("status,current_period_end")
            .eq("user_id", user.id)
            .maybeSingle<SubscriptionRow>(),
          supabase
            .from("profiles")
            .select("email,display_name,full_name,birth_date,gender,phone,address,role")
            .eq("id", user.id)
            .maybeSingle<ProfileRow>()
        ])
      : [{ data: null }, { data: null }];

  const profileName =
    profile?.full_name ??
    profile?.display_name ??
    user?.user_metadata?.display_name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    currentUser.name;
  const accountEmail = profile?.email ?? user?.email ?? "-";
  const subscriptionStatus = subscriptionLabel(subscription?.status);
  const renewsAt = subscription?.status === "active" ? formatDate(subscription.current_period_end) : "결제 연동 전";
  const watching = courses.filter((course) => course.progress > 0);
  const bookmarked = courses.slice(0, 3);

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">마이페이지</p>
        <h1>{profileName}</h1>
        <p>회원정보, 강의 내역, 결제내역을 필요한 화면별로 확인합니다.</p>
      </div>

      <nav className="admin-tabs mypage-tabs" aria-label="마이페이지 메뉴">
        {mypageTabs.map((tab) => (
          <Link className={activeTab === tab.key ? "active" : ""} href={`/mypage?tab=${tab.key}`} key={tab.key}>
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "profile" ? (
        <div className="admin-stack">
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

          <section className="player-panel">
            <h2>회원정보</h2>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span>이름</span>
                <strong>{profileName}</strong>
              </div>
              <div className="profile-info-item">
                <span>아이디</span>
                <strong>{accountEmail}</strong>
              </div>
              <div className="profile-info-item">
                <span>생년월일</span>
                <strong>{formatDate(profile?.birth_date)}</strong>
              </div>
              <div className="profile-info-item">
                <span>성별</span>
                <strong>{genderLabel(profile?.gender)}</strong>
              </div>
              <div className="profile-info-item">
                <span>전화번호</span>
                <strong>{valueOrDash(profile?.phone)}</strong>
              </div>
              <div className="profile-info-item">
                <span>권한</span>
                <strong>{profile?.role === "admin" ? "관리자" : "회원"}</strong>
              </div>
              <div className="profile-info-item wide">
                <span>주소</span>
                <strong>{valueOrDash(profile?.address)}</strong>
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button className="icon-button subtle large">
              <Settings size={20} />
              <span>계정 설정</span>
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === "history" ? (
        <div className="admin-stack">
          <div className="dashboard-grid">
            <section className="player-panel">
              <h2>이어보기</h2>
              <div className="integration-list">
                {watching.length > 0 ? (
                  watching.map((course) => (
                    <Link className="integration-item" key={course.slug} href={`/watch/${course.slug}`}>
                      <span>{course.title}</span>
                      <strong>{course.progress}%</strong>
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">아직 시청 중인 강의가 없습니다.</div>
                )}
              </div>
            </section>

            <section className="player-panel">
              <h2>찜한 강의</h2>
              <div className="integration-list">
                {bookmarked.map((course) => (
                  <Link className="integration-item" key={course.slug} href={`/courses/${course.slug}`}>
                    <span>{course.poomsae}</span>
                    <Bookmark size={18} />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="form-actions">
            <Link className="icon-button primary large" href={`/watch/${watching[0]?.slug ?? courses[0].slug}`}>
              <PlayCircle size={20} />
              <span>마지막 강의 이어보기</span>
            </Link>
          </div>
        </div>
      ) : null}

      {activeTab === "payments" ? (
        <div className="table-wrap">
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
      ) : null}
    </section>
  );
}
