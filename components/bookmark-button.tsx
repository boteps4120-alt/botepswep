"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark } from "@/app/courses/actions";

type BookmarkButtonProps = {
  slug: string;
  initialBookmarked?: boolean;
  label?: string;
  size?: "compact" | "large";
};

export function BookmarkButton({ slug, initialBookmarked = false, label = "찜하기", size = "compact" }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const nextBookmarked = !bookmarked;

    startTransition(async () => {
      const result = await toggleBookmark(slug, nextBookmarked);

      if (result.ok) {
        setBookmarked(result.bookmarked);
      }

      setMessage(result.message);
    });
  }

  return (
    <>
      <button
        aria-pressed={bookmarked}
        className={`icon-button favorite-button ${size} ${bookmarked ? "active" : ""}`}
        disabled={isPending}
        onClick={handleClick}
        type="button"
      >
        <Bookmark size={size === "large" ? 20 : 17} fill={bookmarked ? "#d22f2f" : "none"} />
        <span>{bookmarked ? "찜함" : label}</span>
      </button>

      {message ? (
        <div className="comment-modal-backdrop" role="presentation" onClick={() => setMessage("")}>
          <div
            aria-labelledby="bookmark-message-title"
            aria-modal="true"
            className="comment-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 id="bookmark-message-title">찜하기</h3>
            <p>{message}</p>
            <div className="comment-modal-actions">
              <button className="modal-button danger" type="button" onClick={() => setMessage("")}>
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
