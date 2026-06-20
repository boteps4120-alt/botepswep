"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { trackCourseEvent } from "@/app/watch/actions";

type BookmarkResult = {
  ok: boolean;
  bookmarked: boolean;
  message: string;
};

export async function toggleBookmark(slug: string, shouldBookmark: boolean): Promise<BookmarkResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      bookmarked: false,
      message: "Supabase 연동 후 찜하기를 사용할 수 있습니다."
    };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return {
      ok: false,
      bookmarked: false,
      message: "로그인 후 찜하기를 사용할 수 있습니다."
    };
  }

  const decodedSlug = decodeURIComponent(slug);
  const { data: decodedCourse } = await supabase.from("courses").select("id").eq("slug", decodedSlug).maybeSingle<{ id: string }>();
  const { data: rawCourse } = decodedCourse
    ? { data: null }
    : await supabase.from("courses").select("id").eq("slug", slug).maybeSingle<{ id: string }>();
  const course = decodedCourse ?? rawCourse;

  if (!course) {
    return {
      ok: false,
      bookmarked: false,
      message: "강의 정보를 찾을 수 없습니다."
    };
  }

  if (shouldBookmark) {
    const { error } = await supabase.from("bookmarks").upsert({
      user_id: user.id,
      course_id: course.id
    });

    if (error) {
      return {
        ok: false,
        bookmarked: false,
        message: "찜하기 저장 중 문제가 발생했습니다."
      };
    }
  } else {
    const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("course_id", course.id);

    if (error) {
      return {
        ok: false,
        bookmarked: true,
        message: "찜하기 해제 중 문제가 발생했습니다."
      };
    }
  }

  revalidatePath("/courses");
  revalidatePath("/mypage");
  revalidatePath(`/courses/${slug}`);

  if (shouldBookmark) {
    await trackCourseEvent(slug, "bookmark_add");
  }

  return {
    ok: true,
    bookmarked: shouldBookmark,
    message: shouldBookmark ? "영상을 찜했습니다." : "찜을 해제했습니다."
  };
}
