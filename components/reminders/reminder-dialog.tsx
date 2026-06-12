"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { REMINDER_CATEGORIES } from "@/lib/constants";
import type { Reminder, ReminderPriority } from "@/types";

const PRIORITY_OPTIONS: { value: ReminderPriority; label: string }[] = [
  { value: "high", label: "דחוף" },
  { value: "medium", label: "בינוני" },
  { value: "low", label: "נמוך" },
];

export function ReminderDialog({ onAdded }: { onAdded: (reminder: Reminder) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(REMINDER_CATEGORIES[0]);
  const [priority, setPriority] = useState<ReminderPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !dueDate) {
      toast.error("יש למלא כותרת ותאריך יעד");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("יש להתחבר מחדש");
      setLoading(false);
      return;
    }

    const { data: inserted, error } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        due_date: dueDate,
        completed: false,
      })
      .select()
      .single();

    setLoading(false);

    if (error || !inserted) {
      toast.error("שגיאה בהוספת התזכורת");
      return;
    }

    toast.success("התזכורת נוספה בהצלחה");
    onAdded(inserted);
    setOpen(false);
    setTitle("");
    setDescription("");
    setCategory(REMINDER_CATEGORIES[0]);
    setPriority("medium");
    setDueDate("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          תזכורת חדשה
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>תזכורת חדשה</DialogTitle>
          <DialogDescription>
            הוסיפו תזכורת למועד אקדמי, תשלום או פגישה חשובה
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: הגשת עבודה במבוא לכלכלה"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אופציונלי)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="פרטים נוספים..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>עדיפות</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ReminderPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">תאריך יעד</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            הוספת תזכורת
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
