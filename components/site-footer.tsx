import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="footer-brand" href="/">
          boteps
        </Link>
        <p>태권도장 수업과 품새 지도를 위한 전문 영상 강의 플랫폼</p>
      </div>
      <div className="footer-grid">
        <span>Supabase 준비</span>
        <span>Gumlet 준비</span>
        <span>Toss/Stripe 준비</span>
        <span>GA4/Clarity 준비</span>
      </div>
    </footer>
  );
}
