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
import { DEMO_COURSES, REQUEST_TYPE_META } from "@/lib/constants";
import type { AdminRequest, RequestType } from "@/types";

const REQUEST_TYPES = Object.keys(REQUEST_TYPE_META) as RequestType[];

export function NewRequestDialog({ onAdded }: { onAdded: (request: AdminRequest) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<RequestType>("special_exam");
  const [course, setCourse] = useState<string>("none");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      toast.error("יש למלא כותרת ותיאור לבקשה");
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
      .from("requests")
      .insert({
        user_id: user.id,
        type,
        course: course === "none" ? null : course,
        title: title.trim(),
        description: description.trim(),
      })
      .select()
      .single();

    setLoading(false);

    if (error || !inserted) {
      toast.error("שגיאה בשליחת הבקשה");
      return;
    }

    toast.success("הבקשה נשלחה בהצלחה");
    onAdded(inserted);
    setOpen(false);
    setType("special_exam");
    setCourse("none");
    setTitle("");
    setDescription("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          בקשה חדשה
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>בקשה מנהלתית חדשה</DialogTitle>
          <DialogDescription>
            הגישו בקשה למשרדי הסטודנטים ועקבו אחר הסטטוס שלה
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>סוג בקשה</Label>
            <Select value={type} onValueChange={(v) => setType(v as RequestType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {REQUEST_TYPE_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">{REQUEST_TYPE_META[type].description}</p>
          </div>

          <div className="space-y-2">
            <Label>קורס (אופציונלי)</Label>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא קורס מסוים</SelectItem>
                {DEMO_COURSES.map((c) => (
                  <SelectItem key={c.code} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-title">כותרת</Label>
            <Input
              id="request-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: בקשה למועד מיוחד בסטטיסטיקה"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-description">תיאור הבקשה</Label>
            <Textarea
              id="request-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="פרטו את הבקשה שלכם..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            שליחת בקשה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
