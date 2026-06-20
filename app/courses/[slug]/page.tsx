import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Lock, PlayCircle, Star, Unlock } from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import { CourseCard } from "@/components/course-card";
import { getRuntimeCourse, getRuntimeRelatedCourses } from "@/lib/server-courses";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SubscriptionRow = {
  status: string;
};

type ProfileRow = {
  role: string;
};

function formatUploadDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}.`;
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getRuntimeCourse(slug);
  if (!course) notFound();

  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const [{ data: subscription }, { data: profile }] =
    supabase && user && course.isPremium
      ? await Promise.all([
          supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle<SubscriptionRow>(),
          supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>()
        ])
      : [{ data: null }, { data: null }];

  const isAdmin = profile?.role === "admin";
  const canWatch = !course.isPremium || !hasSupabaseEnv() || isAdmin || subscription?.status === "active";
  const watchHref = canWatch ? `/watch/${course.slug}` : user ? "/subscribe" : `/login?next=/watch/${course.slug}`;
  const watchLabel = canWatch ? "바로 시청하기" : user ? "구독 후 시청하기" : "로그인 후 시청하기";
  const related = await getRuntimeRelatedCourses(course.slug);

  return (
    <section className="page-shell course-detail-shell">
      <div className="detail-hero">
        <div className="detail-hero-copy">
          <p className="eyebrow">{course.category}</p>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="detail-chip-row">
            <span>
              {course.isPremium ? <Lock size={16} /> : <Unlock size={16} />}
              {course.isPremium ? "구독자 전용" : "무료강의"}
            </span>
            <span>
              <Clock size={16} />
              {course.duration}
            </span>
            <span>
              <Star size={16} />
              {course.difficulty}
            </span>
            <span>
              <CalendarDays size={16} />
              {formatUploadDate(course.publishedAt)} 업로드
            </span>
          </div>
          <div className="form-actions">
            <Link className="icon-button primary large" href={watchHref}>
              {canWatch ? <PlayCircle size={20} /> : <Lock size={20} />}
              <span>{watchLabel}</span>
            </Link>
            <BookmarkButton slug={course.slug} size="large" />
          </div>
        </div>

        <div className="detail-hero-media">
          <Image src={course.thumbnail} alt={`${course.title} 썸네일`} fill priority className="course-image" />
          <span>{course.poomsae}</span>
        </div>
      </div>

      <div className="detail-content-grid">
        <section className="player-panel">
          <div className="panel-heading-row">
            <h2>커리큘럼</h2>
            <span>{course.curriculum.length}개 항목</span>
          </div>
          <ul className="lesson-list">
            {course.curriculum.map((item, index) => (
              <li key={item}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="player-panel">
          <div className="panel-heading-row">
            <h2>동작별 챕터</h2>
            <span>{course.chapters.length}개 챕터</span>
          </div>
          <ul className="lesson-list">
            {course.chapters.map((chapter) => (
              <li key={`${chapter.time}-${chapter.title}`}>
                <strong>{chapter.time}</strong>
                <span>{chapter.title}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="player-panel detail-learning-panel">
        <div>
          <h2>이 강의에서 확인할 것</h2>
          <p>도장 수업에 바로 적용할 수 있도록 핵심 포인트와 자주 하는 실수를 함께 정리했습니다.</p>
        </div>
        <ul className="detail-check-list">
          <li>
            <CheckCircle2 size={18} />
            품새 흐름과 동작 연결 확인
          </li>
          <li>
            <CheckCircle2 size={18} />
            지도 시 강조할 설명 포인트 정리
          </li>
          <li>
            <CheckCircle2 size={18} />
            감점 요소와 실수 교정 기준 확인
          </li>
        </ul>
      </section>

      {related.length > 0 ? (
        <div className="section-shell related-course-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">관련 강의</p>
              <h2>같은 카테고리 강의</h2>
            </div>
            <Link className="text-link" href="/courses">
              전체 보기 <ArrowRight size={17} />
            </Link>
          </div>
          <div className="course-grid">
            {related.map((item) => (
              <CourseCard key={item.slug} course={item} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
