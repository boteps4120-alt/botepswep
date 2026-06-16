import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <section className="page-shell">
      <div className="auth-grid">
        <div className="page-title">
          <p className="eyebrow">계정</p>
          <h1>로그인하거나 새 계정을 만드세요</h1>
          <p>
            기존 BOTEPS 계정으로 로그인하거나, 이메일 또는 구글 계정으로 새 회원가입을 진행할 수 있습니다.
          </p>
          <div className="integration-list">
            <div className="integration-item">
              <span>보텝스 자체 회원가입</span>
              <strong>이메일</strong>
            </div>
            <div className="integration-item">
              <span>간편 회원가입/로그인</span>
              <strong>Google</strong>
            </div>
            <div className="integration-item">
              <span>회원정보 찾기</span>
              <strong>아이디/비밀번호</strong>
            </div>
          </div>
          <div className="form-actions">
            <Link className="text-link" href="/courses">
              강의 먼저 둘러보기
            </Link>
          </div>
        </div>

        <AuthForm />
      </div>
    </section>
  );
}
