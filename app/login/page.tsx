import Link from "next/link";
import { Mail, RotateCcw } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <section className="page-shell">
      <div className="auth-grid">
        <div className="page-title">
          <p className="eyebrow">로그인</p>
          <h1>도장 수업 자료를 이어서 확인하세요</h1>
          <p>
            구글 계정으로 빠르게 시작하거나, BOTEPS 전용 이메일 계정으로 회원가입할 수 있습니다.
            Supabase Auth를 통해 세션을 관리합니다.
          </p>
          <div className="integration-list">
            <div className="integration-item">
              <span>이메일 인증</span>
              <Mail size={18} />
            </div>
            <div className="integration-item">
              <span>비밀번호 재설정</span>
              <RotateCcw size={18} />
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
