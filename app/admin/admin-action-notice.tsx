"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  "course-created": "강의 등록이 완료되었습니다.",
  "course-updated": "강의 수정이 완료되었습니다.",
  "course-deleted": "강의를 삭제했습니다."
};

export function AdminActionNotice({ notice }: { notice?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const message = notice ? messages[notice] : undefined;
  const [open, setOpen] = useState(Boolean(message));

  function closeNotice() {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("notice");
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  if (!open || !message) return null;

  return (
    <div className="admin-success-modal-backdrop" role="presentation" onClick={closeNotice}>
      <div
        className="admin-success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-success-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-success-mark" aria-hidden="true">✓</div>
        <h2 id="admin-success-title">처리 완료</h2>
        <p>{message}</p>
        <button type="button" className="admin-success-button" onClick={closeNotice}>
          확인
        </button>
      </div>
    </div>
  );
}
