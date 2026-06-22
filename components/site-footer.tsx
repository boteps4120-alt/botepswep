import Link from "next/link";
import { Facebook, Instagram, Mail, Youtube } from "lucide-react";

const socialLinks = [
  { href: "https://www.instagram.com/", label: "Instagram", icon: Instagram },
  { href: "https://www.facebook.com/", label: "Facebook", icon: Facebook },
  { href: "https://www.youtube.com/", label: "YouTube", icon: Youtube }
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-subscribe">
        <Mail size={34} aria-hidden="true" />
        <strong>BOTEPS SNS 구독하기</strong>
        <Link className="footer-subscribe-button" href="/subscribe">
          구독하기
        </Link>
      </div>
      <div className="footer-socials" aria-label="BOTEPS SNS">
        <span>BOTEPS 팔로우하기</span>
        {socialLinks.map(({ href, label, icon: Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon size={24} />
          </a>
        ))}
      </div>
    </footer>
  );
}
