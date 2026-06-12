"use client";

import { useMemo, useState } from "react";
import { Bell, Trash2, AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReminderDialog } from "@/components/reminders/reminder-dialog";
import { SmartReminders } from "@/components/reminders/smart-reminders";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { generateSmartReminders } from "@/lib/smart-reminders";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import type { DocumentRow, Reminder, ReminderPriority, Transaction } from "@/types";

const PRIORITY_LABEL: Record<ReminderPriority, string> = {
  high: "דחוף",
  medium: "בינוני",
  low: "נמוך",
};

const PRIORITY_VARIANT: Record<ReminderPriority, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

const PRIORITY_BORDER: Record<ReminderPriority, string> = {
  high: "#EF4444",
  medium: "#D97706",
  low: "#94A3B8",
};

export function RemindersClient({
  initialReminders,
  transactions,
  documents,
}: {
  initialReminders: Reminder[];
  transactions: Transaction[];
  documents: DocumentRow[];
}) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null);
  const [deleting, setDeleting] = useState(false);

  const smartReminders = useMemo(
    () => generateSmartReminders({ transactions, documents }),
    [transactions, documents]
  );

  const sorted = useMemo(
    () => [...reminders].sort((a, b) => a.due_date.localeCompare(b.due_date)),
    [reminders]
  );

  const pending = sorted.filter((r) => !r.completed);
  const completed = sorted.filter((r) => r.completed);

  const groupedPending = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    const groups: { key: string; label: string; items: Reminder[] }[] = [
      { key: "overdue", label: "באיחור", items: [] },
      { key: "today", label: "היום", items: [] },
      { key: "week", label: "השבוע", items: [] },
      { key: "later", label: "בהמשך", items: [] },
    ];

    for (const reminder of pending) {
      const due = new Date(reminder.due_date);
      due.setHours(0, 0, 0, 0);

      if (due < today) groups[0].items.push(reminder);
      else if (due.getTime() === today.getTime()) groups[1].items.push(reminder);
      else if (due <= endOfWeek) groups[2].items.push(reminder);
      else groups[3].items.push(reminder);
    }

    return groups.filter((g) => g.items.length > 0);
  }, [pending]);

  const summary = useMemo(() => {
    const now = new Date();
    const inAWeek = new Date();
    inAWeek.setDate(now.getDate() + 7);

    const urgent = pending.filter((r) => r.priority === "high").length;
    const thisWeek = pending.filter((r) => {
      const due = new Date(r.due_date);
      return due >= new Date(now.toDateString()) && due <= inAWeek;
    }).length;

    return { open: pending.length, urgent, thisWeek, completed: completed.length };
  }, [pending, completed]);

  async function toggleComplete(reminder: Reminder) {
    const supabase = createClient();
    const { error } = await supabase
      .from("reminders")
      .update({ completed: !reminder.completed })
      .eq("id", reminder.id);

    if (error) {
      toast.error("שגיאה בעדכון התזכורת");
      return;
    }

    setReminders((prev) =>
      prev.map((r) => (r.id === reminder.id ? { ...r, completed: !r.completed } : r))
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;

    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    setDeleting(false);

    if (error) {
      toast.error("שגיאה במחיקת התזכורת");
      return;
    }

    setReminders((prev) => prev.filter((r) => r.id !== id));
    setDeleteTarget(null);
    toast.success("התזכורת נמחקה");
  }

  function ReminderRow({ reminder, delay = 0 }: { reminder: Reminder; delay?: number }) {
    const isOverdue = !reminder.completed && new Date(reminder.due_date) < new Date(new Date().toDateString());

    return (
      <div
        className="flex animate-fade-in items-start gap-3 border-r-2 px-4 py-3 transition-colors hover:bg-accent"
        style={{
          borderColor: reminder.completed ? "#E5E7EB" : PRIORITY_BORDER[reminder.priority],
          animationDelay: `${delay}ms`,
        }}
      >
        <button
          onClick={() => toggleComplete(reminder)}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            reminder.completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary"
          )}
        >
          {reminder.completed && (
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className={cn("text-[13px] font-semibold text-foreground", reminder.completed && "line-through text-muted-foreground")}>
            {reminder.title}
          </p>
          {reminder.description && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{reminder.description}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{reminder.category}</Badge>
            <Badge variant={PRIORITY_VARIANT[reminder.priority]} className="text-[10px]">
              {PRIORITY_LABEL[reminder.priority]}
            </Badge>
            <span className={cn("text-[11px]", isOverdue ? "font-semibold text-destructive" : "text-muted-foreground")}>
              {formatDate(reminder.due_date)} ({formatRelativeTime(reminder.due_date)})
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteTarget(reminder)}
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">תזכורות</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            עקבו אחרי מועדים אקדמיים, תשלומים ומשימות חשובות
          </p>
        </div>
        <ReminderDialog onAdded={(r) => setReminders((prev) => [...prev, r])} />
      </div>

      <SmartReminders items={smartReminders} />

      <div>
        <h2 className="text-base font-bold tracking-tight text-foreground">תזכורות ידניות</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">תזכורות שהוספתם בעצמכם</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="animate-fade-in">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#EEF2FF" }}>
              <Bell className="h-4 w-4" style={{ color: "#4F46E5" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{summary.open}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">תזכורות פתוחות</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in [animation-delay:50ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#FEF2F2" }}>
              <AlertTriangle className="h-4 w-4" style={{ color: "#EF4444" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{summary.urgent}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">דחופות</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in [animation-delay:100ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#FFFBEB" }}>
              <CalendarClock className="h-4 w-4" style={{ color: "#D97706" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{summary.thisWeek}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">השבוע</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in [animation-delay:150ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#ECFDF5" }}>
              <CheckCircle2 className="h-4 w-4" style={{ color: "#10B981" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{summary.completed}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">הושלמו</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">פתוחות ({pending.length})</TabsTrigger>
          <TabsTrigger value="completed">הושלמו ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/40" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">אין תזכורות פתוחות</p>
                  <p className="text-[12px] text-muted-foreground">כל הכבוד, אתם מסודרים!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groupedPending.map((group) => (
                <div key={group.key}>
                  <h3 className="mb-2 px-1 text-[12px] font-semibold text-muted-foreground">
                    {group.label} ({group.items.length})
                  </h3>
                  <Card>
                    <CardContent className="divide-y divide-border p-0">
                      {group.items.map((reminder, i) => (
                        <ReminderRow key={reminder.id} reminder={reminder} delay={i * 30} />
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {completed.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-[12px] text-muted-foreground">אין תזכורות שהושלמו עדיין</p>
                </div>
              ) : (
                completed.map((reminder, i) => <ReminderRow key={reminder.id} reminder={reminder} delay={i * 30} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="מחיקת תזכורת"
        description={`האם אתם בטוחים שברצונכם למחוק את "${deleteTarget?.title ?? ""}"? לא ניתן לשחזר פעולה זו.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
