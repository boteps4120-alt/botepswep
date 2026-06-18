import { getRuntimeCourses } from "@/lib/server-courses";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { CoursesBrowser } from "./courses-browser";

export const dynamic = "force-dynamic";

type BookmarkSlugRow = {
  courses: {
    slug: string;
  } | null;
};

export default async function CoursesPage() {
  const runtimeCourses = await getRuntimeCourses();
  let bookmarkedSlugs: string[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (authData.user) {
      const { data } = await supabase
        .from("bookmarks")
        .select("courses(slug)")
        .eq("user_id", authData.user.id);

      bookmarkedSlugs = ((data ?? []) as unknown as BookmarkSlugRow[])
        .map((bookmark) => bookmark.courses?.slug)
        .filter((slug): slug is string => Boolean(slug));
    }
  }

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">강의 검색</p>
        <h1>품새 수업에 바로 연결되는 강의</h1>
        <p>유급자 품새, 유단자 품새, 기본동작, 서기, 품새 이론 기준으로 강의를 빠르게 고르세요.</p>
      </div>

      <CoursesBrowser initialBookmarkedSlugs={bookmarkedSlugs} initialCourses={runtimeCourses} />
    </section>
  );
}
