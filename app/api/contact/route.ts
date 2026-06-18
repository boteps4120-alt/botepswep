import { NextResponse } from "next/server";
import { escapeHtml, sendResendEmail } from "@/lib/email/resend";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  body?: unknown;
};

const defaultTo = "boteps4120@gmail.com";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;
    const name = cleanText(payload.name);
    const email = cleanText(payload.email);
    const subject = cleanText(payload.subject);
    const body = cleanText(payload.body);

    if (!name || !email || !subject || !body) {
      return NextResponse.json({ message: "이름, 이메일, 제목, 문의 내용을 모두 입력해주세요." }, { status: 400 });
    }

    if (!isEmail(email)) {
      return NextResponse.json({ message: "이메일 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeBody = escapeHtml(body);

    await sendResendEmail({
      to: process.env.RESEND_TO_EMAIL ?? defaultTo,
      replyTo: email,
      subject: `[BOTEPS 문의] ${subject}`,
      text: [
          `이름: ${name}`,
          `답장 이메일: ${email}`,
          "",
          "문의 내용",
          body
        ].join("\n"),
      html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717;">
            <h2 style="margin: 0 0 16px;">BOTEPS 문의가 도착했습니다.</h2>
            <p><strong>이름</strong>: ${safeName}</p>
            <p><strong>답장 이메일</strong>: ${safeEmail}</p>
            <p><strong>제목</strong>: ${safeSubject}</p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="white-space: pre-line;">${safeBody}</p>
          </div>
        `
    });

    return NextResponse.json({ message: "문의 메일을 보냈습니다." });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
