"use client";

import { useActionState } from "react";
import { Chrome, LogIn, MailPlus } from "lucide-react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/app/auth/actions";

const initialState = {
  message: ""
};

export function AuthForm() {
  const [loginState, loginAction, loginPending] = useActionState(signInWithPassword, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signUpWithPassword, initialState);

  return (
    <div className="auth-stack">
      <section className="auth-panel">
        <h2>보텝스 계정 로그인</h2>
        <form action={loginAction} className="form-grid">
          <input className="form-input" name="email" placeholder="이메일" type="email" autoComplete="email" />
          <input className="form-input" name="password" placeholder="비밀번호" type="password" autoComplete="current-password" />
          {loginState.message ? <p className="form-message">{loginState.message}</p> : null}
          <button className="icon-button primary large" disabled={loginPending}>
            <LogIn size={20} />
            <span>{loginPending ? "로그인 중" : "로그인"}</span>
          </button>
        </form>
        <form action={signInWithGoogle}>
          <button className="icon-button subtle large full-button">
            <Chrome size={20} />
            <span>구글로 계속하기</span>
          </button>
        </form>
      </section>

      <section className="auth-panel">
        <h2>보텝스 자체 회원가입</h2>
        <form action={signupAction} className="form-grid">
          <input className="form-input" name="displayName" placeholder="도장명 또는 이름" autoComplete="name" />
          <input className="form-input" name="email" placeholder="이메일" type="email" autoComplete="email" />
          <input className="form-input" name="password" placeholder="비밀번호 6자 이상" type="password" autoComplete="new-password" />
          {signupState.message ? <p className="form-message">{signupState.message}</p> : null}
          <button className="icon-button primary large" disabled={signupPending}>
            <MailPlus size={20} />
            <span>{signupPending ? "가입 처리 중" : "회원가입 이메일 받기"}</span>
          </button>
        </form>
      </section>
    </div>
  );
}
