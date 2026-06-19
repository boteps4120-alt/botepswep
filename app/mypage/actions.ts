"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type ProfileState = {
  message?: string;
};

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

export async function updateMyProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  if (!hasSupabaseEnv()) {
    return { message: "Supabase 환경변수가 아직 설정되지 않았습니다." };
  }

  const fullName = clean(formData, "fullName");
  const birthDateInput = clean(formData, "birthDate");
  const birthDate = normalizeBirthDate(birthDateInput);
  const gender = clean(formData, "gender");
  const phone = clean(formData, "phone");
  const address = clean(formData, "address");

  if (!fullName || !birthDateInput || !gender || !phone || !address) {
    return { message: "이름, 생년월일, 성별, 전화번호, 주소를 모두 입력해주세요." };
  }

  if (!birthDate) {
    return { message: "생년월일은 19950101처럼 8자리 숫자로 입력해주세요." };
  }

  if (gender !== "male" && gender !== "female") {
    return { message: "성별을 선택해주세요." };
  }

  if (!/^\d+$/.test(phone)) {
    return { message: "핸드폰 번호는 숫자로 입력해주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "로그인이 필요합니다." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: fullName,
      full_name: fullName,
      birth_date: birthDate,
      gender,
      phone,
      address,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    return { message: "회원정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/mypage");
  revalidatePath("/admin");
  revalidatePath("/", "layout");

  return { message: "회원정보가 저장되었습니다." };
}
