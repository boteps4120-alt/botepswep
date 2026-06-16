import Link from "next/link";
import { Chrome, LogIn, Mail, RotateCcw } from "lucide-react";

export default function LoginPage() {
  return (
    <section className="page-shell">
      <div className="auth-grid">
        <div className="page-title">
          <p className="eyebrow">로그인</p>
          <h1>도장 수업 자료를 이어서 확인하세요</h1>
          <p>1차에서는 화면 흐름만 제공하고, 2차에서 Supabase Auth로 이메일/구글 로그인과 비밀번호 재설정을 연결합니다.</p>
        </div>

        <section className="auth-panel">
          <h2>계정 접속</h2>
          <div className="form-grid">
            <input className="form-input" placeholder="이메일" type="email" />
            <input className="form-input" placeholder="비밀번호" type="password" />
          </div>
          <div className="form-actions">
            <Link className="icon-button primary large" href="/mypage">
              <LogIn size={20} />
              <span>더미 로그인</span>
            </Link>
            <button className="icon-button subtle large">
              <Chrome size={20} />
              <span>구글 로그인</span>
            </button>
          </div>
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
        </section>
      </div>
    </section>
  );
}
