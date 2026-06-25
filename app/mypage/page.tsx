import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, CreditCard, Settings, UserRound } from "lucide-react";
import { currentUser, payments } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "./profile-edit-form";

export const dynamic = "force-dynamic";

type MyPageTab = "profile" | "history" | "payments" | "support";

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

type CourseSummary = {
  slug: string;
  title: string;
  poomsae: string | null;
};

type WatchProgressRow = {
  progress_percent: number;
  courses: CourseSummary | null;
};

type BookmarkRow = {
  courses: CourseSummary | null;
};

const mypageTabs: { key: MyPageTab; label: string }[] = [
  { key: "profile", label: "회원정보" },
  { key: "history", label: "강의 내역" },
  { key: "payments", label: "결제내역" },
  { key: "support", label: "1:1 문의" }
];

function getTab(value?: string): MyPageTab {
  if (value === "history" || value === "payments" || value === "support") return value;
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
  if (!date) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date));
}

function birthDateDigits(date?: string | null) {
  if (!date) return "";
  return date.replace(/\D/g, "").slice(0, 8);
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

  if (activeTab === "support") {
    redirect("/support");
  }

  const [{ data: subscription }, { data: profile }, { data: watchProgress }, { data: bookmarks }] =
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
            .maybeSingle<ProfileRow>(),
          supabase
            .from("watch_progress")
            .select("progress_percent,courses(slug,title,poomsae)")
            .eq("user_id", user.id)
            .gt("progress_percent", 0)
            .order("updated_at", { ascending: false }),
          supabase
            .from("bookmarks")
            .select("courses(slug,title,poomsae)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        ])
      : [{ data: null }, { data: null }, { data: [] }, { data: [] }];

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
  const watching = ((watchProgress ?? []) as unknown as WatchProgressRow[]).filter((item) => item.courses);
  const bookmarked = ((bookmarks ?? []) as unknown as BookmarkRow[]).filter((item) => item.courses);

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">마이페이지</p>
        <h1>{profileName}</h1>
        <p>회원정보, 강의 내역, 결제내역을 필요한 화면별로 확인합니다.</p>
      </div>

      <nav className="admin-tabs mypage-tabs" aria-label="마이페이지 메뉴">
        {mypageTabs.map((tab) => (
          <Link className={activeTab === tab.key ? "active" : ""} href={tab.key === "support" ? "/support" : `/mypage?tab=${tab.key}`} key={tab.key}>
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

          <ProfileEditForm
            fullName={profile?.full_name ?? profile?.display_name ?? ""}
            birthDate={birthDateDigits(profile?.birth_date)}
            formattedBirthDate={formatDate(profile?.birth_date)}
            gender={profile?.gender ?? ""}
            genderLabel={genderLabel(profile?.gender)}
            phone={profile?.phone ?? ""}
            address={profile?.address ?? ""}
            accountEmail={accountEmail}
          />
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
                    <Link className="integration-item" key={course.courses!.slug} href={`/watch/${course.courses!.slug}`}>
                      <span>{course.courses!.title}</span>
                      <strong>{course.progress_percent}%</strong>
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">아직 이어볼 강의가 없습니다.</div>
                )}
              </div>
            </section>

            <section className="player-panel">
              <h2>찜한 강의</h2>
              <div className="integration-list">
                {bookmarked.length > 0 ? (
                  bookmarked.map((bookmark) => (
                    <Link className="integration-item" key={bookmark.courses!.slug} href={`/watch/${bookmark.courses!.slug}`}>
                      <span>{bookmark.courses!.poomsae ?? bookmark.courses!.title}</span>
                      <Bookmark size={18} />
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">아직 찜한 강의가 없습니다.</div>
                )}
              </div>
            </section>
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
