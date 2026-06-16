import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Bookmark, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { currentUser, getCourse, relatedCourses } from "@/lib/data";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const canWatch = !course.isPremium || currentUser.isSubscribed;
  const related = relatedCourses(course.slug);

  return (
    <section className="page-shell">
      <div className="detail-grid">
        <div>
          <div className="detail-media">
            <Image src={course.thumbnail} alt={`${course.title} 썸네일`} fill priority className="course-image" />
          </div>
          <div className="detail-card">
            <p className="eyebrow">{course.category}</p>
            <h1>{course.title}</h1>
            <p className="detail-copy">{course.description}</p>
            <ul className="bullet-list">
              {course.curriculum.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="form-actions">
              <Link className="icon-button primary large" href={canWatch ? `/watch/${course.slug}` : "/subscribe"}>
                {canWatch ? <PlayCircle size={20} /> : <Lock size={20} />}
                <span>{canWatch ? "강의 시청" : "구독 후 시청"}</span>
              </Link>
              <button className="icon-button subtle large">
                <Bookmark size={20} />
                <span>찜하기</span>
              </button>
            </div>
          </div>
        </div>

        <aside className="side-box">
          <h2>강의 정보</h2>
          <ul className="info-list">
            <li>
              <span>품새</span>
              <strong>{course.poomsae}</strong>
            </li>
            <li>
              <span>강사</span>
              <strong>{course.instructor}</strong>
            </li>
            <li>
              <span>시간</span>
              <strong>{course.duration}</strong>
            </li>
            <li>
              <span>난이도</span>
              <strong>{course.difficulty}</strong>
            </li>
            <li>
              <span>권한</span>
              <strong>{course.isPremium ? "구독자 전용" : "무료 미리보기"}</strong>
            </li>
          </ul>
          <div className="integration-list">
            <div className="integration-item">
              <span>수강 가능</span>
              <CheckCircle2 size={18} color="#167c76" />
            </div>
            <div className="integration-item">
              <span>동작별 챕터</span>
              <strong>{course.chapters.length}개</strong>
            </div>
            <div className="integration-item">
              <span>진도율</span>
              <strong>{course.progress}%</strong>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <div className="section-shell" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
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
