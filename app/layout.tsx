import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "boteps | 태권도 품새 강의 플랫폼",
  description: "태권도장 관장과 사범을 위한 품새 영상 강의 구독 플랫폼"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Analytics />
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
