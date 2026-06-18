import { KeyRound } from "lucide-react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <section className="auth-page">
      <div className="auth-intro">
        <p className="eyebrow">비밀번호 재설정</p>
        <h1>새 비밀번호를 설정하세요</h1>
        <p>메일로 받은 재설정 링크를 통해 접속한 뒤 새 비밀번호를 저장할 수 있습니다.</p>
        <div className="auth-benefits">
          <span>
            <KeyRound size={18} />
            새 비밀번호는 6자 이상
          </span>
        </div>
      </div>

      <section className="auth-card">
        <div className="auth-mode-panel">
          <h2>비밀번호 변경</h2>
          <ResetPasswordForm />
        </div>
      </section>
    </section>
  );
}
