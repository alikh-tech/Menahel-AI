"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Eye, Download, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import type { ChatMessage, DemoAction } from "@/types";

const ACTION_ICONS: Record<DemoAction["type"], typeof Eye> = {
  view: Eye,
  download: Download,
  email: Mail,
};

const ACTION_TOAST: Record<DemoAction["type"], string> = {
  view: "מצב הדגמה: צפייה במסמך אינה זמינה כרגע",
  download: "מצב הדגמה: הורדת המסמך אינה זמינה כרגע",
  email: "מצב הדגמה: שליחת המסמך למייל אינה זמינה כרגע",
};

const SUGGESTIONS = [
  "תן לי אישור לימודים",
  "מה הממוצע שלי?",
  "האם יש לי חוב שכר לימוד?",
  "מתי המבחן הקרוב שלי?",
];

interface ChatInterfaceProps {
  conversationId: string;
  initialMessages: ChatMessage[];
  userName: string;
}

export function ChatInterface({
  conversationId,
  initialMessages,
  userName,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase.from("ai_messages").insert({
        user_id: data.user.id,
        conversation_id: conversationId,
        role: "user",
        content: userMessage.content,
      });
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const json = await res.json();
      const assistantContent: string =
        json.content || json.error || "מצטער, משהו השתבש. נסו שוב.";

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantContent,
        createdAt: new Date().toISOString(),
        actions: json.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.user) {
        await supabase.from("ai_messages").insert({
          user_id: data.user.id,
          conversation_id: conversationId,
          role: "assistant",
          content: assistantContent,
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "מצטער, אירעה שגיאה. נסו שוב מאוחר יותר.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {/* Chat header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
        >
          <Sparkles className="h-4 w-4" />
          <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-none text-foreground">עוזר ה-AI שלך</p>
          <p className="mt-1 text-[11px] text-success">זמין כעת</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft" style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-foreground">
                שלום {userName}, איך אפשר לעזור היום?
              </h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                שאלו אותי כל שאלה על לימודים, מלגות, כספים ומסמכים
              </p>
            </div>
            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-right text-[12px] font-medium text-foreground transition-all hover:border-primary/40 hover:bg-accent active:scale-[0.98]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex animate-fade-in items-start gap-2.5",
                  message.role === "user" && "flex-row-reverse"
                )}
                style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-[11px]",
                      message.role === "assistant"
                        ? "text-white"
                        : "bg-secondary text-secondary-foreground"
                    )}
                    style={
                      message.role === "assistant"
                        ? { background: "linear-gradient(135deg,#4F46E5,#6366F1)" }
                        : undefined
                    }
                  >
                    {message.role === "assistant" ? (
                      <Sparkles className="h-3.5 w-3.5" />
                    ) : (
                      getInitials(userName || "U")
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("flex max-w-[80%] flex-col gap-2", message.role === "user" && "items-end")}>
                  <div
                    className={cn(
                      "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[12.5px] leading-relaxed",
                      message.role === "assistant"
                        ? "border border-border bg-background text-foreground"
                        : "text-white"
                    )}
                    style={
                      message.role === "user"
                        ? { background: "linear-gradient(135deg,#4F46E5,#6366F1)" }
                        : undefined
                    }
                  >
                    {message.content}
                  </div>

                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.actions.map((action) => {
                        const Icon = ACTION_ICONS[action.type];
                        return (
                          <Button
                            key={action.type}
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-[11px]"
                            onClick={() => toast.info(ACTION_TOAST[action.type])}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {action.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2.5">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-white" style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            )}
            {!loading && messages[messages.length - 1]?.role === "assistant" && (
              <div className="flex animate-fade-in flex-wrap gap-2 pr-9">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition-all hover:border-primary/40 hover:bg-accent active:scale-[0.98]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border p-3 sm:p-4"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="כתבו את ההודעה שלכם..."
          className="min-h-[44px] max-h-32 flex-1 resize-none rounded-xl text-[13px]"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 rotate-180" />
          )}
          <span className="sr-only">שליחה</span>
        </Button>
      </form>
    </div>
  );
}
