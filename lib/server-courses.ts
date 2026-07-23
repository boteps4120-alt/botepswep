import { courses as fallbackCourses, type Chapter, type Course, type Difficulty } from "@/lib/data";
import { getGumletEmbedUrl, getGumletHlsUrl, normalizeCourseThumbnailUrl } from "@/lib/gumlet";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type DbChapterRow = {
  course_id?: string;
  title: string;
  starts_at_seconds: number;
  cue: string | null;
  sort_order: number;
};

type DbCourseRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  poomsae: string | null;
  instructor: string | null;
  description: string | null;
  difficulty: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  gumlet_video_id: string | null;
  video_orientation: string | null;
  is_premium: boolean;
  published_at: string | null;
  created_at: string;
  course_chapters?: DbChapterRow[] | null;
};

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "미정";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}분`;
}

function formatChapterTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function normalizeDifficulty(value?: string | null): Difficulty {
  if (value === "입문" || value === "초급" || value === "중급" || value === "고급" || value === "지도자") return value;
  return "입문";
}

function mapChapters(row: DbCourseRow): Chapter[] {
  const chapters = [...(row.course_chapters ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  if (chapters.length === 0) {
    return [
      {
        title: "강의 시작",
        time: "00:00",
        seconds: 0,
        cue: "관리자에서 챕터를 추가하면 동작별 이동이 표시됩니다."
      }
    ];
  }

  return chapters.map((chapter) => ({
    title: chapter.title,
    time: formatChapterTime(chapter.starts_at_seconds),
    seconds: chapter.starts_at_seconds,
    cue: chapter.cue ?? ""
  }));
}

export function mapDbCourse(row: DbCourseRow): Course {
  const hlsUrl = getGumletHlsUrl(row.gumlet_video_id);
  const embedUrl = getGumletEmbedUrl(row.gumlet_video_id);

  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    poomsae: row.poomsae ?? row.category,
    instructor: row.instructor ?? "BOTEPS",
    duration: formatDuration(row.duration_seconds),
    difficulty: normalizeDifficulty(row.difficulty),
    popularity: 100,
    publishedAt: row.published_at ?? row.created_at,
    description: row.description ?? "관리자가 등록한 BOTEPS 강의입니다.",
    audience: "BOTEPS 회원",
    thumbnail: normalizeCourseThumbnailUrl(row.thumbnail_url, row.gumlet_video_id),
    videoUrl: hlsUrl,
    embedUrl,
    videoOrientation: row.video_orientation === "portrait" ? "portrait" : "landscape",
    isPremium: row.is_premium,
    progress: 0,
    curriculum: ["영상 시청", "동작별 챕터 학습", "지도 포인트 정리"],
    chapters: mapChapters(row),
    points: ["관리자가 등록한 강의입니다.", "Gumlet 영상으로 재생됩니다."],
    mistakes: ["챕터와 실수 교정 내용은 관리자 기능 고도화 단계에서 추가합니다."],
    deductions: ["감점 요소는 관리자 기능 고도화 단계에서 추가합니다."]
  };
}

export async function getRuntimeCourses() {
  if (!hasSupabaseEnv()) return fallbackCourses;

  try {
    const supabase = await createClient();
    let { data: courseRows, error: courseError } = await supabase
      .from("courses")
      .select(
        "id,slug,title,category,poomsae,instructor,description,difficulty,duration_seconds,thumbnail_url,gumlet_video_id,video_orientation,is_premium,published_at,created_at"
      )
      .order("created_at", { ascending: false });

    if (courseError) {
      const fallbackResult = await supabase
        .from("courses")
        .select(
          "id,slug,title,category,poomsae,instructor,description,difficulty,duration_seconds,thumbnail_url,gumlet_video_id,is_premium,published_at,created_at"
        )
        .order("created_at", { ascending: false });

      courseRows = fallbackResult.data?.map((course) => ({ ...course, video_orientation: "landscape" })) ?? null;
      courseError = fallbackResult.error;
    }

    if (courseError) return fallbackCourses;

    const rows = (courseRows ?? []) as DbCourseRow[];
    const courseIds = rows.map((row) => row.id);
    const chaptersByCourse = new Map<string, DbChapterRow[]>();

    if (courseIds.length > 0) {
      const { data: chapterRows } = await supabase
        .from("course_chapters")
        .select("course_id,title,starts_at_seconds,cue,sort_order")
        .in("course_id", courseIds)
        .order("sort_order", { ascending: true });

      for (const chapter of (chapterRows ?? []) as DbChapterRow[]) {
        if (!chapter.course_id) continue;
        const chapters = chaptersByCourse.get(chapter.course_id) ?? [];
        chapters.push(chapter);
        chaptersByCourse.set(chapter.course_id, chapters);
      }
    }

    const dbCourses = rows.map((row) =>
      mapDbCourse({
        ...row,
        course_chapters: chaptersByCourse.get(row.id) ?? []
      })
    );
    const dbSlugs = new Set(dbCourses.map((course) => course.slug));
    return [...dbCourses, ...fallbackCourses.filter((course) => !dbSlugs.has(course.slug))];
  } catch {
    return fallbackCourses;
  }
}

function matchesSlug(course: Course, slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return course.slug === slug || course.slug === decodedSlug;
}

export async function getRuntimeCourse(slug: string) {
  const runtimeCourses = await getRuntimeCourses();
  return runtimeCourses.find((course) => matchesSlug(course, slug));
}

export async function getRuntimeRelatedCourses(slug: string) {
  const runtimeCourses = await getRuntimeCourses();
  const active = runtimeCourses.find((course) => matchesSlug(course, slug));
  return runtimeCourses.filter((course) => !matchesSlug(course, slug) && course.category === active?.category).slice(0, 2);
}

export async function getRuntimeNextCourse(slug: string) {
  const runtimeCourses = await getRuntimeCourses();
  const index = runtimeCourses.findIndex((item) => matchesSlug(item, slug));
  return runtimeCourses[(index + 1) % runtimeCourses.length] ?? fallbackCourses[0];
}
