import { getRuntimeCourses } from "@/lib/server-courses";
import { CoursesBrowser } from "./courses-browser";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const runtimeCourses = await getRuntimeCourses();

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">강의 검색</p>
        <h1>품새 수업에 바로 연결되는 강의</h1>
        <p>유급자 품새, 유단자 품새, 기본동작, 서기, 품새 이론 기준으로 강의를 빠르게 고르세요.</p>
      </div>

      <CoursesBrowser initialCourses={runtimeCourses} />
    </section>
  );
}
