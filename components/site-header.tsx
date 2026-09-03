import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Globe2, LogIn, LogOut, MessageCircle, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { NavDropdownBehavior } from "@/components/nav-dropdown-behavior";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { curriculumPrograms } from "@/lib/data";

const mypageMenuItems = [
  { href: "/mypage?tab=profile", label: "회원정보" },
  { href: "/mypage?tab=history", label: "강의 내역" },
  { href: "/mypage?tab=payments", label: "결제 내역" },
  { href: "/support", label: "1:1 문의" }
];
const adminMenuItems = [
  { href: "/admin?tab=members", label: "회원관리" },
  { href: "/admin?tab=create", label: "강의등록" },
  { href: "/admin?tab=courses", label: "강의목록" },
  { href: "/admin?tab=support", label: "1:1 문의" }
];

function courseHref(access: "all" | "free", category?: string) {
  const params = new URLSearchParams();
  if (access !== "all") params.set("access", access);
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
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
      <div className="nav-dropdown-panel course-menu-panel" aria-label="강의 카테고리">
        <div className="nav-dropdown-column curriculum-menu-column">
          <strong>BOTEPS 교육과정</strong>
          <div className="curriculum-menu-grid">
            {[curriculumPrograms.slice(0, 5), curriculumPrograms.slice(5)].map((programs, index) => (
              <div className="curriculum-menu-group" key={index === 0 ? "course-01-05" : "course-06-10"}>
                <small>{index === 0 ? "COURSE 01-05" : "COURSE 06-10"}</small>
                {programs.map((program) => (
                  <Link key={program.code} href={courseHref("all", program.code)}>
                    <span>{program.code}</span>
                    <b>{program.title}</b>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="nav-dropdown-column">
          <strong>무료강의</strong>
          <Link href={courseHref("free")}>전체 무료강의</Link>
        </div>
        <div className="nav-dropdown-column">
          <strong>쇼츠</strong>
          <Link href={courseHref("all", "쇼츠")}>전체 쇼츠</Link>
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
      <NavDropdownBehavior />
      <Link className="brand" href="/" aria-label="BOTEPS 홈">
        <Image src="/images/boteps-logo.png" alt="BOTEPS" width={172} height={86} priority className="brand-logo" />
        <span className="brand-word">BOTEPS</span>
      </Link>
      <nav className="nav-links nav-links-primary" aria-label="강의 메뉴">
        <Link className="header-text-link" href="/">
          홈
        </Link>
        {courseMenu}
      </nav>
      <div className="header-actions header-actions-right">
        {mypageMenu}
        <Link className="header-text-link header-support-link" href="/support">
          <MessageCircle size={17} />
          <span>문의</span>
        </Link>
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
