import Link from "next/link";
import { BarChart3, CreditCard, Globe2, ShieldCheck, Video } from "lucide-react";

const integrations = [
  ["Toss Payments", "국내 카드/간편결제 정기구독"],
  ["Stripe", "해외 카드와 달러 구독"],
  ["Supabase", "구독 상태와 권한 저장"],
  ["Resend", "결제 완료와 만료 알림"],
  ["GA4 / Clarity", "전환율과 이탈 분석"]
];

export default function SubscribePage() {
  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">월구독</p>
        <h1>도장 수업을 위한 품새 강의 전체 이용</h1>
        <p>1차 MVP에서는 구독 흐름을 더미로 보여주고, 2차에서 Toss Payments와 Stripe를 연결합니다.</p>
      </div>

      <div className="subscribe-grid">
        <section className="subscribe-panel">
          <p className="eyebrow">boteps Pro</p>
          <h2>월 9,900원</h2>
          <p>정확한 가격은 결제 연동 전 확정하며, 현재는 MVP 검증용 임시 가격입니다.</p>
          <ul className="bullet-list">
            <li>모든 유료 품새 강의 시청</li>
            <li>동작별 챕터 이동과 이어보기</li>
            <li>품새 정보, 핵심 포인트, 감점 요소 제공</li>
            <li>마이페이지 시청 기록과 찜한 강의</li>
          </ul>
          <div className="form-actions">
            <Link className="icon-button primary large" href="/mypage">
              <CreditCard size={20} />
              <span>더미 결제 완료</span>
            </Link>
            <Link className="icon-button subtle large" href="/courses">
              <Video size={20} />
              <span>강의 먼저 보기</span>
            </Link>
          </div>
        </section>

        <section className="subscribe-panel">
          <p className="eyebrow">2차 연동 준비</p>
          <h2>국내와 해외 결제를 함께 고려</h2>
          <p>Toss와 Stripe를 동시에 붙일 수 있도록 결제 성공 후 구독 상태 갱신 흐름을 분리해 설계합니다.</p>
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
          <Globe2 size={24} color="#2458a8" />
          <span className="stat-label">결제</span>
          <strong>Toss + Stripe</strong>
        </div>
        <div className="metric-card">
          <BarChart3 size={24} color="#c18a2b" />
          <span className="stat-label">분석</span>
          <strong>GA4 + Clarity</strong>
        </div>
      </div>
    </section>
  );
}
