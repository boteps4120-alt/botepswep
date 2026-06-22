import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Globe2, LogIn, LogOut, Search, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const courseCategories = ["전체", "유급자 품새", "유단자 품새", "기본동작", "서기", "품새 이론"];
const mypageMenuItems = [
  { href: "/mypage?tab=profile", label: "회원정보" },
  { href: "/mypage?tab=history", label: "강의 내역" },
  { href: "/mypage?tab=payments", label: "결제 내역" }
];
const adminMenuItems = [
  { href: "/admin?tab=members", label: "회원관리" },
  { href: "/admin?tab=create", label: "강의등록" },
  { href: "/admin?tab=courses", label: "강의목록" }
];

function courseHref(access: "paid" | "free", category: string) {
  const params = new URLSearchParams({ access });
  if (category !== "전체") params.set("category", category);
  return `/courses?${params.toString()}`;
}

type ProfileRow = {
  role: string;
};

export async function SiteHeader() {
  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const { data: profile } =
    supabase && user
      ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>()
      : { data: null };
  const isAdmin = profile?.role === "admin";

  const courseMenu = (
    <div className="nav-dropdown">
      <Link className="nav-dropdown-trigger" href="/courses">
        <span>강의</span>
        <ChevronDown size={15} />
      </Link>
      <div className="nav-dropdown-panel" aria-label="강의 카테고리">
        <div className="nav-dropdown-column">
          <strong>유료강의</strong>
          {courseCategories.map((category) => (
            <Link key={`paid-${category}`} href={courseHref("paid", category)}>
              {category}
            </Link>
          ))}
        </div>
        <div className="nav-dropdown-column">
          <strong>무료강의</strong>
          {courseCategories.map((category) => (
            <Link key={`free-${category}`} href={courseHref("free", category)}>
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const mypageMenu = (
    <div className="nav-dropdown">
      <Link className="nav-dropdown-trigger" href="/mypage">
        <span>마이페이지</span>
        <ChevronDown size={15} />
      </Link>
      <div className="nav-dropdown-panel compact" aria-label="마이페이지 메뉴">
        <div className="nav-dropdown-column">
          <strong>마이페이지</strong>
          {mypageMenuItems.map((menuItem) => (
            <Link key={menuItem.href} href={menuItem.href}>
              {menuItem.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const adminMenu = (
    <div className="nav-dropdown">
      <Link className="nav-dropdown-trigger" href="/admin">
        <span>관리자</span>
        <ChevronDown size={15} />
      </Link>
      <div className="nav-dropdown-panel compact" aria-label="관리자 메뉴">
        <div className="nav-dropdown-column">
          <strong>관리자</strong>
          {adminMenuItems.map((menuItem) => (
            <Link key={menuItem.href} href={menuItem.href}>
              {menuItem.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="BOTEPS 홈">
        <Image src="/images/boteps-logo.png" alt="BOTEPS" width={172} height={86} priority className="brand-logo" />
        <span className="brand-word">BOTEPS</span>
      </Link>
      <nav className="nav-links nav-links-primary" aria-label="강의 메뉴">
        {courseMenu}
        <Link className="nav-search-link" href="/courses" title="강의 검색">
          <Search size={18} />
          <span>검색</span>
        </Link>
      </nav>
      <div className="header-actions header-actions-right">
        <Link className="header-text-link" href="/">
          홈
        </Link>
        {mypageMenu}
        {isAdmin ? adminMenu : null}
        <label className="language-select">
          <Globe2 size={17} />
          <select aria-label="언어 선택" defaultValue="ko">
            <option value="ko">KR</option>
            <option value="en">EN</option>
          </select>
        </label>
        {user ? (
          <form action={signOut}>
            <button className="icon-button subtle" title="로그아웃">
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          </form>
        ) : (
          <Link className="icon-button subtle" href="/login" title="로그인">
            <LogIn size={18} />
            <span>로그인</span>
          </Link>
        )}
        <Link className="icon-button primary" href="/subscribe" title="구독">
          <ShieldCheck size={18} />
          <span>구독</span>
        </Link>
      </div>
    </header>
  );
}
