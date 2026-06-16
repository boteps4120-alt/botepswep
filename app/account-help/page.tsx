import Link from "next/link";
import { Mail, RotateCcw } from "lucide-react";

export default function AccountHelpPage() {
  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">회원정보 찾기</p>
        <h1>아이디/비밀번호 찾기</h1>
        <p>
          BOTEPS 계정에 사용한 이메일을 확인하거나 비밀번호 재설정을 요청하는 화면입니다.
          실제 이메일 발송은 Supabase와 Resend 설정 후 연결합니다.
        </p>
      </div>

      <div className="auth-grid">
        <section className="auth-panel">
          <h2>아이디 찾기</h2>
          <p>가입 시 사용한 도장명 또는 연락처 기준으로 이메일 계정을 확인하는 기능을 연결할 예정입니다.</p>
          <div className="form-grid">
            <input className="form-input" placeholder="도장명 또는 이름" />
            <input className="form-input" placeholder="연락 가능한 이메일" type="email" />
          </div>
          <div className="form-actions">
            <button className="icon-button subtle large">
              <Mail size={20} />
              <span>아이디 찾기 요청</span>
            </button>
          </div>
        </section>

        <section className="auth-panel">
          <h2>비밀번호 재설정</h2>
          <p>가입한 이메일로 비밀번호 재설정 링크를 보내는 기능을 연결할 예정입니다.</p>
          <div className="form-grid">
            <input className="form-input" placeholder="가입한 이메일" type="email" />
          </div>
          <div className="form-actions">
            <button className="icon-button primary large">
              <RotateCcw size={20} />
              <span>재설정 링크 받기</span>
            </button>
          </div>
        </section>
      </div>

      <div className="form-actions">
        <Link className="text-link" href="/login">
          로그인 화면으로 돌아가기
        </Link>
      </div>
    </section>
  );
}
