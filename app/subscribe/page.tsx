import Link from "next/link";
import { BarChart3, CreditCard, Globe2, LogIn, ShieldCheck, Video } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { TossCheckoutButton } from "./toss-checkout-button";

const integrations = [
  ["Toss Payments", "국내 카드/간편결제 테스트 결제"],
  ["Stripe", "해외 카드와 달러 구독"],
  ["Supabase", "구독 상태와 권한 저장"],
  ["Resend", "결제 완료와 만료 알림"],
  ["GA4 / Clarity", "전환성과 이탈 분석"]
];

const price = 9900;

export default async function SubscribePage() {
  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">월구독</p>
        <h1>도장 수업을 위한 품새 강의 전체 이용</h1>
        <p>Toss Payments 테스트 결제로 결제 성공 후 Supabase 구독 상태를 자동으로 활성화합니다.</p>
      </div>

      <div className="subscribe-grid">
        <section className="subscribe-panel">
          <p className="eyebrow">BOTEPS Pro</p>
          <h2>월 9,900원</h2>
          <p>현재는 Toss 테스트 결제 단계입니다. 성공 시 마이페이지와 구독자 전용 영상 접근 권한이 바로 갱신됩니다.</p>
          <ul className="bullet-list">
            <li>모든 유료 품새 강의 시청</li>
            <li>동작별 챕터 이동과 이어보기</li>
            <li>품새 정보, 핵심 포인트, 감점 요소 제공</li>
            <li>마이페이지 시청 기록과 찜한 강의</li>
          </ul>
          <div className="form-actions">
            {user ? (
              <TossCheckoutButton
                clientKey={tossClientKey}
                customerKey={user.id}
                customerEmail={user.email ?? undefined}
                customerName={user.user_metadata?.display_name ?? user.email ?? "BOTEPS 회원"}
                amount={price}
              />
            ) : (
              <Link className="icon-button primary large" href="/login?next=/subscribe">
                <LogIn size={20} />
                <span>로그인 후 결제</span>
              </Link>
            )}
            <Link className="icon-button subtle large" href="/courses">
              <Video size={20} />
              <span>강의 먼저 보기</span>
            </Link>
          </div>
        </section>

        <section className="subscribe-panel">
          <p className="eyebrow">2차 연동</p>
          <h2>결제 성공 후 구독 권한 자동 갱신</h2>
          <p>이번 단계에서는 Toss 테스트 결제를 확정하고, 성공한 회원의 Supabase 구독 상태를 active로 바꿉니다.</p>
          <div className="integration-list">
            {integrations.map(([name, body]) => (
              <div className="integration-item" key={name}>
                <span>{name}</span>
                <small>{body}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="metric-grid" style={{ marginTop: 24 }}>
        <div className="metric-card">
          <ShieldCheck size={24} color="#167c76" />
          <span className="stat-label">권한</span>
          <strong>구독자 전용</strong>
        </div>
        <div className="metric-card">
          <CreditCard size={24} color="#2458a8" />
          <span className="stat-label">결제</span>
          <strong>Toss 테스트</strong>
        </div>
        <div className="metric-card">
          <BarChart3 size={24} color="#c18a2b" />
          <span className="stat-label">다음</span>
          <strong>자동결제</strong>
        </div>
      </div>

      <div className="metric-grid" style={{ marginTop: 24 }}>
        <div className="metric-card">
          <Globe2 size={24} color="#2458a8" />
          <span className="stat-label">해외 결제</span>
          <strong>Stripe 예정</strong>
        </div>
      </div>
    </section>
  );
}
