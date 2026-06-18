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
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const nextBookmarked = !bookmarked;

    startTransition(async () => {
      const result = await toggleBookmark(slug, nextBookmarked);

      if (result.ok) {
        setBookmarked(result.bookmarked);
      }

      alert(result.message);
    });
  }

  return (
    <button
      aria-pressed={bookmarked}
      className={`icon-button favorite-button ${size} ${bookmarked ? "active" : ""}`}
      disabled={isPending}
      onClick={handleClick}
      type="button"
    >
      <Bookmark size={size === "large" ? 20 : 17} fill={bookmarked ? "currentColor" : "none"} />
      <span>{bookmarked ? "찜함" : label}</span>
    </button>
  );
}
