import { redirect } from "next/navigation";
import { BarChart3, FolderPlus, ShieldCheck, UserRoundCheck } from "lucide-react";
import { courses } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createCourse, updateProfileRole, updateSubscriptionStatus } from "./actions";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  created_at: string;
};

type SubscriptionRow = {
  user_id: string;
  status: string;
  provider: string | null;
  current_period_end: string | null;
  updated_at: string;
};

type DbCourseRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  poomsae: string | null;
  instructor: string | null;
  gumlet_video_id: string | null;
  is_premium: boolean;
  published_at: string | null;
};

const statuses = ["inactive", "active", "past_due", "canceled", "expired"];

function statusLabel(status?: string) {
  switch (status) {
    case "active":
      return "구독 중";
    case "past_due":
      return "결제 확인";
    case "canceled":
      return "해지";
    case "expired":
      return "만료";
    case "inactive":
    default:
      return "미구독";
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

export default async function AdminPage() {
  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (hasSupabaseEnv() && !user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } =
    supabase && user
      ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<{ role: string }>()
      : { data: null };

  if (hasSupabaseEnv() && profile?.role !== "admin") {
    redirect("/mypage");
  }

  const [{ data: profiles }, { data: subscriptions }, { data: dbCourses }] = supabase
    ? await Promise.all([
        supabase.from("profiles").select("id,email,display_name,role,created_at").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("user_id,status,provider,current_period_end,updated_at"),
        supabase
          .from("courses")
          .select("id,slug,title,category,poomsae,instructor,gumlet_video_id,is_premium,published_at")
          .order("created_at", { ascending: false })
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const profileRows = (profiles ?? []) as ProfileRow[];
  const subscriptionRows = (subscriptions ?? []) as SubscriptionRow[];
  const courseRows = (dbCourses ?? []) as DbCourseRow[];
  const subscriptionsByUser = new Map(subscriptionRows.map((subscription) => [subscription.user_id, subscription]));
  const activeSubscribers = subscriptionRows.filter((subscription) => subscription.status === "active").length;
  const adminCount = profileRows.filter((item) => item.role === "admin").length;

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">관리자</p>
        <h1>BOTEPS 운영 대시보드</h1>
        <p>회원 권한, 구독 상태, Supabase 강의 데이터를 실제로 관리합니다.</p>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <UserRoundCheck size={24} color="#2458a8" />
          <span className="stat-label">전체 회원</span>
          <strong>{profileRows.length}</strong>
        </div>
        <div className="metric-card">
          <ShieldCheck size={24} color="#167c76" />
          <span className="stat-label">구독 중</span>
          <strong>{activeSubscribers}</strong>
        </div>
        <div className="metric-card">
          <BarChart3 size={24} color="#c18a2b" />
          <span className="stat-label">관리자</span>
          <strong>{adminCount}</strong>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <h2>강의 등록</h2>
          <p>Gumlet Asset ID 또는 embed URL을 저장해두는 단계입니다. 강의 목록 실제 전환 때 이 데이터를 사용합니다.</p>
          <form action={createCourse} className="form-grid">
            <input className="form-input" name="title" placeholder="강의 제목" required />
            <input className="form-input" name="slug" placeholder="URL 슬러그 예: koryo-basic" />
            <input className="form-input" name="poomsae" placeholder="품새명" />
            <input className="form-input" name="instructor" placeholder="강사명" />
            <input className="form-input" name="gumletVideoId" placeholder="Gumlet Asset ID 또는 embed URL" />
            <select className="select-input" name="category" defaultValue="유단자 품새">
              <option>태극 품새</option>
              <option>유단자 품새</option>
              <option>경기 품새</option>
              <option>품새 이론</option>
              <option>표현력</option>
              <option>실수 교정</option>
            </select>
            <select className="select-input" name="difficulty" defaultValue="지도자">
              <option>입문</option>
              <option>중급</option>
              <option>상급</option>
              <option>지도자</option>
            </select>
            <select className="select-input" name="isPremium" defaultValue="true">
              <option value="true">구독자 전용</option>
              <option value="false">무료 공개</option>
            </select>
            <textarea className="form-input" name="description" placeholder="강의 설명" rows={4} />
            <div className="form-actions">
              <button className="icon-button primary large">
                <FolderPlus size={20} />
                <span>Supabase에 강의 저장</span>
              </button>
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <h2>연동 상태</h2>
          <p>현재 BOTEPS 2차 연동 진행 상태입니다.</p>
          <div className="integration-list">
            {[
              ["Supabase Auth / DB", "연동"],
              ["Gumlet Video", "연동"],
              ["관리자 권한", "연동"],
              ["Toss Payments", "다음"],
              ["Stripe Billing", "대기"],
              ["GA4 / Microsoft Clarity", "대기"]
            ].map(([item, state]) => (
              <div className="integration-item" key={item}>
                <span>{item}</span>
                <strong>{state}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <h2>회원 및 구독 상태</h2>
        <table>
          <thead>
            <tr>
              <th>회원</th>
              <th>권한</th>
              <th>구독 상태</th>
              <th>다음 갱신</th>
              <th>구독 변경</th>
              <th>권한 변경</th>
            </tr>
          </thead>
          <tbody>
            {profileRows.map((member) => {
              const subscription = subscriptionsByUser.get(member.id);

              return (
                <tr key={member.id}>
                  <td>
                    <strong>{member.display_name ?? member.email ?? "이름 없음"}</strong>
                    <br />
                    <span className="small-muted">{member.email}</span>
                  </td>
                  <td>{member.role === "admin" ? "관리자" : "회원"}</td>
                  <td>{statusLabel(subscription?.status)}</td>
                  <td>{formatDate(subscription?.current_period_end)}</td>
                  <td>
                    <form action={updateSubscriptionStatus} className="inline-form">
                      <input type="hidden" name="userId" value={member.id} />
                      <select className="select-input compact-select" name="status" defaultValue={subscription?.status ?? "inactive"}>
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <button className="icon-button subtle compact">저장</button>
                    </form>
                  </td>
                  <td>
                    <form action={updateProfileRole} className="inline-form">
                      <input type="hidden" name="userId" value={member.id} />
                      <select className="select-input compact-select" name="role" defaultValue={member.role}>
                        <option value="user">회원</option>
                        <option value="admin">관리자</option>
                      </select>
                      <button className="icon-button subtle compact">저장</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <h2>Supabase 강의 데이터</h2>
        {courseRows.length === 0 ? (
          <div className="empty-state">아직 Supabase에 저장된 강의가 없습니다. 위 등록 폼으로 첫 강의를 저장해보세요.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>강의</th>
                <th>카테고리</th>
                <th>강사</th>
                <th>권한</th>
                <th>Gumlet</th>
                <th>게시일</th>
              </tr>
            </thead>
            <tbody>
              {courseRows.map((course) => (
                <tr key={course.id}>
                  <td>
                    <strong>{course.title}</strong>
                    <br />
                    <span className="small-muted">{course.slug}</span>
                  </td>
                  <td>{course.category}</td>
                  <td>{course.instructor ?? "-"}</td>
                  <td>{course.is_premium ? "구독자 전용" : "무료"}</td>
                  <td>{course.gumlet_video_id ? "등록됨" : "-"}</td>
                  <td>{formatDate(course.published_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <h2>MVP 더미 강의</h2>
        <table>
          <thead>
            <tr>
              <th>강의</th>
              <th>카테고리</th>
              <th>강사</th>
              <th>권한</th>
              <th>영상</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.slug}>
                <td>{course.title}</td>
                <td>{course.category}</td>
                <td>{course.instructor}</td>
                <td>{course.isPremium ? "구독자 전용" : "무료"}</td>
                <td>{course.embedUrl ? "Gumlet" : "더미"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
