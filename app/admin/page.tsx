import Link from "next/link";
import { Fragment } from "react";
import { redirect } from "next/navigation";
import { FolderPlus, MessageCircle, Send, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import { sendSupportMessage, updateSupportThreadStatus } from "@/app/support/actions";
import { AdminCourseClassificationFields } from "@/components/admin-course-classification-fields";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { AdminActionNotice } from "./admin-action-notice";
import { createCourse, deleteCourse, updateCourse, updateProfileRole, updateSubscriptionStatus } from "./actions";

export const dynamic = "force-dynamic";

type AdminTab = "members" | "create" | "courses" | "support";

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
  description: string | null;
  thumbnail_url: string | null;
  gumlet_video_id: string | null;
  video_orientation: string | null;
  is_premium: boolean;
  published_at: string | null;
};

type CourseEventRow = {
  course_id: string;
  event_type: string;
  created_at: string;
};

type CourseMetricRow = {
  course_id: string;
};

type WatchProgressMetricRow = {
  course_id: string;
  completed_at: string | null;
};

type SupportProfileRow = {
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  role?: string | null;
};

type SupportThreadRow = {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  status: string;
  last_message_at: string;
  created_at: string;
  profiles: SupportProfileRow | SupportProfileRow[] | null;
};

type SupportMessageRow = {
  id: string;
  thread_id: string;
  user_id: string | null;
  sender_role: string;
  body: string;
  created_at: string;
  profiles: SupportProfileRow | SupportProfileRow[] | null;
};

type CourseStats = {
  views: number;
  playStarts: number;
  completed: number;
  bookmarks: number;
  recent7Days: number;
  recent30Days: number;
  premiumClicks: number;
};

