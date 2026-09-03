import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, PlayCircle, Search, ShieldCheck } from "lucide-react";
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
  const educationAxes = [
    {
      code: "THEORY",
      question: "왜 하는가?",
      body: "태권도의 역사, 철학, 목적, 구조와 품새의 의미를 이해합니다."
    },
    {
      code: "SCIENCE",
      question: "힘은 어떻게 만들어지는가?",
      body: "생체역학, 중심 이동, 회전, 지면반력을 통해 동작의 원리를 분석합니다."
    },
    {
      code: "TECHNIQUE",
      question: "정확하게 어떻게 하는가?",
      body: "서기, 막기, 지르기, 차기와 품새 동작을 정확하게 익힙니다."
    },
    {
      code: "APPLICATION",
      question: "이 기술은 어디에 쓰이는가?",
      body: "공방, 거리, 타이밍과 전술적 의미를 통해 품새를 실제 기술로 해석합니다."
    },
    {
      code: "TEACHING",
      question: "어떻게 가르쳐야 하는가?",
      body: "오류 교정, 평가 기준, 수업 설계와 지도 멘트를 익힙니다."
    }
  ];

  return (
    <>
      <section className="hero-section home-hero">
        <HomeHeroSlider />
        <div className="hero-overlay" />
        <div className="home-hero-inner home-hero-single">
          <div className="hero-content home-hero-content">
            <div className="hero-brand-mark" aria-label="BOTEPS">
              <Image src="/images/boteps-logo.png" alt="BOTEPS" width={520} height={520} priority />
            </div>
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

      <section className="section-shell home-academy-band">
        <div className="home-academy-intro">
          <p className="eyebrow">왜 BOTEPS인가</p>
          <h2>품새를 외우는 교육에서,<br />품새를 이해하고 해석하고 지도하는 교육으로.</h2>
          <p>
            BOTEPS는 단순히 품새 영상을 제공하는 플랫폼이 아닙니다. 태권도의 원리와 기술을 체계적으로 배우고, 실제 도장 수업과 지도에 적용할 수 있도록 설계된 온라인 아카데미입니다.
          </p>
        </div>
        <div className="home-academy-heading">
          <p className="eyebrow">BOTEPS 5대 교육축</p>
        </div>
        <div className="education-axis-grid">
          {educationAxes.map((axis, index) => (
            <article className="education-axis" key={axis.code}>
              <span className="education-axis-number">0{index + 1}</span>
              <p className="education-axis-code">{axis.code}</p>
              <h3>{axis.question}</h3>
              <p>{axis.body}</p>
            </article>
          ))}
        </div>
        <div className="home-academy-message">
          <strong>배우는 태권도에서, 이해하는 태권도로.</strong>
        </div>
      </section>

      <section id="course-rails" className="section-shell home-course-sections">
        <div className="section-heading refined-heading">
          <div>
            <p className="eyebrow home-course-kicker">BOTEPS 강의</p>
            <h2 className="home-course-heading">신규강의부터 인기강의까지 한 번에</h2>
          </div>
          <Link className="text-link" href="/courses">
            전체 강의 <ArrowRight size={17} />
          </Link>
        </div>

        <CourseRail
          eyebrow="NEW"
          title="신규 강의"
          description="새롭게 공개된 품새 강의를 가장 먼저 만나보세요."
          courses={newCourses}
          tone="clean"
        />
        <CourseRail
          eyebrow="FREE"
          title="무료 강의"
          description="처음 방문한 회원도 부담 없이 바로 시작할 수 있습니다."
          courses={freeTopCourses}
          tone="soft"
        />
        <CourseRail
          eyebrow="POPULAR"
          title="인기 강의"
          description="회원들이 많이 찾는 품새 강의를 모았습니다."
          courses={paidTopCourses}
          tone="line"
        />
      </section>
    </>
  );
}
