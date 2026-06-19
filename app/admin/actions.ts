"use server";

import { revalidatePath } from "next/cache";
import { extractGumletAssetId } from "@/lib/gumlet";
import { createClient } from "@/lib/supabase/server";

const subscriptionStatuses = new Set(["inactive", "active", "past_due", "canceled", "expired"]);
const roles = new Set(["user", "admin"]);
const videoOrientations = new Set(["landscape", "portrait"]);

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<{ role: string }>();

  if (profile?.role !== "admin") {
    throw new Error("관리자 권한이 필요합니다.");
  }

  return supabase;
}

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeGumletVideoValue(value: string) {
  if (value.endsWith(".m3u8")) return value;
  return extractGumletAssetId(value);
}

export async function updateSubscriptionStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const userId = clean(formData.get("userId"));
  const status = clean(formData.get("status"));

  if (!userId || !subscriptionStatuses.has(status)) {
    throw new Error("구독 상태 값이 올바르지 않습니다.");
  }

  const currentPeriodEnd =
    status === "active" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;

  const { error } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    status,
    provider: "manual",
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/mypage");
}

export async function updateProfileRole(formData: FormData) {
  const supabase = await requireAdmin();
  const userId = clean(formData.get("userId"));
  const role = clean(formData.get("role"));

  if (!userId || !roles.has(role)) {
    throw new Error("권한 값이 올바르지 않습니다.");
  }

  const { error } = await supabase.from("profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function createCourse(formData: FormData) {
  const supabase = await requireAdmin();
  const title = clean(formData.get("title"));
  const category = clean(formData.get("category"));
  const poomsae = clean(formData.get("poomsae"));
  const instructor = clean(formData.get("instructor"));
  const gumletVideoId = normalizeGumletVideoValue(clean(formData.get("gumletVideoId")));
  const videoOrientation = clean(formData.get("videoOrientation")) || "landscape";
  const description = clean(formData.get("description"));
  const thumbnailUrl = clean(formData.get("thumbnailUrl")) || "/images/taekwondo-hero.png";
  const isPremium = clean(formData.get("isPremium")) === "true";
  const slug = slugify(title);

  if (!title || !category || !poomsae || !slug) {
    throw new Error("강의 제목, 카테고리, 하위 항목, 슬러그는 필수입니다.");
  }

  if (!gumletVideoId) {
    throw new Error("Gumlet Asset ID 또는 영상 URL을 입력해주세요.");
  }

  if (!videoOrientations.has(videoOrientation)) {
    throw new Error("영상 비율 값이 올바르지 않습니다.");
  }

  const coursePayload = {
    slug,
    title,
    category,
    poomsae,
    instructor,
    description,
    difficulty: null,
    gumlet_video_id: gumletVideoId,
    video_orientation: videoOrientation,
    thumbnail_url: thumbnailUrl,
    duration_seconds: 0,
    is_premium: isPremium,
    published_at: new Date().toISOString()
  };

  let { error } = await supabase.from("courses").insert(coursePayload);

  if (error && error.message.includes("video_orientation")) {
    const fallbackResult = await supabase.from("courses").insert({
      slug,
      title,
      category,
      poomsae,
      instructor,
      description,
      difficulty: null,
      gumlet_video_id: gumletVideoId,
      thumbnail_url: thumbnailUrl,
      duration_seconds: 0,
      is_premium: isPremium,
      published_at: new Date().toISOString()
    });
    error = fallbackResult.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/courses");
  revalidatePath(`/courses/${slug}`);
  revalidatePath(`/watch/${slug}`);
}
