import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/ai-assistant/chat-interface";
import type { ChatMessage } from "@/types";

export const metadata: Metadata = {
  title: "עוזר AI | מנהל.AI",
};

const DEFAULT_CONVERSATION_ID = "default";

export default async function AiAssistantPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: history }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
    supabase
      .from("ai_messages")
      .select("*")
      .eq("user_id", user!.id)
      .eq("conversation_id", DEFAULT_CONVERSATION_ID)
      .order("created_at", { ascending: true })
      .limit(50),
  ]);

  const initialMessages: ChatMessage[] = (history ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.created_at,
  }));

  const userName = (profile?.full_name || "סטודנט").split(" ")[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          עוזר AI
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          שאלו כל שאלה אקדמית, כספית או מנהלית - אני כאן לעזור
        </p>
      </div>

      <ChatInterface
        conversationId={DEFAULT_CONVERSATION_ID}
        initialMessages={initialMessages}
        userName={userName}
      />
    </div>
  );
}
