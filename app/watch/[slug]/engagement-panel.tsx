"use client";

import { Heart, MessageCircle, Pencil, Send, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { BookmarkButton } from "@/components/bookmark-button";
import { addCourseComment, deleteCourseComment, toggleCourseLike, updateCourseComment } from "../actions";

export type CourseComment = {
  id: string;
  userId?: string | null;
  parentCommentId?: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
};

type EngagementPanelProps = {
  slug: string;
  currentUserId?: string | null;
  initialBookmarked?: boolean;
  initialLiked?: boolean;
  initialLikeCount?: number;
  initialComments?: CourseComment[];
  isAdmin?: boolean;
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

export function EngagementPanel({
  slug,
  currentUserId = null,
  initialBookmarked = false,
  initialLiked = false,
  initialLikeCount = 0,
  initialComments = [],
  isAdmin = false
}: EngagementPanelProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [comments, setComments] = useState(initialComments);
  const [comment, setComment] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const rootComments = useMemo(() => comments.filter((item) => !item.parentCommentId), [comments]);
  const repliesByParent = useMemo(() => {
    return comments.reduce<Record<string, CourseComment[]>>((acc, item) => {
      if (!item.parentCommentId) return acc;
      acc[item.parentCommentId] = [...(acc[item.parentCommentId] ?? []), item];
      return acc;
    }, {});
  }, [comments]);

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
          result.comment ?? {
            id: `local-${Date.now()}`,
            userId: currentUserId,
            parentCommentId: null,
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

  function handleReplySubmit(event: FormEvent<HTMLFormElement>, parentId: string) {
    event.preventDefault();
    const nextReply = replyBody.trim();
    if (!nextReply) {
      setMessage("답글 내용을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await addCourseComment(slug, nextReply, parentId);
      setMessage(result.message);

      if (result.ok) {
        setComments((items) => [
          ...items,
          result.comment ?? {
            id: `local-reply-${Date.now()}`,
            userId: currentUserId,
            parentCommentId: parentId,
            authorName: "나",
            body: nextReply,
            createdAt: new Date().toISOString()
          }
        ]);
        setReplyBody("");
        setReplyTargetId(null);
      }
    });
  }

  function startEditing(item: CourseComment) {
    setEditingCommentId(item.id);
    setEditingBody(item.body);
    setReplyTargetId(null);
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>, commentId: string) {
    event.preventDefault();
    const nextBody = editingBody.trim();
    if (!nextBody) {
      setMessage("수정할 댓글 내용을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await updateCourseComment(slug, commentId, nextBody);
      setMessage(result.message);

      if (result.ok) {
        setComments((items) =>
          items.map((item) => (item.id === commentId ? { ...item, body: nextBody, updatedAt: new Date().toISOString() } : item))
        );
        setEditingCommentId(null);
        setEditingBody("");
      }
    });
  }

  function handleDelete() {
    if (!deleteTargetId) return;

    const commentId = deleteTargetId;
    setDeleteTargetId(null);

    startTransition(async () => {
      const result = await deleteCourseComment(slug, commentId);
      setMessage(result.message);

      if (result.ok) {
        setComments((items) => items.filter((item) => item.id !== commentId && item.parentCommentId !== commentId));
      }
    });
  }

  function renderComment(item: CourseComment, isReply = false) {
    const canEdit = Boolean(currentUserId && item.userId === currentUserId);
    const canDelete = canEdit || isAdmin;
    const isEditing = editingCommentId === item.id;

    return (
      <article className={`comment-item ${isReply ? "reply" : ""}`} key={item.id}>
        <div className="comment-meta">
          <strong>{item.authorName}</strong>
          <span>
            {formatDate(item.createdAt)}
            {item.updatedAt && item.updatedAt !== item.createdAt ? " 수정됨" : ""}
          </span>
        </div>

        {isEditing ? (
          <form className="comment-edit-form" onSubmit={(event) => handleEditSubmit(event, item.id)}>
            <input value={editingBody} onChange={(event) => setEditingBody(event.target.value)} maxLength={500} />
            <div>
              <button className="text-action primary" disabled={isPending} type="submit">
                저장
              </button>
              <button className="text-action" type="button" onClick={() => setEditingCommentId(null)}>
                취소
              </button>
            </div>
          </form>
        ) : (
          <p>{item.body}</p>
        )}

        {!isEditing ? (
          <div className="comment-actions">
            {!isReply ? (
              <button className="text-action" type="button" onClick={() => setReplyTargetId(replyTargetId === item.id ? null : item.id)}>
                답글
              </button>
            ) : null}
            {canEdit ? (
              <>
                <button className="text-action" type="button" onClick={() => startEditing(item)}>
                  <Pencil size={14} />
                  수정
                </button>
              </>
            ) : null}
            {canDelete ? (
              <button className="text-action danger" disabled={isPending} type="button" onClick={() => setDeleteTargetId(item.id)}>
                <Trash2 size={14} />
                삭제
              </button>
            ) : null}
          </div>
        ) : null}

        {replyTargetId === item.id ? (
          <form className="reply-form" onSubmit={(event) => handleReplySubmit(event, item.id)}>
            <input value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder="답글을 입력해주세요" maxLength={500} />
            <button disabled={isPending} type="submit">
              <Send size={16} />
              답글 등록
            </button>
          </form>
        ) : null}

        {!isReply && repliesByParent[item.id]?.length ? (
          <div className="reply-list">{repliesByParent[item.id].map((reply) => renderComment(reply, true))}</div>
        ) : null}
      </article>
    );
  }

  return (
    <section className="player-panel engagement-panel">
      <div className="engagement-heading">
        <div>
          <h2>댓글</h2>
        </div>
        <div className="engagement-actions">
          <BookmarkButton slug={slug} initialBookmarked={initialBookmarked} size="large" />
          <button className={`like-button large ${liked ? "active" : ""}`} disabled={isPending} onClick={handleLike} type="button">
            <Heart size={22} fill={liked ? "#d22f2f" : "none"} />
            <span>좋아요</span>
            <strong>{likeCount}</strong>
          </button>
        </div>
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <MessageCircle size={20} />
        <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="강의에 대한 의견을 남겨주세요" maxLength={500} />
        <button disabled={isPending} type="submit">
          <Send size={18} />
          <span>댓글 등록</span>
        </button>
      </form>

      {message ? <p className="engagement-message">{message}</p> : null}

      <div className="comment-list">
        {rootComments.length > 0 ? rootComments.map((item) => renderComment(item)) : <p className="empty-state">아직 댓글이 없습니다. 첫 의견을 남겨보세요.</p>}
      </div>

      {deleteTargetId ? (
        <div className="comment-modal-backdrop" role="presentation" onClick={() => setDeleteTargetId(null)}>
          <div
            aria-labelledby="delete-comment-title"
            aria-modal="true"
            className="comment-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 id="delete-comment-title">댓글을 삭제할까요?</h3>
            <p>삭제한 댓글과 답글은 되돌릴 수 없습니다.</p>
            <div className="comment-modal-actions">
              <button className="modal-button subtle" type="button" onClick={() => setDeleteTargetId(null)}>
                취소
              </button>
              <button className="modal-button danger" disabled={isPending} type="button" onClick={handleDelete}>
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
