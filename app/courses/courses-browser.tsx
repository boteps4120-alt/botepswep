"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/course-card";
import { curriculumPrograms, getCurriculumProgramCode, type Course } from "@/lib/data";

type AccessFilter = "all" | "paid" | "free";
type CourseSection = "curriculum" | "free" | "shorts";

function initialSection(access: AccessFilter, category: string): CourseSection {
  if (category === "쇼츠") return "shorts";
  if (access === "free" || category === "무료강의") return "free";
  return "curriculum";
}

export function CoursesBrowser({
  initialAccessFilter = "all",
  initialBookmarkedSlugs = [],
  initialCategory = "전체",
  initialQuery = "",
  initialCourses
}: {
  initialAccessFilter?: AccessFilter;
  initialBookmarkedSlugs?: string[];
  initialCategory?: string;
  initialQuery?: string;
  initialSubcategory?: string;
  initialCourses: Course[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [section, setSection] = useState<CourseSection>(() => initialSection(initialAccessFilter, initialCategory));
  const [program, setProgram] = useState(
    curriculumPrograms.some((item) => item.code === initialCategory) ? initialCategory : "전체"
  );
  const [sort, setSort] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = initialCourses.filter((course) => {
      const isShort = course.category === "쇼츠" || course.videoOrientation === "portrait";
      const matchesSection =
        section === "shorts"
          ? isShort
          : section === "free"
            ? !isShort && (!course.isPremium || course.category === "무료강의")
            : !isShort && course.category !== "무료강의";
      const matchesProgram =
        section !== "curriculum" || program === "전체" || getCurriculumProgramCode(course) === program;
      const haystack = `${course.title} ${course.category} ${course.poomsae} ${course.instructor} ${course.description}`.toLowerCase();

      return matchesSection && matchesProgram && (!normalized || haystack.includes(normalized));
    });

    return [...list].sort((a, b) => {
      if (sort === "new") return b.publishedAt.localeCompare(a.publishedAt);
      if (sort === "difficulty") return a.difficulty.localeCompare(b.difficulty, "ko");
      if (section === "curriculum" && program === "전체") {
        return getCurriculumProgramCode(a).localeCompare(getCurriculumProgramCode(b)) || b.popularity - a.popularity;
      }
      return b.popularity - a.popularity;
    });
  }, [initialCourses, program, query, section, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));

  const visibleCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [currentPage, filteredCourses]);

  function selectSection(nextSection: CourseSection) {
    setSection(nextSection);
    setProgram("전체");
    setCurrentPage(1);
  }

  const resultLabel =
    section === "curriculum"
      ? program === "전체"
        ? "BOTEPS 교육과정"
        : `${program} ${curriculumPrograms.find((item) => item.code === program)?.title ?? ""}`
      : section === "free"
        ? "무료강의"
        : "쇼츠";

  return (
    <>
      <div className="toolbar">
        <input
          className="search-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="강의명, 품새, 동작 검색"
          aria-label="강의 검색"
        />
        <select
          className="select-input"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="정렬"
        >
          <option value="popular">인기순</option>
          <option value="new">최신순</option>
          <option value="difficulty">난이도순</option>
        </select>
      </div>

      <div className="course-section-tabs" role="tablist" aria-label="강의 분류">
        <button className={section === "curriculum" ? "active" : ""} onClick={() => selectSection("curriculum")}>
          BOTEPS 교육과정
        </button>
        <button className={section === "free" ? "active" : ""} onClick={() => selectSection("free")}>
          무료강의
        </button>
        <button className={section === "shorts" ? "active" : ""} onClick={() => selectSection("shorts")}>
          쇼츠
        </button>
      </div>

      {section === "curriculum" ? (
        <div className="curriculum-filter" aria-label="BOTEPS 교육과정 선택">
          <button
            className={`curriculum-filter-button ${program === "전체" ? "active" : ""}`}
            onClick={() => {
              setProgram("전체");
              setCurrentPage(1);
            }}
          >
            <span>ALL COURSES</span>
            <strong>전체 교육과정</strong>
          </button>
          {curriculumPrograms.map((item) => (
            <button
              key={item.code}
              className={`curriculum-filter-button ${program === item.code ? "active" : ""}`}
              onClick={() => {
                setProgram(item.code);
                setCurrentPage(1);
              }}
            >
              <span>{item.code}</span>
              <strong>{item.title}</strong>
              <small>{item.englishTitle}</small>
            </button>
          ))}
        </div>
      ) : null}

      <div className="course-result-bar">
        <strong>{filteredCourses.length}개 강의</strong>
        <span>{resultLabel}</span>
      </div>

      <div className="course-grid">
        {visibleCourses.map((course) => (
          <CourseCard key={course.slug} course={course} initialBookmarked={initialBookmarkedSlugs.includes(course.slug)} />
        ))}
      </div>

      {filteredCourses.length === 0 ? <div className="empty-state">이 분류에 등록된 강의가 아직 없습니다.</div> : null}

      <nav className="course-pagination" aria-label="강의 페이지 이동">
        <button
          type="button"
          className="course-pagination-button course-pagination-arrow"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          이전
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            className={`course-pagination-button ${page === currentPage ? "active" : ""}`}
            onClick={() => setCurrentPage(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          className="course-pagination-button course-pagination-arrow"
          onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
          disabled={currentPage === pageCount}
          aria-label="다음 페이지"
        >
          다음
        </button>
      </nav>
    </>
  );
}
