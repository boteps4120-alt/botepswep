import Link from "next/link";
import Image from "next/image";
import { LogIn, LogOut, Search, ShieldCheck, UserRound } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const baseNavItems = [
  { href: "/", label: "홈" },
  { href: "/courses", label: "강의" },
  { href: "/mypage", label: "마이페이지" }
];

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
  const navItems = isAdmin ? [...baseNavItems, { href: "/admin", label: "관리자" }] : baseNavItems;

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="BOTEPS 홈">
        <Image src="/images/boteps-logo.png" alt="BOTEPS" width={172} height={86} priority className="brand-logo" />
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
        {user ? (
          <>
            <Link className="icon-button subtle" href="/mypage" title="내 계정">
              <UserRound size={18} />
              <span>내 계정</span>
            </Link>
            <form action={signOut}>
              <button className="icon-button subtle" title="로그아웃">
                <LogOut size={18} />
                <span>로그아웃</span>
              </button>
            </form>
          </>
        ) : (
          <Link className="icon-button subtle" href="/login" title="로그인">
            <LogIn size={18} />
            <span>로그인</span>
          </Link>
        )}
        <Link className="icon-button primary" href="/subscribe" title="월구독">
          <ShieldCheck size={18} />
          <span>월구독</span>
        </Link>
      </div>
    </header>
  );
}
