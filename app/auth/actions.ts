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

export async function signInWithPassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { message: "Supabase 환경변수가 아직 설정되지 않았습니다." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { message: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요." };
  }

  revalidatePath("/", "layout");
  redirect("/mypage");
}

export async function signUpWithPassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { message: "Supabase 환경변수가 아직 설정되지 않았습니다." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password || !displayName) {
    return { message: "이름, 이메일, 비밀번호를 모두 입력해주세요." };
  }

  if (password.length < 6) {
    return { message: "비밀번호는 6자 이상으로 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName
      },
      emailRedirectTo: `${getBaseUrl()}/auth/callback`
    }
  });

  if (error) {
    return { message: "회원가입에 실패했습니다. 이미 가입된 이메일인지 확인해주세요." };
  }

  return { message: "회원가입 이메일을 보냈습니다. 메일함에서 인증을 완료해주세요." };
}

export async function signInWithGoogle() {
  if (!hasSupabaseEnv()) {
    redirect("/login?message=supabase-not-configured");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`
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
