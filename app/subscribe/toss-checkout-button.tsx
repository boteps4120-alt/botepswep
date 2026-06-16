"use client";

import Script from "next/script";
import { CreditCard } from "lucide-react";
import { useState } from "react";

type TossCheckoutButtonProps = {
  clientKey?: string;
  customerKey: string;
  customerEmail?: string;
  customerName?: string;
  amount: number;
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      payment: (options: { customerKey: string }) => {
        requestPayment: (options: {
          method: "CARD";
          amount: { currency: "KRW"; value: number };
          orderId: string;
          orderName: string;
          successUrl: string;
          failUrl: string;
          customerEmail?: string;
          customerName?: string;
        }) => Promise<void>;
      };
    };
  }
}

export function TossCheckoutButton({
  clientKey,
  customerKey,
  customerEmail,
  customerName,
  amount
}: TossCheckoutButtonProps) {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const canPay = Boolean(clientKey && ready);

  async function requestPayment() {
    setMessage("");

    if (!clientKey || !window.TossPayments) {
      setMessage("Toss Payments 환경변수 또는 SDK가 아직 준비되지 않았습니다.");
      return;
    }

    const tossPayments = window.TossPayments(clientKey);
    const payment = tossPayments.payment({ customerKey });
    const origin = window.location.origin;
    const orderId = `BOTEPS-${crypto.randomUUID()}`;

    await payment.requestPayment({
      method: "CARD",
      amount: {
        currency: "KRW",
        value: amount
      },
      orderId,
      orderName: "BOTEPS 월구독",
      successUrl: `${origin}/payments/toss/success`,
      failUrl: `${origin}/payments/toss/fail`,
      customerEmail,
      customerName
    });
  }

  return (
    <>
      <Script src="https://js.tosspayments.com/v2/standard" onLoad={() => setReady(true)} />
      <button className="icon-button primary large" disabled={!canPay} onClick={requestPayment}>
        <CreditCard size={20} />
        <span>{canPay ? "Toss 테스트 결제" : "Toss 준비 중"}</span>
      </button>
      {!clientKey ? <p className="form-message">Vercel에 NEXT_PUBLIC_TOSS_CLIENT_KEY를 추가하면 결제 버튼이 활성화됩니다.</p> : null}
      {message ? <p className="form-message">{message}</p> : null}
    </>
  );
}
