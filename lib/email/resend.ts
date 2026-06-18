const resendApiUrl = "https://api.resend.com/emails";
const defaultFrom = "BOTEPS <onboarding@resend.dev>";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendResendEmail({ to, subject, text, html, replyTo }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? defaultFrom,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      html
    }),
    cache: "no-store"
  });

  const data = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? "Resend 메일 발송에 실패했습니다.");
  }

  return data;
}
