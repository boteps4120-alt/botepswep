import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type TossConfirmResponse = {
  paymentKey: string;
  orderId: string;
  totalAmount: number;
  status: string;
};

const planAmount = 9900;

async function confirmTossPayment(paymentKey: string, orderId: string, amount: number) {
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    throw new Error("TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.");
  }

  const encodedSecret = Buffer.from(`${secretKey}:`).toString("base64");
  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedSecret}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
    cache: "no-store"
  });
  const data = (await response.json()) as TossConfirmResponse & { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? "Toss 결제 승인에 실패했습니다.");
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paymentKey = String(body.paymentKey ?? "");
    const orderId = String(body.orderId ?? "");
    const amount = Number(body.amount);

    if (!paymentKey || !orderId || amount !== planAmount) {
      return NextResponse.json({ message: "결제 정보가 올바르지 않습니다." }, { status: 400 });
    }

    if (!hasSupabaseEnv()) {
      return NextResponse.json({ message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const payment = await confirmTossPayment(paymentKey, orderId, amount);
    const currentPeriodEndDate = new Date();
    currentPeriodEndDate.setDate(currentPeriodEndDate.getDate() + 30);
    const currentPeriodEnd = currentPeriodEndDate.toISOString();

    const { error } = await supabase.from("subscriptions").upsert({
      user_id: user.id,
      status: "active",
      provider: "toss",
      provider_customer_id: user.id,
      provider_subscription_id: payment.paymentKey,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString()
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/mypage");
    revalidatePath("/admin");

    return NextResponse.json({
      paymentStatus: payment.status,
      totalAmount: payment.totalAmount,
      currentPeriodEnd: new Intl.DateTimeFormat("ko-KR").format(new Date(currentPeriodEnd))
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
