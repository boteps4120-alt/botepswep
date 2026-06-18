import Image from "next/image";
import Link from "next/link";
import { Clock, PlayCircle, Star } from "lucide-react";
import type { Course } from "@/lib/data";
import { BookmarkButton } from "./bookmark-button";

export function CourseCard({ course, initialBookmarked = false }: { course: Course; initialBookmarked?: boolean }) {
  return (
    <article className="course-card">
      <Link href={`/watch/${course.slug}`} className="course-image-link" aria-label={`${course.title} 바로 시청`}>
        <Image src={course.thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="course-image" />
        <span className="course-badge">{course.category}</span>
      </Link>
      <div className="course-card-body">
        <div className="course-meta">
          <span>
            <Clock size={15} /> {course.duration}
          </span>
          <span>
            <Star size={15} /> {course.difficulty}
          </span>
        </div>
        <h3>
          <Link href={`/watch/${course.slug}`}>{course.title}</Link>
        </h3>
        <p>{course.description}</p>
        <div className="card-footer">
          <span>{course.poomsae}</span>
          <div className="card-actions">
            <BookmarkButton slug={course.slug} initialBookmarked={initialBookmarked} />
            <Link className="icon-button compact" href={`/watch/${course.slug}`}>
              <PlayCircle size={17} />
              <span>시청</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
