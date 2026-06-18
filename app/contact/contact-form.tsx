"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";

type SendState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<SendState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setState("sending");
    setMessage("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        body: formData.get("body")
      })
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState("error");
      setMessage(data.message ?? "문의 메일 발송에 실패했습니다.");
      return;
    }

    setState("success");
    setMessage("문의 메일을 보냈습니다. 확인 후 연락드릴게요.");
  }

  return (
    <form action={handleSubmit} className="contact-form">
      <div className="form-grid">
        <label className="field-label">
          이름
          <input className="form-input" name="name" placeholder="성함 또는 도장명" required />
        </label>
        <label className="field-label">
          이메일
          <input className="form-input" name="email" placeholder="reply@example.com" type="email" required />
        </label>
        <label className="field-label">
          제목
          <input className="form-input" name="subject" placeholder="문의 제목" required />
        </label>
        <label className="field-label">
          문의 내용
          <textarea
            className="form-input textarea-input"
            name="body"
            placeholder="궁금한 점이나 필요한 강의 내용을 적어주세요."
            required
          />
        </label>
      </div>

      {message ? (
        <p className={state === "success" ? "form-message success-message" : "form-message"}>{message}</p>
      ) : null}

      <div className="form-actions">
        <button className="icon-button primary large" disabled={state === "sending"} type="submit">
          {state === "sending" ? <Mail size={20} /> : <Send size={20} />}
          <span>{state === "sending" ? "전송 중" : "문의 보내기"}</span>
        </button>
      </div>
    </form>
  );
}
