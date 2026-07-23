import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/lib/data";

export function CourseCard({
  course,
  initialBookmarked = false
}: {
  course: Course;
  initialBookmarked?: boolean;
}) {
  void initialBookmarked;
  const isPortrait = course.category === "쇼츠" || course.videoOrientation === "portrait";
  const watchHref = `/watch/${course.slug}`;

  return (
    <article className={`course-card ${isPortrait ? "course-card-portrait" : "course-card-landscape"}`}>
      <Link href={watchHref} className="course-image-link" aria-label={`${course.title} 시청`}>
        <Image
          src={course.thumbnail}
          alt={`${course.title} 썸네일`}
          fill
          sizes={isPortrait ? "(max-width: 768px) 62vw, 214px" : "(max-width: 768px) 88vw, 371px"}
          className="course-image"
        />
      </Link>

      <div className="course-card-body">
        <h3>
          <Link href={watchHref}>{course.title}</Link>
        </h3>
        {course.isPremium ? <span className="course-premium-label">구독자 전용</span> : null}
      </div>
    </article>
  );
}
