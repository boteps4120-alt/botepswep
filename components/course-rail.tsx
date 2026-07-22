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
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProgressDragging, setIsProgressDragging] = useState(false);
  const [progress, setProgress] = useState({ left: 0, width: 100 });
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const progressDragActive = useRef(false);

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

  function scrollToProgress(clientX: number) {
    const rail = railRef.current;
    const track = progressRef.current;
    if (!rail || !track) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    if (!maxScroll) return;

    const rect = track.getBoundingClientRect();
    const thumbWidth = rect.width * (progress.width / 100);
    const movableWidth = Math.max(1, rect.width - thumbWidth);
    const thumbLeft = Math.min(
      movableWidth,
      Math.max(0, clientX - rect.left - thumbWidth / 2)
    );

    rail.scrollLeft = (thumbLeft / movableWidth) * maxScroll;
  }

  function handleProgressKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const step = Math.max(80, rail.clientWidth * 0.2);

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      rail.scrollBy({ left: -step, behavior: "smooth" });
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      rail.scrollBy({ left: step, behavior: "smooth" });
    } else if (event.key === "Home") {
      event.preventDefault();
      rail.scrollTo({ left: 0, behavior: "smooth" });
    } else if (event.key === "End") {
      event.preventDefault();
      rail.scrollTo({ left: maxScroll, behavior: "smooth" });
    }
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
      <div
        ref={progressRef}
        className={`course-rail-progress ${isProgressDragging ? "dragging" : ""}`}
        role="slider"
        tabIndex={0}
        aria-label={`${title} 강의 목록 위치`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.left + progress.width / 2)}
        onKeyDown={handleProgressKeyDown}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          progressDragActive.current = true;
          setIsProgressDragging(true);
          scrollToProgress(event.clientX);
        }}
        onPointerMove={(event) => {
          if (progressDragActive.current) scrollToProgress(event.clientX);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          progressDragActive.current = false;
          setIsProgressDragging(false);
        }}
        onPointerCancel={() => {
          progressDragActive.current = false;
          setIsProgressDragging(false);
        }}
      >
        <span style={{ left: `${progress.left}%`, width: `${progress.width}%` }} />
      </div>
    </section>
  );
}
