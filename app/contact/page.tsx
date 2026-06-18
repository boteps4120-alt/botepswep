import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <section className="page-shell">
      <div className="contact-layout">
        <div className="page-title contact-copy">
          <p className="eyebrow">문의하기</p>
          <h1>BOTEPS 운영자에게 문의하기</h1>
          <p>
            강의 이용, 구독, 도장 수업 적용, 관리자 기능 관련 문의를 남기면 등록된 운영자 메일로 전달됩니다.
          </p>
          <div className="contact-points">
            <span>
              <Mail size={18} />
              Resend 메일 발송 테스트
            </span>
            <span>
              <ShieldCheck size={18} />
              서버 전용 API 키 사용
            </span>
          </div>
          <Link className="text-link" href="/">
            <ArrowLeft size={18} />
            홈으로 돌아가기
          </Link>
        </div>

        <section className="auth-panel">
          <h2>문의 메일</h2>
          <p>현재는 Resend 기본 발신자로 테스트하고, 추후 도메인 인증 후 BOTEPS 공식 발신자로 변경합니다.</p>
          <ContactForm />
        </section>
      </div>
    </section>
  );
}
