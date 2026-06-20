"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type AuthState = {
  message?: string;
};

function getBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, "");
  return "http://localhost:3000";
}

function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "/mypage");
  if (!next.startsWith("/") || next.startsWith("//")) return "/mypage";
  return next;
}

function clean(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeBirthDate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{8}$/.test(digits)) return null;

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export async function signInWithPassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { message: "Supabase 환경변수가 아직 설정되지 않았습니다." };
  }

  const email = clean(formData, "email");
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  if (!email || !password) {
    return { message: "아이디와 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { message: "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpWithPassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { message: "Supabase 환경변수가 아직 설정되지 않았습니다." };
  }

  const email = clean(formData, "email");
  const password = String(formData.get("password") ?? "");
  const fullName = clean(formData, "fullName");
  const birthDateInput = clean(formData, "birthDate");
  const birthDate = normalizeBirthDate(birthDateInput);
  const gender = clean(formData, "gender");
  const phone = clean(formData, "phone");
  const address = clean(formData, "address");
  const next = getSafeNext(formData);

  if (!email || !password || !fullName || !birthDateInput || !gender || !phone || !address) {
    return { message: "이름, 생년월일, 성별, 핸드폰 번호, 주소, 아이디, 비밀번호를 모두 입력해주세요." };
  }

  if (!/^\d+$/.test(phone)) {
    return { message: "핸드폰 번호는 숫자로 입력해주세요." };
  }

  if (!birthDate) {
    return { message: "생년월일은 19950101처럼 8자리 숫자로 입력해주세요." };
  }

  if (password.length < 6) {
    return { message: "비밀번호는 6자 이상으로 입력해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        display_name: fullName,
        full_name: fullName,
        birth_date: birthDate,
        gender,
        phone,
        address
      }
    }
  });

  if (error) {
    return { message: "회원가입에 실패했습니다. 이미 가입된 아이디인지 확인해주세요." };
  }

  if (data.session) {
    if (data.user?.id) {
      await supabase
        .from("profiles")
        .update({
          email,
          display_name: fullName,
          full_name: fullName,
          birth_date: birthDate,
          gender,
          phone,
          address,
          updated_at: new Date().toISOString()
        })
        .eq("id", data.user.id);
    }

    revalidatePath("/", "layout");
    redirect(next);
  }

  return { message: "회원가입 요청이 완료되었습니다. 이메일 인증 설정을 확인해주세요." };
}

export async function signInWithGoogle(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?message=supabase-not-configured");
  }

  const next = getSafeNext(formData);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error || !data.url) {
    redirect("/login?message=google-login-failed");
  }

  redirect(data.url);
}

export async function signOut() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
