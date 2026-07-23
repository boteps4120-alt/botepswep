"use client";

import { useEffect, useMemo, useState } from "react";
import { CourseCard } from "@/components/course-card";
import { courseCategoryTree, getSubcategories, type Course } from "@/lib/data";

type AccessFilter = "all" | "paid" | "free";

export function CoursesBrowser({
  initialAccessFilter = "all",
  initialBookmarkedSlugs = [],
  initialCategory = "전체",
  initialQuery = "",
  initialSubcategory = "전체",
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
  const [accessFilter, setAccessFilter] = useState<AccessFilter>(initialAccessFilter);
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [sort, setSort] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const standardCategories = useMemo(() => courseCategoryTree.filter((item) => item.name !== "쇼츠"), []);

  const subcategories = useMemo(() => getSubcategories(category), [category]);

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = initialCourses.filter((course) => {
      const matchesAccess =
        accessFilter === "all" || (accessFilter === "paid" && course.isPremium) || (accessFilter === "free" && !course.isPremium);
      const matchesCategory = category === "전체" || course.category === category;
      const matchesSubcategory = subcategory === "전체" || course.poomsae === subcategory;
      const haystack = `${course.title} ${course.category} ${course.poomsae} ${course.instructor} ${course.description}`.toLowerCase();
      return matchesAccess && matchesCategory && matchesSubcategory && (!normalized || haystack.includes(normalized));
    });

    return [...list].sort((a, b) => {
      if (sort === "new") return b.publishedAt.localeCompare(a.publishedAt);
      if (sort === "difficulty") return a.difficulty.localeCompare(b.difficulty, "ko");
      return b.popularity - a.popularity;
    });
  }, [accessFilter, category, initialCourses, query, sort, subcategory]);

  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  const visibleCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [currentPage, filteredCourses]);

  function selectCategory(nextAccessFilter: AccessFilter, nextCategory: string) {
    setAccessFilter(nextAccessFilter);
    setCategory(nextCategory);
    setCurrentPage(1);
    setSubcategory("전체");
  }

  function renderSubcategoryFilters(forAccessFilter: AccessFilter) {
    if (accessFilter !== forAccessFilter || category === "전체" || subcategories.length === 0) {
      return null;
    }

    return (
      <div className="filter-line filter-subline" aria-label={`${forAccessFilter === "paid" ? "유료강의" : "무료강의"} 하위 항목 필터`}>
        <span className="filter-label">하위 항목</span>
        <div className="filter-row">
          {["전체", ...subcategories].map((item) => (
            <button
              key={`${forAccessFilter}-${item}`}
              className={`filter-button ${item === subcategory ? "active" : ""}`}
              onClick={() => {
                setSubcategory(item);
                setCurrentPage(1);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const resultLabel = [
    accessFilter === "paid" ? "유료강의" : accessFilter === "free" ? "무료강의" : "전체 강의",
    category !== "전체" ? category : "",
    subcategory !== "전체" ? subcategory : ""
  ]
    .filter(Boolean)
    .join(" / ");

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
          placeholder="예: 고려, 8장, 아래막기, 앞굽이"
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

      <div className="access-category-filters">
        <div className="filter-reset-row">
          <button className={`filter-button ${accessFilter === "all" && category === "전체" ? "active" : ""}`} onClick={() => selectCategory("all", "전체")}>
            전체 강의
          </button>
        </div>
        <div className="filter-line" aria-label="유료강의 필터">
          <span className="filter-label">유료강의</span>
          <div className="filter-row">
            {["전체", ...standardCategories.map((item) => item.name)].map((item) => (
              <button
                key={`paid-${item}`}
                className={`filter-button ${accessFilter === "paid" && item === category ? "active" : ""}`}
                onClick={() => selectCategory("paid", item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {renderSubcategoryFilters("paid")}
        <div className="filter-line" aria-label="무료강의 필터">
          <span className="filter-label">무료강의</span>
          <div className="filter-row">
            {["전체", ...standardCategories.map((item) => item.name)].map((item) => (
              <button
                key={`free-${item}`}
                className={`filter-button ${accessFilter === "free" && item === category ? "active" : ""}`}
                onClick={() => selectCategory("free", item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {renderSubcategoryFilters("free")}
        <div className="filter-line" aria-label="쇼츠 필터">
          <span className="filter-label">쇼츠</span>
          <div className="filter-row">
            <button
              className={`filter-button ${accessFilter === "all" && category === "쇼츠" ? "active" : ""}`}
              onClick={() => selectCategory("all", "쇼츠")}
            >
              전체
            </button>
          </div>
        </div>
      </div>

      <div className="course-result-bar">
        <strong>{filteredCourses.length}개 강의</strong>
        <span>{resultLabel}</span>
      </div>

      <div className="course-grid">
        {visibleCourses.map((course) => (
          <CourseCard key={course.slug} course={course} initialBookmarked={initialBookmarkedSlugs.includes(course.slug)} />
        ))}
      </div>

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
