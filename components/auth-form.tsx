"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Chrome, LogIn, MailPlus } from "lucide-react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/app/auth/actions";

const initialState = {
  message: ""
};

type AuthFormProps = {
  nextPath?: string;
};

export function AuthForm({ nextPath = "/mypage" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(signInWithPassword, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signUpWithPassword, initialState);

  return (
    <section className="auth-card" aria-label={mode === "login" ? "로그인" : "회원가입"}>
      <div className="auth-mode-tabs" role="tablist" aria-label="계정 메뉴">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
          로그인
        </button>
        <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">
          회원가입
        </button>
      </div>

      {mode === "login" ? (
        <div className="auth-mode-panel">
          <h2>로그인</h2>
          <form action={loginAction} className="stacked-form">
            <input type="hidden" name="next" value={nextPath} />
            <input className="auth-input top" name="email" placeholder="아이디 또는 이메일" type="email" autoComplete="email" />
            <input className="auth-input bottom" name="password" placeholder="비밀번호" type="password" autoComplete="current-password" />

            {loginState.message ? <p className="form-message">{loginState.message}</p> : null}

            <button className="icon-button primary large full-button" disabled={loginPending}>
              <LogIn size={20} />
              <span>{loginPending ? "로그인 중" : "로그인"}</span>
            </button>
          </form>

          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={nextPath} />
            <button className="icon-button subtle large full-button">
              <Chrome size={20} />
              <span>구글 로그인</span>
            </button>
          </form>

          <div className="auth-links">
            <Link href="/account-help">아이디 찾기</Link>
            <Link href="/account-help">비밀번호 찾기</Link>
          </div>
        </div>
      ) : (
        <div className="auth-mode-panel">
          <h2>회원가입</h2>
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={nextPath} />
            <button className="icon-button subtle large full-button">
              <Chrome size={20} />
              <span>구글로 회원가입</span>
            </button>
          </form>

          <div className="auth-divider">
            <span>또는 이메일로 가입</span>
          </div>

          <form action={signupAction} className="stacked-form">
            <input type="hidden" name="next" value={nextPath} />
            <input className="auth-input top" name="email" placeholder="아이디로 사용할 이메일" type="email" autoComplete="email" />
            <input className="auth-input bottom" name="password" placeholder="비밀번호 6자 이상" type="password" autoComplete="new-password" />

            {signupState.message ? <p className="form-message">{signupState.message}</p> : null}

            <button className="icon-button primary large full-button" disabled={signupPending}>
              <MailPlus size={20} />
              <span>{signupPending ? "가입 처리 중" : "회원가입"}</span>
            </button>
          </form>

          <div className="auth-links single">
            <button onClick={() => setMode("login")} type="button">
              이미 계정이 있으신가요? 로그인
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
