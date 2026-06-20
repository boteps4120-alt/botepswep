import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, ShieldCheck } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { getRuntimeCourses } from "@/lib/server-courses";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await getRuntimeCourses();
  const featured = courses[0];
  const topCourses = [...courses].sort((a, b) => b.popularity - a.popularity);
  const freeTopCourses = topCourses.filter((course) => !course.isPremium).slice(0, 5);
  const paidTopCourses = topCourses.filter((course) => course.isPremium).slice(0, 5);

  return (
    <>
      <section className="hero-section">
        <Image src="/images/taekwondo-hero.png" alt="태권도 사범이 품새 동작을 지도하는 모습" fill priority className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">태권도장 관장·사범을 위한 품새 강의 플랫폼</p>
          <h1>BOTEPS</h1>
          <p className="hero-copy">
            유튜브보다 체계적으로, 도장 수업에 바로 쓰는 품새 영상과 동작별 챕터 학습을 제공합니다.
          </p>
          <div className="hero-actions">
            <Link className="icon-button primary large" href={`/watch/${featured.slug}`}>
              <PlayCircle size={20} />
              <span>대표 강의 보기</span>
            </Link>
            <Link className="icon-button light large" href="/subscribe">
              <ShieldCheck size={20} />
              <span>월 9,900원 구독</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell intro-band">
        <div>
          <p className="eyebrow">왜 boteps인가</p>
          <h2>도장 수업 흐름에 맞춘 품새 학습 도구</h2>
        </div>
        <div className="feature-row">
          {[
            ["동작별 챕터", "1동작, 2동작처럼 필요한 구간으로 바로 이동합니다."],
            ["지도자 관점", "수업 멘트, 교정 포인트, 감점 요소를 함께 정리합니다."],
            ["이어보기", "사범과 수련생이 어디까지 봤는지 흐름을 유지합니다."]
          ].map(([title, body]) => (
            <div className="feature-item" key={title}>
              <CheckCircle2 size={22} />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell home-course-sections">
        <div className="section-heading">
          <div>
            <p className="eyebrow">추천 강의</p>
            <h2>관장·사범이 바로 활용할 강의</h2>
          </div>
          <Link className="text-link" href="/courses">
            전체 강의 <ArrowRight size={17} />
          </Link>
        </div>
        <div className="course-section-block">
          <div className="course-section-title">
            <p className="eyebrow">무료강의 TOP 5</p>
            <h3>처음 방문한 회원도 바로 시작할 수 있는 강의</h3>
          </div>
          <div className="course-grid">
            {freeTopCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>

        <div className="course-section-block">
          <div className="course-section-title">
            <p className="eyebrow">유료강의 TOP 5</p>
            <h3>구독 회원에게 제공되는 심화 강의</h3>
          </div>
          <div className="course-grid">
            {paidTopCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
