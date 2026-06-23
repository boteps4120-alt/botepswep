import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock3, PlayCircle, Search, ShieldCheck, Target } from "lucide-react";
import { CourseRail } from "@/components/course-rail";
import { HomeHeroSlider } from "@/components/home-hero-slider";
import { getRuntimeCourses } from "@/lib/server-courses";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await getRuntimeCourses();
  const featured = courses[0];
  const newCourses = [...courses].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5);
  const topCourses = [...courses].sort((a, b) => b.popularity - a.popularity);
  const freeTopCourses = topCourses.filter((course) => !course.isPremium).slice(0, 5);
  const paidTopCourses = topCourses.filter((course) => course.isPremium).slice(0, 5);
  const quickSearches = ["옆차기", "고려", "시합 감점"];

  return (
    <>
      <section className="hero-section home-hero">
        <HomeHeroSlider />
        <div className="hero-overlay" />
        <div className="home-hero-inner home-hero-single">
          <div className="hero-content home-hero-content">
            <p className="eyebrow">태권도장 관장·사범을 위한 품새 강의 플랫폼</p>
            <h1>BOTEPS</h1>
            <p className="hero-copy">
              도장 수업에서 바로 쓰는 품새 영상, 동작별 챕터, 지도 포인트를 한곳에서 관리하고 학습합니다.
            </p>
            <form className="hero-search" action="/courses">
              <Search size={22} aria-hidden="true" />
              <input name="query" type="search" placeholder="옆차기, 고려, 시합 감점 검색" aria-label="강의 검색어" />
              <button type="submit">검색</button>
            </form>
            <div className="hero-quick-searches" aria-label="추천 검색어">
              {quickSearches.map((keyword) => (
                <Link key={keyword} href={`/courses?query=${encodeURIComponent(keyword)}`}>
                  {keyword}
                </Link>
              ))}
            </div>
            <div className="hero-actions">
              <Link className="icon-button primary large" href={`/watch/${featured.slug}`}>
                <PlayCircle size={20} />
                <span>대표 강의 보기</span>
              </Link>
              <Link className="icon-button light large" href="/courses">
                <BookOpenCheck size={20} />
                <span>강의 둘러보기</span>
              </Link>
              <Link className="icon-button light large" href="/subscribe">
                <ShieldCheck size={20} />
                <span>월 9,900원 구독</span>
              </Link>
            </div>
            <div className="hero-proof-row" aria-label="BOTEPS 주요 특징">
              <span>품새별 커리큘럼</span>
              <span>동작별 챕터</span>
              <span>무료·구독 강의 운영</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell home-value-band">
        <div className="home-value-heading">
          <p className="eyebrow">왜 BOTEPS인가</p>
          <h2>품새 수업 준비 시간을 줄이고 지도 품질은 더 일정하게</h2>
        </div>
        <div className="feature-row">
          {[
            {
              icon: <Target size={24} />,
              title: "동작별 챕터 학습",
              body: "필요한 동작 구간으로 바로 이동해 수업 전 체크와 반복 학습을 빠르게 진행합니다."
            },
            {
              icon: <CheckCircle2 size={24} />,
              title: "지도 포인트 정리",
              body: "자주 하는 실수, 감점 요소, 수업 멘트를 강의별로 확인할 수 있습니다."
            },
            {
              icon: <Clock3 size={24} />,
              title: "도장 운영에 맞춘 흐름",
              body: "무료 강의와 구독 강의를 나눠 운영하고, 회원별 시청 데이터를 기반으로 개선합니다."
            }
          ].map((item) => (
            <div className="feature-item elevated-feature" key={item.title}>
              {item.icon}
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell home-course-sections">
        <div className="section-heading refined-heading">
          <div>
            <p className="eyebrow">BOTEPS 강의</p>
            <h2>신규강의부터 인기강의까지 한 번에</h2>
          </div>
          <Link className="text-link" href="/courses">
            전체 강의 <ArrowRight size={17} />
          </Link>
        </div>

        <CourseRail eyebrow="" title="신규 강의" courses={newCourses} tone="clean" />
        <CourseRail eyebrow="" title="무료 강의" courses={freeTopCourses} tone="soft" />
        <CourseRail eyebrow="" title="인기 강의" courses={paidTopCourses} tone="line" />
      </section>
    </>
  );
}
