import { redirect } from "next/navigation";
import { BarChart3, Film, FolderPlus, UserRoundCheck } from "lucide-react";
import { courses, currentUser } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProfileRow = {
  role: string;
};

export default async function AdminPage() {
  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (hasSupabaseEnv() && !user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } =
    supabase && user
      ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>()
      : { data: null };

  if (hasSupabaseEnv() && profile?.role !== "admin") {
    redirect("/mypage");
  }

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">관리자</p>
        <h1>boteps 운영 대시보드</h1>
        <p>1차 MVP에서는 더미 데이터로 강의, 카테고리, 강사, 영상 URL, 사용자와 결제 상태 관리 화면을 제공합니다.</p>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <Film size={24} color="#2458a8" />
          <span className="stat-label">등록 강의</span>
          <strong>{courses.length}</strong>
        </div>
        <div className="metric-card">
          <UserRoundCheck size={24} color="#167c76" />
          <span className="stat-label">구독자</span>
          <strong>128</strong>
        </div>
        <div className="metric-card">
          <BarChart3 size={24} color="#c18a2b" />
          <span className="stat-label">월 매출</span>
          <strong>1,267,200원</strong>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <h2>강의 등록</h2>
          <p>2차에서 Supabase 강의 테이블과 Gumlet 영상 URL로 연결할 폼입니다.</p>
          <div className="form-grid">
            <input className="form-input" placeholder="강의 제목" />
            <input className="form-input" placeholder="품새명" />
            <input className="form-input" placeholder="강사명" />
            <input className="form-input" placeholder="Gumlet 영상 URL" />
            <select className="select-input" defaultValue="유단자 품새">
              <option>태극 품새</option>
              <option>유단자 품새</option>
              <option>경기 품새</option>
              <option>품새 이론</option>
              <option>실수 교정</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="icon-button primary large">
              <FolderPlus size={20} />
              <span>더미 강의 등록</span>
            </button>
          </div>
        </section>

        <section className="admin-panel">
          <h2>외부서비스 연결 상태</h2>
          <p>현재는 미연동 상태이며 2차에서 환경변수와 웹훅을 연결합니다.</p>
          <div className="integration-list">
            {[
              "Supabase Auth / DB",
              "Gumlet Video",
              "Toss Payments",
              "Stripe Billing",
              "Resend Email",
              "GA4 / Microsoft Clarity"
            ].map((item) => (
              <div className="integration-item" key={item}>
                <span>{item}</span>
                <strong>준비</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <h2>강의 목록 관리</h2>
        <table>
          <thead>
            <tr>
              <th>강의</th>
              <th>카테고리</th>
              <th>강사</th>
              <th>권한</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.slug}>
                <td>{course.title}</td>
                <td>{course.category}</td>
                <td>{course.instructor}</td>
                <td>{course.isPremium ? "구독자" : "무료"}</td>
                <td>게시 중</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="player-panel" style={{ marginTop: 24 }}>
        <h2>관리자 계정</h2>
        <p className="detail-copy">
          {currentUser.email} · {currentUser.role} · 구독 및 결제 상태를 직접 확인할 수 있는 더미 관리자입니다.
        </p>
      </section>
    </section>
  );
}
