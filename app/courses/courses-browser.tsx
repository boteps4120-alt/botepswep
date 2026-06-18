"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/course-card";
import { categories, getSubcategories, type Course } from "@/lib/data";

export function CoursesBrowser({
  initialBookmarkedSlugs = [],
  initialCourses
}: {
  initialBookmarkedSlugs?: string[];
  initialCourses: Course[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [subcategory, setSubcategory] = useState("전체");
  const [sort, setSort] = useState("popular");

  const subcategories = useMemo(() => getSubcategories(category), [category]);

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = initialCourses.filter((course) => {
      const matchesCategory = category === "전체" || course.category === category;
      const matchesSubcategory = subcategory === "전체" || course.poomsae === subcategory;
      const haystack = `${course.title} ${course.category} ${course.poomsae} ${course.instructor} ${course.description}`.toLowerCase();
      return matchesCategory && matchesSubcategory && (!normalized || haystack.includes(normalized));
    });

    return [...list].sort((a, b) => {
      if (sort === "new") return b.publishedAt.localeCompare(a.publishedAt);
      if (sort === "difficulty") return a.difficulty.localeCompare(b.difficulty, "ko");
      return b.popularity - a.popularity;
    });
  }, [category, initialCourses, query, sort, subcategory]);

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    setSubcategory("전체");
  }

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

      <div className="filter-group">
        <span className="filter-label">대분류</span>
        <div className="filter-row" aria-label="대분류 필터">
          {categories.map((item) => (
            <button key={item} className={`filter-button ${item === category ? "active" : ""}`} onClick={() => selectCategory(item)}>
              {item}
            </button>
          ))}
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
        <span>
          {category}
          {subcategory !== "전체" ? ` / ${subcategory}` : ""}
        </span>
      </div>

      <div className="course-grid">
        {filteredCourses.map((course) => (
          <CourseCard key={course.slug} course={course} initialBookmarked={initialBookmarkedSlugs.includes(course.slug)} />
        ))}
      </div>
    </>
  );
}
