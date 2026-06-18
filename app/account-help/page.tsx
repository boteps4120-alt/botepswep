import Link from "next/link";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { AccountHelpForm } from "./account-help-form";

export default function AccountHelpPage() {
  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">회원정보 찾기</p>
        <h1>아이디 찾기와 비밀번호 재설정</h1>
        <p>
          BOTEPS 계정으로 사용한 이메일을 확인하거나, Resend 메일로 비밀번호 재설정 링크를 받을 수 있습니다.
        </p>
      </div>

      <div className="auth-grid">
        <section className="auth-panel">
          <Mail size={28} color="#167c76" />
          <h2>아이디 찾기</h2>
          <p>입력한 이메일로 BOTEPS 로그인 아이디 안내 메일을 보냅니다.</p>
          <AccountHelpForm mode="id" />
        </section>

        <section className="auth-panel">
          <RotateCcw size={28} color="#c93232" />
          <h2>비밀번호 재설정</h2>
          <p>가입한 이메일로 새 비밀번호를 설정할 수 있는 링크를 보냅니다.</p>
          <AccountHelpForm mode="password" />
        </section>
      </div>

      <div className="form-actions">
        <Link className="text-link" href="/login">
          <ArrowLeft size={18} />
          로그인 화면으로 돌아가기
        </Link>
      </div>
    </section>
  );
}
