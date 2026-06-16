"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type TossSuccessClientProps = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
};

type ConfirmState =
  | { status: "pending"; message: string }
  | { status: "success"; paymentStatus: string; totalAmount: number; currentPeriodEnd: string }
  | { status: "error"; message: string };

export function TossSuccessClient({ paymentKey, orderId, amount }: TossSuccessClientProps) {
  const [state, setState] = useState<ConfirmState>({
    status: "pending",
    message: "Toss 결제를 승인하는 중입니다."
  });

  useEffect(() => {
    let ignore = false;

    async function confirm() {
      try {
        const response = await fetch("/api/payments/toss/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ paymentKey, orderId, amount })
        });
        const data = await response.json();

        if (ignore) return;

        if (!response.ok) {
          setState({ status: "error", message: data.message ?? "결제 승인에 실패했습니다." });
          return;
        }

        setState({
          status: "success",
          paymentStatus: data.paymentStatus,
          totalAmount: data.totalAmount,
          currentPeriodEnd: data.currentPeriodEnd
        });
      } catch (error) {
        if (!ignore) {
          setState({ status: "error", message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." });
        }
      }
    }

    confirm();

    return () => {
      ignore = true;
    };
  }, [amount, orderId, paymentKey]);

  if (state.status === "pending") {
    return (
      <section className="page-shell">
        <div className="page-title">
          <p className="eyebrow">결제 승인</p>
          <h1>구독을 활성화하는 중입니다</h1>
          <p>{state.message}</p>
        </div>
        <div className="metric-card">
          <Loader2 size={24} color="#2458a8" />
          <span className="stat-label">주문번호</span>
          <strong>{orderId ?? "-"}</strong>
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="page-shell">
        <div className="page-title">
          <p className="eyebrow">결제 승인 실패</p>
          <h1>구독을 활성화하지 못했습니다</h1>
          <p>{state.message}</p>
        </div>
        <div className="metric-card">
          <XCircle size={24} color="#d33333" />
          <span className="stat-label">주문번호</span>
          <strong>{orderId ?? "-"}</strong>
        </div>
        <Link className="icon-button primary large" href="/subscribe">
          다시 시도
        </Link>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">결제 완료</p>
        <h1>구독이 활성화되었습니다</h1>
        <p>Toss 결제가 승인되어 BOTEPS Pro 권한이 적용되었습니다.</p>
      </div>
      <div className="metric-grid">
        <div className="metric-card">
          <CheckCircle2 size={24} color="#167c76" />
          <span className="stat-label">상태</span>
          <strong>{state.paymentStatus}</strong>
        </div>
        <div className="metric-card">
          <span className="stat-label">결제 금액</span>
          <strong>{state.totalAmount.toLocaleString("ko-KR")}원</strong>
        </div>
        <div className="metric-card">
          <span className="stat-label">다음 갱신</span>
          <strong>{state.currentPeriodEnd}</strong>
        </div>
      </div>
      <div className="form-actions">
        <Link className="icon-button primary large" href="/watch/taebaek-expression">
          구독자 영상 보기
        </Link>
        <Link className="icon-button subtle large" href="/mypage">
          마이페이지 확인
        </Link>
      </div>
    </section>
  );
}
