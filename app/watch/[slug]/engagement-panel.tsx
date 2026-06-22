"use client";

import { Heart, MessageCircle, Send } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import { addCourseComment, toggleCourseLike } from "../actions";

export type CourseComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type EngagementPanelProps = {
  slug: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  initialComments?: CourseComment[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function EngagementPanel({ slug, initialLiked = false, initialLikeCount = 0, initialComments = [] }: EngagementPanelProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [comments, setComments] = useState(initialComments);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    const nextLiked = !liked;

    setLiked(nextLiked);
    setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    startTransition(async () => {
      const result = await toggleCourseLike(slug, nextLiked);
      setMessage(result.message);

      if (!result.ok) {
        setLiked(!nextLiked);
        setLikeCount((count) => Math.max(0, count + (nextLiked ? -1 : 1)));
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextComment = comment.trim();
    if (!nextComment) {
      setMessage("댓글 내용을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await addCourseComment(slug, nextComment);
      setMessage(result.message);

      if (result.ok) {
        setComments((items) => [
          {
            id: `local-${Date.now()}`,
            authorName: "나",
            body: nextComment,
            createdAt: new Date().toISOString()
          },
          ...items
        ]);
        setComment("");
      }
    });
  }

  return (
    <section className="player-panel engagement-panel">
      <div className="engagement-heading">
        <div>
          <p className="eyebrow">반응과 의견</p>
          <h2>좋아요와 댓글</h2>
        </div>
        <button className={`icon-button like-button large ${liked ? "active" : ""}`} disabled={isPending} onClick={handleLike} type="button">
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
          <span>좋아요 {likeCount}</span>
        </button>
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <MessageCircle size={20} />
        <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="강의에 대한 의견을 남겨주세요" maxLength={500} />
        <button disabled={isPending} type="submit">
          <Send size={18} />
          <span>등록</span>
        </button>
      </form>

      {message ? <p className="engagement-message">{message}</p> : null}

      <div className="comment-list">
        {comments.length > 0 ? (
          comments.map((item) => (
            <article className="comment-item" key={item.id}>
              <div>
                <strong>{item.authorName}</strong>
                <span>{formatDate(item.createdAt)}</span>
              </div>
              <p>{item.body}</p>
            </article>
          ))
        ) : (
          <p className="empty-state">아직 댓글이 없습니다. 첫 의견을 남겨보세요.</p>
        )}
      </div>
    </section>
  );
}
