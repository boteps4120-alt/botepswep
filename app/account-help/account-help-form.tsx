"use client";

import { useState } from "react";
import { Mail, RotateCcw } from "lucide-react";

type RequestState = "idle" | "sending" | "success" | "error";
type HelpMode = "id" | "password";

type AccountHelpFormProps = {
  mode: HelpMode;
};

const modeCopy = {
  id: {
    label: "아이디 찾기",
    placeholder: "가입했을 가능성이 있는 이메일",
    button: "아이디 안내 메일 받기",
    sending: "메일 발송 중"
  },
  password: {
    label: "비밀번호 재설정",
    placeholder: "가입한 이메일",
    button: "재설정 메일 받기",
    sending: "링크 생성 중"
  }
};

export function AccountHelpForm({ mode }: AccountHelpFormProps) {
  const [state, setState] = useState<RequestState>("idle");
  const [message, setMessage] = useState("");
  const copy = modeCopy[mode];

  async function handleSubmit(formData: FormData) {
    setState("sending");
    setMessage("");

    const response = await fetch("/api/account-help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        email: formData.get("email")
      })
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState("error");
      setMessage(data.message ?? "메일 발송에 실패했습니다.");
      return;
    }

    setState("success");
    setMessage(data.message ?? "메일을 보냈습니다.");
  }

  return (
    <form action={handleSubmit} className="form-grid">
      <label className="field-label">
        이메일
        <input className="form-input" name="email" placeholder={copy.placeholder} type="email" required />
      </label>

      {message ? (
        <p className={state === "success" ? "form-message success-message" : "form-message"}>{message}</p>
      ) : null}

      <div className="form-actions">
        <button className={`icon-button ${mode === "password" ? "primary" : "subtle"} large`} disabled={state === "sending"}>
          {mode === "password" ? <RotateCcw size={20} /> : <Mail size={20} />}
          <span>{state === "sending" ? copy.sending : copy.button}</span>
        </button>
      </div>
    </form>
  );
}
