"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/course-card";
import { categories, courses } from "@/lib/data";

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("popular");

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = courses.filter((course) => {
      const matchesCategory = category === "전체" || course.category === category;
      const haystack = `${course.title} ${course.poomsae} ${course.instructor} ${course.description}`.toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });

    return [...list].sort((a, b) => {
      if (sort === "new") return b.publishedAt.localeCompare(a.publishedAt);
      if (sort === "difficulty") return a.difficulty.localeCompare(b.difficulty, "ko");
      return b.popularity - a.popularity;
    });
  }, [category, query, sort]);

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">강의 검색</p>
        <h1>품새 수업에 바로 연결되는 강의</h1>
        <p>품새명, 동작명, 강사명으로 찾고 도장 수업 목적에 맞는 강의를 빠르게 고르세요.</p>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 고려, 앞굽이, 표현력, 김도윤"
          aria-label="강의 검색"
        />
        <select className="select-input" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="정렬">
          <option value="popular">인기순</option>
          <option value="new">최신순</option>
          <option value="difficulty">난이도순</option>
        </select>
      </div>

      <div className="filter-row" aria-label="카테고리 필터">
        {categories.map((item) => (
          <button key={item} className={`filter-button ${item === category ? "active" : ""}`} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="course-grid">
        {filteredCourses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </section>
  );
}
