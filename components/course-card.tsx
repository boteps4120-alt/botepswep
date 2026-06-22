import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, Unlock } from "lucide-react";
import type { Course } from "@/lib/data";

export function CourseCard({ course, initialBookmarked = false }: { course: Course; initialBookmarked?: boolean }) {
  void initialBookmarked;

  return (
    <article className="course-card">
      <Link href={`/watch/${course.slug}`} className="course-image-link" aria-label={`${course.title} 바로 시청`}>
        <Image src={course.thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="course-image" />
      </Link>

      <div className="course-card-body">
        <div className="course-card-tags">
          <span className={`course-access-badge ${course.isPremium ? "premium" : "free"}`}>
            {course.isPremium ? <LockKeyhole size={14} /> : <Unlock size={14} />}
            {course.isPremium ? "구독자 전용" : "무료강의"}
          </span>
        </div>

        <h3>
          <Link href={`/watch/${course.slug}`}>{course.title}</Link>
        </h3>
      </div>
    </article>
  );
}