const statuses = ["inactive", "active", "past_due", "canceled", "expired"];
const adminTabs: { key: AdminTab; label: string }[] = [
  { key: "members", label: "회원관리" },
  { key: "create", label: "강의등록" },
  { key: "courses", label: "강의목록" },
  { key: "support", label: "1:1 문의" }
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

function statusClass(status?: string) {
  switch (status) {
    case "active":
      return "status-badge active";
    case "past_due":
      return "status-badge warning";
    case "canceled":
    case "expired":
      return "status-badge muted";
    case "inactive":
    default:
      return "status-badge inactive";
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
    default:
      return "-";
  }
}

function getTab(value?: string): AdminTab {
  if (value === "create" || value === "courses" || value === "support") return value;
  return "members";
}

function supportCategoryLabel(value?: string | null) {
  switch (value) {
    case "lecture":
      return "강의 이용";
    case "video":
      return "영상 재생";
    case "payment":
      return "결제/구독";
    case "account":
      return "계정/로그인";
    case "suggestion":
      return "강의 요청";
    case "other":
    default:
      return "기타";
  }
}

function supportStatusLabel(status?: string | null) {
  switch (status) {
    case "answered":
      return "답변 완료";
    case "closed":
      return "종료";
    case "waiting":
    default:
      return "답변 대기";
  }
}

function supportStatusClass(status?: string | null) {
  switch (status) {
    case "answered":
      return "support-status answered";
    case "closed":
      return "support-status closed";
    case "waiting":
    default:
      return "support-status waiting";
  }
}

function supportProfile(profile?: SupportProfileRow | SupportProfileRow[] | null) {
  return Array.isArray(profile) ? profile[0] : profile;
}

function supportProfileName(profile?: SupportProfileRow | SupportProfileRow[] | null) {
  const row = supportProfile(profile);
  return row?.full_name ?? row?.display_name ?? row?.email ?? "회원";
}

function supportMessageAuthor(message: SupportMessageRow) {
  if (message.sender_role === "admin") return "BOTEPS 관리자";
  return supportProfileName(message.profiles);
}

function formatDateTime(date?: string | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

function emptyCourseStats(): CourseStats {
  return {
    views: 0,
    playStarts: 0,
    completed: 0,
    bookmarks: 0,
    recent7Days: 0,
    recent30Days: 0,
    premiumClicks: 0
  };
}

function buildCourseStats(
  courseRows: DbCourseRow[],
  events: CourseEventRow[],
  bookmarks: CourseMetricRow[],
  progressRows: WatchProgressMetricRow[]
) {
  const stats = new Map<string, CourseStats>();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  for (const course of courseRows) {
    stats.set(course.id, emptyCourseStats());
  }

  for (const event of events) {
    const courseStats = stats.get(event.course_id);
    if (!courseStats) continue;

    const createdAt = new Date(event.created_at).getTime();

    if (event.event_type === "course_view") courseStats.views += 1;
    if (event.event_type === "play_start") {
      courseStats.playStarts += 1;
      if (createdAt >= sevenDaysAgo) courseStats.recent7Days += 1;
      if (createdAt >= thirtyDaysAgo) courseStats.recent30Days += 1;
    }
    if (event.event_type === "premium_click") courseStats.premiumClicks += 1;
  }

  for (const bookmark of bookmarks) {
    const courseStats = stats.get(bookmark.course_id);
    if (courseStats) courseStats.bookmarks += 1;
  }

  for (const progress of progressRows) {
    const courseStats = stats.get(progress.course_id);
    if (courseStats && progress.completed_at) courseStats.completed += 1;
  }

  return stats;
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ tab?: string; notice?: string; support?: string }>;
}) {
  const params = await searchParams;
  const activeTab = getTab(params?.tab);
  const notice = params?.notice;
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
      .select("id,slug,title,category,poomsae,instructor,description,thumbnail_url,gumlet_video_id,video_orientation,is_premium,published_at")
      .order("created_at", { ascending: false });

    if (!courseError) {
      dbCourses = (courseRows ?? []) as DbCourseRow[];
    } else {
      const { data: fallbackCourseRows } = await supabase
        .from("courses")
        .select("id,slug,title,category,poomsae,instructor,description,thumbnail_url,gumlet_video_id,is_premium,published_at")
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
  const courseIds = courseRows.map((course) => course.id);
  let eventRows: CourseEventRow[] = [];
  let bookmarkMetricRows: CourseMetricRow[] = [];
  let watchProgressMetricRows: WatchProgressMetricRow[] = [];

  if (supabase && courseIds.length > 0) {
    const [{ data: events }, { data: bookmarkMetrics }, { data: watchProgressMetrics }] = await Promise.all([
      supabase.from("course_events").select("course_id,event_type,created_at").in("course_id", courseIds),
      supabase.from("bookmarks").select("course_id").in("course_id", courseIds),
      supabase.from("watch_progress").select("course_id,completed_at").in("course_id", courseIds)
    ]);

    eventRows = (events ?? []) as CourseEventRow[];
    bookmarkMetricRows = (bookmarkMetrics ?? []) as CourseMetricRow[];
    watchProgressMetricRows = (watchProgressMetrics ?? []) as WatchProgressMetricRow[];
  }

  const courseStatsById = buildCourseStats(courseRows, eventRows, bookmarkMetricRows, watchProgressMetricRows);
  let supportThreads: SupportThreadRow[] = [];
  let supportMessages: SupportMessageRow[] = [];
  let supportLoadError = false;

  if (supabase) {
    const { data, error } = await supabase
      .from("support_threads")
      .select("id,user_id,subject,category,status,last_message_at,created_at,profiles(full_name,display_name,email)")
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Failed to load support threads", error);
      supportLoadError = true;
    } else {
      supportThreads = (data ?? []) as unknown as SupportThreadRow[];
    }
  }

  const selectedSupportId =
    params?.support && supportThreads.some((thread) => thread.id === params.support) ? params.support : supportThreads[0]?.id;
  const selectedSupportThread = supportThreads.find((thread) => thread.id === selectedSupportId) ?? null;

  if (supabase && selectedSupportId && !supportLoadError) {
    const { data, error } = await supabase
      .from("support_messages")
      .select("id,thread_id,user_id,sender_role,body,created_at,profiles(full_name,display_name,email,role)")
      .eq("thread_id", selectedSupportId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load support messages", error);
      supportLoadError = true;
    } else {
      supportMessages = (data ?? []) as unknown as SupportMessageRow[];
    }
  }

  const waitingSupportCount = supportThreads.filter((thread) => thread.status === "waiting").length;
  const answeredSupportCount = supportThreads.filter((thread) => thread.status === "answered").length;

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">관리자</p>
        <h1>BOTEPS 운영 대시보드</h1>
        <p>회원, 강의 등록, 강의 목록을 나누어 관리합니다.</p>
      </div>

      <nav className="admin-tabs mypage-tabs manager-tabs" aria-label="관리자 메뉴">
        {adminTabs.map((tab) => (
          <Link className={activeTab === tab.key ? "active" : ""} href={`/admin?tab=${tab.key}`} key={tab.key}>
            {tab.label}
          </Link>
        ))}
      </nav>

      <AdminActionNotice notice={notice} />

      {activeTab === "members" ? (
        <div className="admin-stack">
          {notice === "subscription-updated" ? (
            <div className="notice-banner success">구독 상태가 저장되었습니다. 회원이 새로고침하면 권한이 바로 반영됩니다.</div>
          ) : null}
          {notice === "subscription-error" ? (
            <div className="notice-banner error">구독 상태를 저장하지 못했습니다. 잠시 후 다시 시도하거나 Supabase subscriptions 테이블 상태를 확인해주세요.</div>
          ) : null}

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
            <div className="table-heading">
              <div>
                <h2>회원 및 구독 상태</h2>
                <p className="small-muted">Toss 결제 연동 전에는 이 화면에서 구독 테스트 권한을 직접 바꿉니다.</p>
              </div>
              <div className="admin-helper-card">
                <strong>테스트 흐름</strong>
                <span>미구독 회원을 구독 중으로 저장하면 구독자 전용 강의가 바로 열립니다.</span>
              </div>
            </div>
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
                      <td>
                        <span className={statusClass(subscription?.status)}>{statusLabel(subscription?.status)}</span>
                      </td>
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
            <AdminCourseClassificationFields />
            <label className="field-label">
              Gumlet Asset ID 또는 영상 URL
              <input className="form-input" name="gumletVideoId" placeholder="예: 6a3452e3a43952886a2e3bbb" required />
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
                  <th>시청 데이터</th>
                  <th>확인</th>
                  <th>게시일</th>
                </tr>
              </thead>
              <tbody>
                {courseRows.map((course) => (
                  <Fragment key={course.id}>
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
                        {(() => {
                          const stats = courseStatsById.get(course.id) ?? emptyCourseStats();

                          return (
                            <div className="course-stats-grid">
                              <span>조회 {stats.views}</span>
                              <span>재생 {stats.playStarts}</span>
                              <span>완료 {stats.completed}</span>
                              <span>찜 {stats.bookmarks}</span>
                              <span>7일 {stats.recent7Days}</span>
                              <span>30일 {stats.recent30Days}</span>
                              <span>구독클릭 {stats.premiumClicks}</span>
                            </div>
                          );
                        })()}
                      </td>
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
                    <tr key={`${course.id}-manage`} className="course-manage-row">
                      <td colSpan={10}>
                        <details className="course-manage-details">
                          <summary>수정 / 삭제</summary>
                          <div className="course-manage-grid">
                            <form action={updateCourse} className="form-grid course-edit-form">
                              <input type="hidden" name="courseId" value={course.id} />
                              <input type="hidden" name="oldSlug" value={course.slug} />
                              <label className="field-label">
                                강의 제목
                                <input className="form-input" name="title" defaultValue={course.title} required />
                              </label>
                              <AdminCourseClassificationFields
                                initialCategory={course.category}
                                initialPoomsae={course.poomsae ?? ""}
                                initialOrientation={(course.video_orientation ?? "landscape") as "landscape" | "portrait"}
                              />
                              <label className="field-label">
                                Gumlet Asset ID 또는 영상 URL
                                <input className="form-input" name="gumletVideoId" defaultValue={course.gumlet_video_id ?? ""} required />
                              </label>
                              <label className="field-label">
                                공개 권한
                                <select className="select-input" name="isPremium" defaultValue={String(course.is_premium)}>
                                  <option value="true">구독자 전용</option>
                                  <option value="false">무료 공개</option>
                                </select>
                              </label>
                              <label className="field-label">
                                내부 관리용 강사명
                                <input className="form-input" name="instructor" list="instructor-options" defaultValue={course.instructor ?? ""} />
                              </label>
                              <label className="field-label">
                                썸네일 URL
                                <input className="form-input" name="thumbnailUrl" defaultValue={course.thumbnail_url ?? ""} />
                              </label>
                              <label className="field-label form-span">
                                강의 설명
                                <textarea className="form-input textarea-input" name="description" rows={4} defaultValue={course.description ?? ""} />
                              </label>
                              <div className="form-actions form-span">
                                <button className="icon-button primary large">수정 저장</button>
                              </div>
                            </form>
                            <form action={deleteCourse} className="delete-course-box">
                              <input type="hidden" name="courseId" value={course.id} />
                              <input type="hidden" name="oldSlug" value={course.slug} />
                              <strong>강의 삭제</strong>
                              <p className="small-muted">삭제하면 연결된 챕터, 이어보기, 찜 데이터도 함께 정리됩니다.</p>
                              <label className="check-row">
                                <input type="checkbox" name="deleteConfirm" required />
                                삭제 확인
                              </label>
                              <button className="icon-button danger large">강의 삭제</button>
                            </form>
                          </div>
                        </details>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      {activeTab === "support" ? (
        <div className="admin-stack">
          {supportLoadError ? (
            <div className="notice-banner error">문의 테이블이 아직 준비되지 않았습니다. Supabase SQL Editor에서 최신 schema.sql을 실행해주세요.</div>
          ) : null}
          {notice === "message-sent" ? <div className="notice-banner success">답변을 전송했습니다.</div> : null}
          {notice === "status-updated" ? <div className="notice-banner success">문의 상태가 저장되었습니다.</div> : null}
          {notice === "message-error" || notice === "status-error" ? (
            <div className="notice-banner error">문의 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>
          ) : null}

          <div className="metric-grid">
            <div className="metric-card">
              <MessageCircle size={24} color="#76b900" />
              <span className="stat-label">전체 문의</span>
              <strong>{supportThreads.length}</strong>
            </div>
            <div className="metric-card">
              <MessageCircle size={24} color="#76b900" />
              <span className="stat-label">답변 대기</span>
              <strong>{waitingSupportCount}</strong>
            </div>
            <div className="metric-card">
              <ShieldCheck size={24} color="#76b900" />
              <span className="stat-label">답변 완료</span>
              <strong>{answeredSupportCount}</strong>
            </div>
          </div>

          <div className="support-console admin-support-console">
            <aside className="support-thread-list" aria-label="문의 목록">
              <div className="support-panel-heading">
                <h2>문의 목록</h2>
                <span>{supportThreads.length}건</span>
              </div>
              {supportThreads.length > 0 ? (
                <div className="support-thread-stack">
                  {supportThreads.map((thread) => (
                    <Link
                      className={`support-thread-card ${thread.id === selectedSupportId ? "active" : ""}`}
                      href={`/admin?tab=support&support=${thread.id}`}
                      key={thread.id}
                    >
                      <span className={supportStatusClass(thread.status)}>{supportStatusLabel(thread.status)}</span>
                      <strong>{thread.subject}</strong>
                      <small>
                        {supportProfileName(thread.profiles)} · {supportCategoryLabel(thread.category)}
                      </small>
                      <small>{formatDateTime(thread.last_message_at)}</small>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">아직 문의 내역이 없습니다.</div>
              )}
            </aside>

            <section className="support-chat-panel">
              {selectedSupportThread ? (
                <>
                  <div className="support-chat-header">
                    <div>
                      <span className={supportStatusClass(selectedSupportThread.status)}>{supportStatusLabel(selectedSupportThread.status)}</span>
                      <h2>{selectedSupportThread.subject}</h2>
                      <p>
                        {supportProfileName(selectedSupportThread.profiles)} · {supportCategoryLabel(selectedSupportThread.category)} ·{" "}
                        {formatDateTime(selectedSupportThread.created_at)}
                      </p>
                    </div>
                    <form action={updateSupportThreadStatus} className="inline-form support-status-form">
                      <input type="hidden" name="threadId" value={selectedSupportThread.id} />
                      <select className="select-input compact-select" name="status" defaultValue={selectedSupportThread.status}>
                        <option value="waiting">답변 대기</option>
                        <option value="answered">답변 완료</option>
                        <option value="closed">종료</option>
                      </select>
                      <button className="icon-button subtle compact">상태 저장</button>
                    </form>
                  </div>

                  <div className="support-message-list">
                    {supportMessages.map((message) => (
                      <div className={`support-message ${message.sender_role === "admin" ? "admin" : "user"}`} key={message.id}>
                        <div className="support-message-meta">
                          <strong>{supportMessageAuthor(message)}</strong>
                          <span>{formatDateTime(message.created_at)}</span>
                        </div>
                        <p>{message.body}</p>
                      </div>
                    ))}
                  </div>

                  {selectedSupportThread.status === "closed" ? (
                    <div className="support-closed-note">종료된 문의입니다. 상태를 답변 대기 또는 답변 완료로 바꾸면 다시 답변할 수 있습니다.</div>
                  ) : (
                    <form action={sendSupportMessage} className="support-reply-form">
                      <input type="hidden" name="source" value="admin" />
                      <input type="hidden" name="threadId" value={selectedSupportThread.id} />
                      <textarea className="form-input textarea-input" name="body" placeholder="관리자 답변을 입력하세요." rows={3} maxLength={1000} required />
                      <button className="icon-button primary">
                        <Send size={18} />
                        <span>답변 보내기</span>
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="support-empty-chat">
                  <MessageCircle size={44} />
                  <h2>문의가 도착하면 여기에 표시됩니다</h2>
                  <p>사용자가 1:1 문의를 남기면 목록에서 선택해 바로 답변할 수 있습니다.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </section>
  );
}
