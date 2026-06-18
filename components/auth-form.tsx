"use client";

import { type FormEvent, useActionState, useState } from "react";
import Link from "next/link";
import { CalendarDays, Chrome, LogIn, MailPlus } from "lucide-react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/app/auth/actions";

const initialState = {
  message: ""
};

type AuthFormProps = {
  nextPath?: string;
};

export function AuthForm({ nextPath = "/mypage" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState<"choice" | "email">("choice");
  const [loginState, loginAction, loginPending] = useActionState(signInWithPassword, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signUpWithPassword, initialState);

  function showLogin() {
    setMode("login");
    setSignupStep("choice");
  }

  function showSignup() {
    setMode("signup");
    setSignupStep("choice");
  }

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const birthDate = String(formData.get("birthDate") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (birthDate && !/^\d{8}$/.test(birthDate)) {
      event.preventDefault();
      alert("생년월일은 8자리 숫자로 입력해주세요.");
      const birthDateInput = form.elements.namedItem("birthDate");
      if (birthDateInput instanceof HTMLElement) birthDateInput.focus();
      return;
    }

    if (phone && !/^\d+$/.test(phone)) {
      event.preventDefault();
      alert("핸드폰 번호는 숫자로 입력해주세요.");
      const phoneInput = form.elements.namedItem("phone");
      if (phoneInput instanceof HTMLElement) phoneInput.focus();
    }
  }

  return (
    <section className="auth-card" aria-label={mode === "login" ? "로그인" : "회원가입"}>
      <div className="auth-mode-tabs" role="tablist" aria-label="계정 메뉴">
        <button className={mode === "login" ? "active" : ""} onClick={showLogin} type="button">
          로그인
        </button>
        <button className={mode === "signup" ? "active" : ""} onClick={showSignup} type="button">
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
          {signupStep === "choice" ? (
            <>
              <h2>회원가입</h2>
              <form action={signInWithGoogle}>
                <input type="hidden" name="next" value={nextPath} />
                <button className="icon-button subtle large full-button">
                  <Chrome size={20} />
                  <span>구글로 회원가입</span>
                </button>
              </form>

              <div className="auth-divider">
                <span>또는</span>
              </div>

              <button className="icon-button primary large full-button" onClick={() => setSignupStep("email")} type="button">
                <MailPlus size={20} />
                <span>회원가입</span>
              </button>

              <div className="auth-links single">
                <button onClick={showLogin} type="button">
                  이미 계정이 있으신가요? 로그인
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>회원정보 입력</h2>
              <form action={signupAction} className="stacked-form" onSubmit={handleSignupSubmit}>
                <input type="hidden" name="next" value={nextPath} />
                <input className="auth-input top" name="email" placeholder="아이디로 사용할 이메일" type="email" autoComplete="email" />
                <input className="auth-input middle" name="password" placeholder="비밀번호 6자 이상" type="password" autoComplete="new-password" />
                <input className="auth-input middle" name="fullName" placeholder="이름" autoComplete="name" />
                <label className="auth-birth-field">
                  <CalendarDays size={22} />
                  <input
                    name="birthDate"
                    placeholder="생년월일 8자리"
                    inputMode="numeric"
                    maxLength={8}
                    autoComplete="bday"
                    aria-label="생년월일 8자리"
                  />
                </label>
                <select className="auth-input middle" name="gender" defaultValue="" aria-label="성별">
                  <option value="" disabled>
                    성별
                  </option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
                <input
                  className="auth-input middle"
                  name="phone"
                  placeholder="전화번호"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                />
                <input className="auth-input bottom" name="address" placeholder="주소" autoComplete="street-address" />

                {signupState.message ? <p className="form-message">{signupState.message}</p> : null}

                <button className="icon-button primary large full-button" disabled={signupPending}>
                  <MailPlus size={20} />
                  <span>{signupPending ? "가입 처리 중" : "회원가입 완료"}</span>
                </button>
              </form>

              <div className="auth-links">
                <button onClick={() => setSignupStep("choice")} type="button">
                  이전
                </button>
                <button onClick={showLogin} type="button">
                  로그인
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
