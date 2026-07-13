"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Course } from "@/lib/data";
import { CourseCard } from "./course-card";

type CourseRailProps = {
  eyebrow: string;
  title: string;
  description?: string;
  courses: Course[];
  tone?: "clean" | "soft" | "line";
};

export function CourseRail({ eyebrow, title, description, courses, tone = "clean" }: CourseRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState({ left: 0, width: 100 });
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const updateProgress = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const visibleRatio = Math.min(1, rail.clientWidth / rail.scrollWidth);
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const scrollRatio = maxScroll ? rail.scrollLeft / maxScroll : 0;
    const width = visibleRatio * 100;

    setProgress({
      width,
      left: scrollRatio * (100 - width)
    });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateProgress();
    const resizeObserver = new ResizeObserver(updateProgress);
    resizeObserver.observe(rail);
    window.addEventListener("resize", updateProgress);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateProgress);
    };
  }, [courses.length, updateProgress]);

  function scrollByCard(direction: "prev" | "next") {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".course-card");
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap || "0");
    const distance = (card?.offsetWidth ?? 384) + gap;
    rail.scrollBy({ left: direction === "next" ? distance : -distance, behavior: "smooth" });
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
          {description ? <p>{description}</p> : null}
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
        onScroll={updateProgress}
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
      <div className="course-rail-progress" aria-hidden="true">
        <span style={{ left: `${progress.left}%`, width: `${progress.width}%` }} />
      </div>
    </section>
  );
}
