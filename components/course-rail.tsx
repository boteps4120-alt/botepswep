"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Course } from "@/lib/data";
import { CourseCard } from "./course-card";

type CourseRailProps = {
  eyebrow: string;
  title: string;
  courses: Course[];
  tone?: "clean" | "soft" | "line";
};

export function CourseRail({ eyebrow, title, courses, tone = "clean" }: CourseRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  function scrollByCard(direction: "prev" | "next") {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction === "next" ? 452 : -452, behavior: "smooth" });
  }

  function startDrag(clientX: number) {
    const rail = railRef.current;
    if (!rail) return;
    setIsDragging(true);
    dragStart.current = { x: clientX, scrollLeft: rail.scrollLeft };
  }

  function moveDrag(clientX: number) {
    const rail = railRef.current;
    if (!rail || !isDragging) return;
    rail.scrollLeft = dragStart.current.scrollLeft - (clientX - dragStart.current.x);
  }

  function endDrag() {
    setIsDragging(false);
  }

  return (
    <section className={`course-rail-section course-rail-${tone}`}>
      <div className="course-rail-heading">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h3>{title}</h3>
        </div>
        <div className="rail-controls" aria-label={`${title} 이동`}>
          <button type="button" onClick={() => scrollByCard("prev")} aria-label="이전 강의">
            <ChevronLeft size={22} />
          </button>
          <button type="button" onClick={() => scrollByCard("next")} aria-label="다음 강의">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className={`course-rail ${isDragging ? "dragging" : ""}`}
        onMouseDown={(event) => startDrag(event.clientX)}
        onMouseMove={(event) => moveDrag(event.clientX)}
        onMouseLeave={endDrag}
        onMouseUp={endDrag}
        onTouchStart={(event) => startDrag(event.touches[0].clientX)}
        onTouchMove={(event) => moveDrag(event.touches[0].clientX)}
        onTouchEnd={endDrag}
      >
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </section>
  );
}
