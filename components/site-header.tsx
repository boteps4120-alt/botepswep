import Link from "next/link";
import Image from "next/image";
import { LogIn, Search, ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/courses", label: "강의" },
  { href: "/subscribe", label: "구독하기" },
  { href: "/mypage", label: "마이페이지" },
  { href: "/admin", label: "관리자" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="boteps 홈">
        <Image src="/images/boteps-logo.png" alt="boteps" width={172} height={86} priority className="brand-logo" />
        <span className="brand-word">BOTEPS</span>
      </Link>
      <nav className="nav-links" aria-label="주요 메뉴">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link className="icon-button ghost" href="/courses" title="강의 검색">
          <Search size={18} />
          <span>검색</span>
        </Link>
        <Link className="icon-button subtle" href="/login" title="로그인">
          <LogIn size={18} />
          <span>로그인</span>
        </Link>
        <Link className="icon-button primary" href="/subscribe" title="월구독">
          <ShieldCheck size={18} />
          <span>월구독</span>
        </Link>
      </div>
    </header>
  );
}
