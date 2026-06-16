import Link from "next/link";
import { XCircle } from "lucide-react";

type SearchParams = {
  code?: string;
  message?: string;
  orderId?: string;
};

export default async function TossFailPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">결제 실패</p>
        <h1>결제가 완료되지 않았습니다</h1>
        <p>{params.message ?? "결제가 취소되었거나 승인되지 않았습니다."}</p>
      </div>
      <div className="metric-card">
        <XCircle size={24} color="#d33333" />
        <span className="stat-label">오류 코드</span>
        <strong>{params.code ?? "-"}</strong>
      </div>
      <div className="form-actions">
        <Link className="icon-button primary large" href="/subscribe">
          다시 결제하기
        </Link>
        <Link className="icon-button subtle large" href="/courses">
          강의 목록 보기
        </Link>
      </div>
    </section>
  );
}
