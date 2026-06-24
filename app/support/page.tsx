import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, MessageSquarePlus, Send, ShieldCheck } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createSupportThread, sendSupportMessage } from "./actions";

export const dynamic = "force-dynamic";

type SupportThreadRow = {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  status: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

type MessageProfile = {
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  role: string | null;
};

type SupportMessageRow = {
  id: string;
  thread_id: string;
  user_id: string | null;
  sender_role: string;
  body: string;
  created_at: string;
  profiles: MessageProfile | MessageProfile[] | null;
};

const categoryOptions = [
  { value: "lecture", label: "강의 이용" },
  { value: "video", label: "영상 재생" },
  { value: "payment", label: "결제/구독" },
  { value: "account", label: "계정/로그인" },
  { value: "suggestion", label: "강의 요청" },
  { value: "other", label: "기타" }
];

function categoryLabel(value?: string | null) {
  return categoryOptions.find((item) => item.value === value)?.label ?? "기타";
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "answered":
      return "답변 완료";
    case "closed":
      return "종료";
    case "waiting":
    default:
      return "답변 대기";
  }
}

function statusClass(status?: string | null) {
  switch (status) {
    case "answered":
      return "support-status answered";
    case "closed":
      return "support-status closed";
    case "waiting":
    default:
      return "support-status waiting";
  }
}

