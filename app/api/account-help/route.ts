import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { escapeHtml, sendResendEmail } from "@/lib/email/resend";

type AccountHelpPayload = {
  mode?: unknown;
  email?: unknown;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, "");
  return "http://localhost:3000";
}

async function sendIdReminder(email: string) {
  const safeEmail = escapeHtml(email);

  await sendResendEmail({
    to: email,
    subject: "[BOTEPS] 아이디 안내",
    text: [
      "BOTEPS 아이디 안내",
      "",
      `BOTEPS 로그인 아이디는 이 이메일 주소입니다: ${email}`,
      "",
      "본인이 요청하지 않았다면 이 메일을 무시해주세요."
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717;">
        <h2 style="margin: 0 0 16px;">BOTEPS 아이디 안내</h2>
        <p>BOTEPS 로그인 아이디는 아래 이메일 주소입니다.</p>
        <p style="font-size: 20px; font-weight: 700;">${safeEmail}</p>
        <p style="color: #666;">본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
      </div>
    `
  });
}

async function sendPasswordReset(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.");
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback?next=/reset-password`
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  const actionLink = data.properties?.action_link;

  if (!actionLink) {
    throw new Error("비밀번호 재설정 링크를 생성하지 못했습니다.");
  }

  const safeLink = escapeHtml(actionLink);

  await sendResendEmail({
    to: email,
    subject: "[BOTEPS] 비밀번호 재설정",
    text: [
      "BOTEPS 비밀번호 재설정",
      "",
      "아래 링크를 눌러 새 비밀번호를 설정해주세요.",
      actionLink,
      "",
      "본인이 요청하지 않았다면 이 메일을 무시해주세요."
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717;">
        <h2 style="margin: 0 0 16px;">BOTEPS 비밀번호 재설정</h2>
        <p>아래 버튼을 눌러 새 비밀번호를 설정해주세요.</p>
        <p style="margin: 28px 0;">
          <a href="${safeLink}" style="background: #c93232; color: #fff; padding: 14px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">
            비밀번호 재설정하기
          </a>
        </p>
        <p style="color: #666;">본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
      </div>
    `
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AccountHelpPayload;
    const mode = cleanText(payload.mode);
    const email = cleanText(payload.email).toLowerCase();

    if (!email || !isEmail(email)) {
      return NextResponse.json({ message: "이메일 주소를 올바르게 입력해주세요." }, { status: 400 });
    }

    if (mode === "id") {
      await sendIdReminder(email);
      return NextResponse.json({ message: "아이디 안내 메일을 보냈습니다." });
    }

    if (mode === "password") {
      await sendPasswordReset(email);
      return NextResponse.json({ message: "비밀번호 재설정 메일을 보냈습니다." });
    }

    return NextResponse.json({ message: "요청 종류가 올바르지 않습니다." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "계정 도움 메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
