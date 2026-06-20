import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, LockKeyhole, PlayCircle, Star, Unlock } from "lucide-react";
import type { Course } from "@/lib/data";
import { BookmarkButton } from "./bookmark-button";

function formatUploadDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}.`;
}

export function CourseCard({ course, initialBookmarked = false }: { course: Course; initialBookmarked?: boolean }) {
  return (
    <article className="course-card">
      <Link href={`/watch/${course.slug}`} className="course-image-link" aria-label={`${course.title} 바로 시청`}>
        <Image src={course.thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="course-image" />
        <span className="course-badge">{course.category}</span>
        <span className={`course-access-badge ${course.isPremium ? "premium" : "free"}`}>
          {course.isPremium ? <LockKeyhole size={14} /> : <Unlock size={14} />}
          {course.isPremium ? "구독자 전용" : "무료강의"}
        </span>
      </Link>

      <div className="course-card-body">
        <span className="course-poomsae-label">{course.poomsae}</span>
        <div className="course-meta">
          <span>
            <Clock size={15} /> {course.duration}
          </span>
          <span>
            <Star size={15} /> {course.difficulty}
          </span>
          <span>
            <CalendarDays size={15} /> {formatUploadDate(course.publishedAt)} 업로드
          </span>
        </div>

        <h3>
          <Link href={`/watch/${course.slug}`}>{course.title}</Link>
        </h3>
        <p>{course.description}</p>

        <div className="card-footer">
          <div className="card-actions">
            <BookmarkButton slug={course.slug} initialBookmarked={initialBookmarked} />
            <Link className="icon-button primary compact" href={`/watch/${course.slug}`}>
              <PlayCircle size={17} />
              <span>시청</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
