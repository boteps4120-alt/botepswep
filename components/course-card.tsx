import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, PlayCircle, Unlock } from "lucide-react";
import type { Course } from "@/lib/data";

export function CourseCard({ course, initialBookmarked = false }: { course: Course; initialBookmarked?: boolean }) {
  void initialBookmarked;
  const premiumBadgeStyle = course.isPremium
    ? {
        backgroundColor: "#eaf7d5",
        border: "1px solid #c9eca2",
        color: "#2f6b00"
      }
    : undefined;
  const premiumIconStyle = course.isPremium ? { color: "#76b900" } : undefined;

  return (
    <article className="course-card">
      <Link href={`/watch/${course.slug}`} className="course-image-link" aria-label={`${course.title} 바로 시청`}>
        <Image src={course.thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="course-image" />
      </Link>

      <div className="course-card-body">
        <div className="course-card-tags">
          <span className={`course-access-badge ${course.isPremium ? "premium" : "free"}`} style={premiumBadgeStyle}>
            {course.isPremium ? <LockKeyhole size={14} style={premiumIconStyle} /> : <Unlock size={14} />}
            {course.isPremium ? "구독자 전용" : "무료강의"}
          </span>
        </div>

        <h3>
          <Link href={`/watch/${course.slug}`}>{course.title}</Link>
        </h3>

        <Link href={`/watch/${course.slug}`} className="course-watch-button" aria-label={`${course.title} 시청하기`}>
          <PlayCircle size={17} />
          <span>시청하기</span>
        </Link>
      </div>
    </article>
  );
}
