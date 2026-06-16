import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

const benefits = ["도장 수업용 품새 강의", "동작별 챕터 학습", "시청 기록과 이어보기"];

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-intro">
        <p className="eyebrow">BOTEPS 계정</p>
        <h1>품새 강의를 이어서 학습하세요</h1>
        <p>
          로그인하면 구독 상태, 시청 기록, 찜한 강의, 동작별 챕터 학습을 BOTEPS 계정에 저장할 수 있습니다.
        </p>
        <div className="auth-benefits">
          {benefits.map((benefit) => (
            <span key={benefit}>
              <CheckCircle2 size={18} />
              {benefit}
            </span>
          ))}
        </div>
        <Link className="text-link" href="/courses">
          로그인 없이 강의 먼저 보기
        </Link>
      </div>

      <AuthForm />
    </section>
  );
}
