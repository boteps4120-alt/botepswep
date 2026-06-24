"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const categories = new Set(["lecture", "payment", "account", "video", "suggestion", "other"]);
const statuses = new Set(["waiting", "answered", "closed"]);

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function supportRedirect(threadId?: string, notice?: string, source?: string) {
  const params = new URLSearchParams();
  if (source === "admin") params.set("tab", "support");
  if (threadId) params.set(source === "admin" ? "support" : "thread", threadId);
  if (notice) params.set("notice", notice);

  return source === "admin" ? `/admin?${params.toString()}` : `/support?${params.toString()}`;
}

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/support");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name,display_name,email")
    .eq("id", user.id)
    .maybeSingle<{ role: string; full_name: string | null; display_name: string | null; email: string | null }>();

  return {
    supabase,
    user,
    profile,
    isAdmin: profile?.role === "admin"
  };
}

export async function createSupportThread(formData: FormData) {
  const { supabase, user } = await getCurrentUser();
  const subject = clean(formData.get("subject"));
  const category = clean(formData.get("category")) || "other";
  const body = clean(formData.get("body"));

  if (!subject || subject.length > 80 || !body || body.length > 1000 || !categories.has(category)) {
    redirect(supportRedirect(undefined, "invalid"));
  }

  const now = new Date().toISOString();
  const { data: thread, error: threadError } = await supabase
    .from("support_threads")
    .insert({
      user_id: user.id,
      subject,
      category,
      status: "waiting",
      last_message_at: now,
      updated_at: now
    })
    .select("id")
    .single<{ id: string }>();

  if (threadError || !thread) {
    console.error("Failed to create support thread", threadError);
    redirect(supportRedirect(undefined, "setup-error"));
  }

  const { error: messageError } = await supabase.from("support_messages").insert({
    thread_id: thread.id,
    user_id: user.id,
    sender_role: "user",
    body
  });

  if (messageError) {
    console.error("Failed to create support message", messageError);
    redirect(supportRedirect(thread.id, "message-error"));
  }

  revalidatePath("/support");
  revalidatePath("/admin");
  redirect(supportRedirect(thread.id, "created"));
}

export async function sendSupportMessage(formData: FormData) {
  const { supabase, user, isAdmin } = await getCurrentUser();
  const threadId = clean(formData.get("threadId"));
  const body = clean(formData.get("body"));
  const source = clean(formData.get("source"));

  if (!threadId || !body || body.length > 1000) {
    redirect(supportRedirect(threadId, "invalid", source));
  }

  const { data: thread, error: threadError } = await supabase
    .from("support_threads")
    .select("id,user_id,status")
    .eq("id", threadId)
    .maybeSingle<{ id: string; user_id: string; status: string }>();

  if (threadError || !thread || (!isAdmin && thread.user_id !== user.id)) {
    console.error("Failed to load support thread", threadError);
    redirect(supportRedirect(threadId, "not-found", source));
  }

  if (thread.status === "closed") {
    redirect(supportRedirect(threadId, "closed", source));
  }

  const senderRole = isAdmin && source === "admin" ? "admin" : "user";
  const nextStatus = senderRole === "admin" ? "answered" : "waiting";
  const now = new Date().toISOString();

  const { error: messageError } = await supabase.from("support_messages").insert({
    thread_id: threadId,
    user_id: user.id,
    sender_role: senderRole,
    body
  });

  if (messageError) {
    console.error("Failed to send support message", messageError);
    redirect(supportRedirect(threadId, "message-error", source));
  }

  const { error: updateError } = await supabase
    .from("support_threads")
    .update({
      status: nextStatus,
      last_message_at: now,
      updated_at: now
    })
    .eq("id", threadId);

  if (updateError) {
    console.error("Failed to update support thread", updateError);
  }

  revalidatePath("/support");
  revalidatePath("/admin");
  redirect(supportRedirect(threadId, "message-sent", source));
}

export async function updateSupportThreadStatus(formData: FormData) {
  const { supabase, isAdmin } = await getCurrentUser();
  const threadId = clean(formData.get("threadId"));
  const status = clean(formData.get("status"));

  if (!isAdmin || !threadId || !statuses.has(status)) {
    redirect(supportRedirect(threadId, "invalid", "admin"));
  }

  const { error } = await supabase
    .from("support_threads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", threadId);

  if (error) {
    console.error("Failed to update support thread status", error);
    redirect(supportRedirect(threadId, "status-error", "admin"));
  }

  revalidatePath("/support");
  revalidatePath("/admin");
  redirect(supportRedirect(threadId, "status-updated", "admin"));
}