function formatDateTime(date?: string | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

function messageAuthor(message: SupportMessageRow) {
  if (message.sender_role === "admin") return "BOTEPS 관리자";

  const profile = Array.isArray(message.profiles) ? message.profiles[0] : message.profiles;
  return profile?.full_name ?? profile?.display_name ?? profile?.email ?? "나";
}

export default async function SupportPage({
  searchParams
}: {
  searchParams?: Promise<{ thread?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const supabase = hasSupabaseEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (hasSupabaseEnv() && !user) {
    redirect("/login?next=/support");
  }

  let threads: SupportThreadRow[] = [];
  let messages: SupportMessageRow[] = [];
  let setupError = false;

  if (supabase && user) {
    const { data, error } = await supabase
      .from("support_threads")
      .select("id,user_id,subject,category,status,last_message_at,created_at,updated_at")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Failed to load support threads", error);
      setupError = true;
    } else {
      threads = (data ?? []) as SupportThreadRow[];
    }
  }

  const selectedThreadId = params?.thread && threads.some((thread) => thread.id === params.thread) ? params.thread : threads[0]?.id;
  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? null;

  if (supabase && selectedThreadId && !setupError) {
    const { data, error } = await supabase
      .from("support_messages")
      .select("id,thread_id,user_id,sender_role,body,created_at,profiles(full_name,display_name,email,role)")
      .eq("thread_id", selectedThreadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load support messages", error);
      setupError = true;
    } else {
      messages = (data ?? []) as unknown as SupportMessageRow[];
    }
  }

  return (
    <section className="page-shell support-page">
      <div className="page-title support-title">
        <p className="eyebrow">1:1 문의</p>
        <h1>궁금한 점을 BOTEPS 안에서 바로 남기세요</h1>
        <p>강의 시청, 구독, 계정 문제를 문의하면 관리자가 같은 화면에서 답변합니다.</p>
      </div>

      {setupError ? (
        <div className="notice-banner error">
          문의 테이블이 아직 준비되지 않았습니다. Supabase SQL Editor에서 최신 schema.sql을 실행한 뒤 다시 시도해주세요.
        </div>
      ) : null}

      {params?.notice === "created" ? <div className="notice-banner success">문의가 접수되었습니다. 답변은 이 화면에서 확인할 수 있습니다.</div> : null}
      {params?.notice === "message-sent" ? <div className="notice-banner success">메시지가 전송되었습니다.</div> : null}
      {params?.notice === "invalid" ? <div className="notice-banner error">제목과 문의 내용을 다시 확인해주세요.</div> : null}
      {params?.notice === "closed" ? <div className="notice-banner error">종료된 문의에는 메시지를 추가할 수 없습니다.</div> : null}

      {params?.notice === "created" ? (
        <div className="support-modal-backdrop" role="presentation">
          <div className="support-modal" role="dialog" aria-modal="true" aria-labelledby="support-created-title">
            <span className="support-modal-icon">
              <MessageCircle size={24} />
            </span>
            <h2 id="support-created-title">문의가 접수되었습니다</h2>
            <p>답변은 이 화면에서 바로 확인할 수 있습니다.</p>
            <Link className="icon-button primary" href={selectedThreadId ? `/support?thread=${selectedThreadId}` : "/support"}>
              확인
            </Link>
          </div>
        </div>
      ) : null}

      <div className="support-compose-card">
        <div>
          <span className="support-card-icon">
            <MessageSquarePlus size={22} />
          </span>
          <h2>새 문의 작성</h2>
          <p>문의 내용을 남기면 관리자 페이지에 바로 표시됩니다.</p>
        </div>
        <form action={createSupportThread} className="support-compose-form">
          <div className="support-compose-row">
            <label className="field-label">
              문의 유형
              <select className="select-input" name="category" defaultValue="lecture">
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              제목
              <input className="form-input" name="subject" placeholder="예: 구독자 전용 강의가 열리지 않아요" maxLength={80} required />
            </label>
          </div>
          <label className="field-label">
            문의 내용
            <textarea className="form-input textarea-input" name="body" placeholder="상황을 자세히 적어주시면 더 빠르게 확인할 수 있습니다." rows={4} maxLength={1000} required />
          </label>
          <button className="icon-button primary support-submit-button">
            <Send size={18} />
            <span>문의 접수</span>
          </button>
        </form>
      </div>

      <div className="support-console">
        <aside className="support-thread-list" aria-label="문의 목록">
          <div className="support-panel-heading">
            <h2>내 문의</h2>
            <span>{threads.length}건</span>
          </div>
          {threads.length > 0 ? (
            <div className="support-thread-stack">
              {threads.map((thread) => (
                <Link className={`support-thread-card ${thread.id === selectedThreadId ? "active" : ""}`} href={`/support?thread=${thread.id}`} key={thread.id}>
                  <span className={statusClass(thread.status)}>{statusLabel(thread.status)}</span>
                  <strong>{thread.subject}</strong>
                  <small>
                    {categoryLabel(thread.category)} · {formatDateTime(thread.last_message_at)}
                  </small>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">아직 문의 내역이 없습니다.</div>
          )}
        </aside>

        <section className="support-chat-panel">
          {selectedThread ? (
            <>
              <div className="support-chat-header">
                <div>
                  <span className={statusClass(selectedThread.status)}>{statusLabel(selectedThread.status)}</span>
                  <h2>{selectedThread.subject}</h2>
                  <p>{categoryLabel(selectedThread.category)} · {formatDateTime(selectedThread.created_at)}</p>
                </div>
                <ShieldCheck size={28} />
              </div>

              <div className="support-message-list">
                {messages.map((message) => (
                  <div className={`support-message ${message.sender_role === "admin" ? "admin" : "user"}`} key={message.id}>
                    <div className="support-message-meta">
                      <strong>{messageAuthor(message)}</strong>
                      <span>{formatDateTime(message.created_at)}</span>
                    </div>
                    <p>{message.body}</p>
                  </div>
                ))}
              </div>

              {selectedThread.status === "closed" ? (
                <div className="support-closed-note">종료된 문의입니다. 추가 문의가 필요하면 새 문의를 작성해주세요.</div>
              ) : (
                <form action={sendSupportMessage} className="support-reply-form">
                  <input type="hidden" name="threadId" value={selectedThread.id} />
                  <textarea className="form-input textarea-input" name="body" placeholder="추가 메시지를 입력하세요." rows={3} maxLength={1000} required />
                  <button className="icon-button primary">
                    <Send size={18} />
                    <span>메시지 보내기</span>
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="support-empty-chat">
              <MessageCircle size={44} />
              <h2>문의방을 선택하세요</h2>
              <p>새 문의를 작성하거나 왼쪽 문의 목록에서 대화를 선택하면 내용이 표시됩니다.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
