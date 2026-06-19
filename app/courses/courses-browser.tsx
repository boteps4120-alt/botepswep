"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/course-card";
import { courseCategoryTree, getSubcategories, type Course } from "@/lib/data";

type AccessFilter = "all" | "paid" | "free";

export function CoursesBrowser({
  initialBookmarkedSlugs = [],
  initialCourses
}: {
  initialBookmarkedSlugs?: string[];
  initialCourses: Course[];
}) {
  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [category, setCategory] = useState("전체");
  const [subcategory, setSubcategory] = useState("전체");
  const [sort, setSort] = useState("popular");

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

  function selectCategory(nextAccessFilter: AccessFilter, nextCategory: string) {
    setAccessFilter(nextAccessFilter);
    setCategory(nextCategory);
    setSubcategory("전체");
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
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 고려, 8장, 아래막기, 앞굽이"
          aria-label="강의 검색"
        />
        <select className="select-input" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="정렬">
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
            {["전체", ...courseCategoryTree.map((item) => item.name)].map((item) => (
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
        <div className="filter-line" aria-label="무료강의 필터">
          <span className="filter-label">무료강의</span>
          <div className="filter-row">
            {["전체", ...courseCategoryTree.map((item) => item.name)].map((item) => (
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
      </div>

      {subcategories.length > 0 ? (
        <div className="filter-group">
          <span className="filter-label">하위 항목</span>
          <div className="filter-row" aria-label="하위 항목 필터">
            {["전체", ...subcategories].map((item) => (
              <button
                key={item}
                className={`filter-button ${item === subcategory ? "active" : ""}`}
                onClick={() => setSubcategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="course-result-bar">
        <strong>{filteredCourses.length}개 강의</strong>
        <span>{resultLabel}</span>
      </div>

      <div className="course-grid">
        {filteredCourses.map((course) => (
          <CourseCard key={course.slug} course={course} initialBookmarked={initialBookmarkedSlugs.includes(course.slug)} />
        ))}
      </div>
    </>
  );
}
