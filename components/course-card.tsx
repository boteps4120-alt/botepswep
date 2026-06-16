import Image from "next/image";
import Link from "next/link";
import { Clock, PlayCircle, Star } from "lucide-react";
import type { Course } from "@/lib/data";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="course-card">
      <Link href={`/courses/${course.slug}`} className="course-image-link" aria-label={`${course.title} 상세 보기`}>
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
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="card-footer">
          <span>{course.instructor}</span>
          <Link className="icon-button compact" href={`/watch/${course.slug}`}>
            <PlayCircle size={17} />
            <span>시청</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
