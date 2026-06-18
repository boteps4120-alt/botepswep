import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderPlus, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import { courseCategoryTree } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createCourse, updateProfileRole, updateSubscriptionStatus } from "./actions";

export const dynamic = "force-dynamic";

type AdminTab = "members" | "create" | "courses";

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  full_name: string | null;
  birth_date: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
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
  video_orientation: string | null;
  is_premium: boolean;
  published_at: string | null;
};

const statuses = ["inactive", "active", "past_due", "canceled", "expired"];
const adminTabs: { key: AdminTab; label: string }[] = [
  { key: "members", label: "회원관리" },
  { key: "create", label: "강의등록" },
  { key: "courses", label: "강의목록" }
];

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

function genderLabel(gender?: string | null) {
  switch (gender) {
    case "male":
      return "남성";
    case "female":
      return "여성";
    case "other":
      return "기타";
    case "prefer_not_to_say":
      return "응답하지 않음";
    default:
      return "-";
  }
}

function getTab(value?: string): AdminTab {
  if (value === "create" || value === "courses") return value;
  return "members";
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = getTab(params?.tab);
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

  const [{ data: profiles }, { data: subscriptions }] = supabase
    ? await Promise.all([
        supabase
          .from("profiles")
          .select("id,email,display_name,full_name,birth_date,gender,phone,address,role,created_at")
          .order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("user_id,status,provider,current_period_end,updated_at")
      ])
    : [{ data: [] }, { data: [] }];

  let dbCourses: DbCourseRow[] = [];

  if (supabase) {
    const { data: courseRows, error: courseError } = await supabase
      .from("courses")
      .select("id,slug,title,category,poomsae,instructor,gumlet_video_id,video_orientation,is_premium,published_at")
      .order("created_at", { ascending: false });

    if (!courseError) {
      dbCourses = (courseRows ?? []) as DbCourseRow[];
    } else {
      const { data: fallbackCourseRows } = await supabase
        .from("courses")
        .select("id,slug,title,category,poomsae,instructor,gumlet_video_id,is_premium,published_at")
        .order("created_at", { ascending: false });

      dbCourses = ((fallbackCourseRows ?? []) as Omit<DbCourseRow, "video_orientation">[]).map((course) => ({
        ...course,
        video_orientation: "landscape"
      }));
    }
  }

  const profileRows = (profiles ?? []) as ProfileRow[];
  const subscriptionRows = (subscriptions ?? []) as SubscriptionRow[];
  const courseRows = dbCourses;
  const subscriptionsByUser = new Map(subscriptionRows.map((subscription) => [subscription.user_id, subscription]));
  const activeSubscribers = subscriptionRows.filter((subscription) => subscription.status === "active").length;
  const adminCount = profileRows.filter((item) => item.role === "admin").length;
  const instructorOptions = Array.from(new Set(courseRows.map((course) => course.instructor).filter(Boolean))) as string[];

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">관리자</p>
        <h1>BOTEPS 운영 대시보드</h1>
        <p>회원, 강의 등록, 강의 목록을 나누어 관리합니다.</p>
      </div>

      <nav className="admin-tabs" aria-label="관리자 메뉴">
        {adminTabs.map((tab) => (
          <Link className={activeTab === tab.key ? "active" : ""} href={`/admin?tab=${tab.key}`} key={tab.key}>
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "members" ? (
        <div className="admin-stack">
          <div className="metric-grid">
            <div className="metric-card">
              <UsersRound size={24} color="#2458a8" />
              <span className="stat-label">회원수</span>
              <strong>{profileRows.length}</strong>
            </div>
            <div className="metric-card">
              <ShieldCheck size={24} color="#167c76" />
              <span className="stat-label">구독 중</span>
              <strong>{activeSubscribers}</strong>
            </div>
            <div className="metric-card">
              <UserRoundCheck size={24} color="#c18a2b" />
              <span className="stat-label">관리자</span>
              <strong>{adminCount}</strong>
            </div>
          </div>

          <div className="table-wrap">
            <h2>회원 및 구독 상태</h2>
            <table className="member-table">
              <thead>
                <tr>
                  <th>회원</th>
                  <th>이름</th>
                  <th>생년월일</th>
                  <th>성별</th>
                  <th>전화번호</th>
                  <th>주소</th>
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
                      <td>{member.full_name ?? member.display_name ?? "-"}</td>
                      <td>{formatDate(member.birth_date)}</td>
                      <td>{genderLabel(member.gender)}</td>
                      <td>{member.phone ?? "-"}</td>
                      <td className="address-cell">{member.address ?? "-"}</td>
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
        </div>
      ) : null}

      {activeTab === "create" ? (
        <section className="admin-panel admin-form-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>강의 등록</h2>
              <p>Gumlet Asset ID를 저장하면 강의 목록, 상세, 시청 페이지에 바로 반영됩니다.</p>
            </div>
            <FolderPlus size={28} color="#c93232" />
          </div>
          <form action={createCourse} className="form-grid course-create-form">
            <label className="field-label">
              강의 제목
              <input className="form-input" name="title" placeholder="예: 몸통막기 기본 지도법" required />
            </label>
            <label className="field-label">
              대분류
              <select className="select-input" name="category" defaultValue="유단자 품새">
                {courseCategoryTree.map((category) => (
                  <option key={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              하위 항목
              <input className="form-input" name="poomsae" list="course-subcategory-options" placeholder="예: 고려, 몸통막기, 앞굽이" required />
            </label>
            <datalist id="course-subcategory-options">
              {courseCategoryTree.flatMap((category) =>
                category.items.map((item) => <option key={`${category.name}-${item}`} value={item} />)
              )}
            </datalist>
            <label className="field-label">
              Gumlet Asset ID 또는 영상 URL
              <input className="form-input" name="gumletVideoId" placeholder="예: 6a3452e3a43952886a2e3bbb" required />
            </label>
            <label className="field-label">
              영상 비율
              <select className="select-input" name="videoOrientation" defaultValue="landscape">
                <option value="landscape">가로 영상</option>
                <option value="portrait">세로 영상</option>
              </select>
            </label>
            <label className="field-label">
              공개 권한
              <select className="select-input" name="isPremium" defaultValue="true">
                <option value="true">구독자 전용</option>
                <option value="false">무료 공개</option>
              </select>
            </label>
            <label className="field-label">
              내부 관리용 강사명
              <input className="form-input" name="instructor" list="instructor-options" placeholder="선택 입력" />
            </label>
            <datalist id="instructor-options">
              {instructorOptions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <label className="field-label">
              썸네일 URL
              <input className="form-input" name="thumbnailUrl" placeholder="비우면 기본 이미지 사용" />
            </label>
            <label className="field-label form-span">
              강의 설명
              <textarea className="form-input textarea-input" name="description" placeholder="강의 설명을 입력하세요." rows={5} />
            </label>
            <p className="form-note form-span">
              영상 길이와 URL 슬러그는 직접 입력하지 않습니다. 길이는 Gumlet 영상 정보 연동 단계에서 자동 반영하고, URL은 강의 제목으로 자동 생성합니다.
            </p>
            <div className="form-actions form-span">
              <button className="icon-button primary large">
                <FolderPlus size={20} />
                <span>강의 저장</span>
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {activeTab === "courses" ? (
        <div className="table-wrap">
          <div className="table-heading">
            <div>
              <h2>강의 목록</h2>
              <p className="small-muted">관리자에서 등록한 Supabase 강의 데이터입니다.</p>
            </div>
            <Link className="icon-button subtle" href="/admin?tab=create">
              <FolderPlus size={18} />
              <span>강의 등록</span>
            </Link>
          </div>
          {courseRows.length === 0 ? (
            <div className="empty-state">아직 Supabase에 저장된 강의가 없습니다. 강의 등록 탭에서 첫 강의를 저장해보세요.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>강의</th>
                  <th>대분류</th>
                  <th>하위 항목</th>
                  <th>내부 강사명</th>
                  <th>권한</th>
                  <th>비율</th>
                  <th>영상</th>
                  <th>확인</th>
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
                    <td>{course.poomsae ?? "-"}</td>
                    <td>{course.instructor ?? "-"}</td>
                    <td>{course.is_premium ? "구독자 전용" : "무료"}</td>
                    <td>{course.video_orientation === "portrait" ? "세로" : "가로"}</td>
                    <td>{course.gumlet_video_id ? "Gumlet" : "-"}</td>
                    <td>
                      <div className="inline-form">
                        <Link className="text-link" href={`/courses/${course.slug}`}>
                          상세
                        </Link>
                        <Link className="text-link" href={`/watch/${course.slug}`}>
                          시청
                        </Link>
                      </div>
                    </td>
                    <td>{formatDate(course.published_at)}</td>
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
