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

export default async function CoursesPage({
  searchParams
}: {
  searchParams?: Promise<{
    query?: string;
    access?: string;
    category?: string;
    subcategory?: string;
  }>;
}) {
  const params = await searchParams;
  const initialQuery = typeof params?.query === "string" ? params.query : "";
  const initialAccessFilter = params?.access === "paid" || params?.access === "free" ? params.access : "all";
  const initialCategory = typeof params?.category === "string" ? params.category : "전체";
  const initialSubcategory = typeof params?.subcategory === "string" ? params.subcategory : "전체";
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
    <section className="page-shell courses-page-shell">
      <div className="page-title">
        <p className="eyebrow">BOTEPS ACADEMY</p>
        <h1>체계적으로 완성하는 품새 교육과정</h1>
        <p>기초 이론부터 태극·유단자 품새, 지도자 과정까지 COURSE 01~10의 순서로 학습하세요.</p>
      </div>

      <CoursesBrowser
        initialAccessFilter={initialAccessFilter}
        initialBookmarkedSlugs={bookmarkedSlugs}
        initialCategory={initialCategory}
        initialCourses={runtimeCourses}
        initialQuery={initialQuery}
        initialSubcategory={initialSubcategory}
      />
    </section>
  );
}
