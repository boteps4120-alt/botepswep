"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ResetState = "idle" | "saving" | "success" | "error";

export function ResetPasswordForm() {
  const [state, setState] = useState<ResetState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setState("saving");
    setMessage("");

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 6) {
      setState("error");
      setMessage("비밀번호는 6자 이상으로 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setState("error");
      setMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }

      setState("success");
      setMessage("비밀번호가 변경되었습니다. 새 비밀번호로 로그인할 수 있습니다.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "비밀번호 변경 중 오류가 발생했습니다.");
    }
  }

  return (
    <form action={handleSubmit} className="stacked-form">
      <input className="auth-input top" name="password" placeholder="새 비밀번호 6자 이상" type="password" required />
      <input className="auth-input bottom" name="confirmPassword" placeholder="새 비밀번호 확인" type="password" required />

      {message ? (
        <p className={state === "success" ? "form-message success-message" : "form-message"}>{message}</p>
      ) : null}

      <button className="icon-button primary large full-button" disabled={state === "saving"} type="submit">
        <KeyRound size={20} />
        <span>{state === "saving" ? "저장 중" : "비밀번호 변경"}</span>
      </button>

      {state === "success" ? (
        <Link className="icon-button subtle large full-button" href="/login">
          로그인으로 이동
        </Link>
      ) : null}
    </form>
  );
}
