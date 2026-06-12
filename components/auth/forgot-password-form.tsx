"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined,
    });

    setLoading(false);

    if (error) {
      setError("שגיאה בשליחת מייל איפוס. נסו שוב.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-fade-in space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">בדקו את תיבת המייל</h1>
        <p className="text-[13px] text-muted-foreground">
          שלחנו קישור לאיפוס סיסמה לכתובת {email}
        </p>
        <Link href="/login" className="text-[12px] font-medium text-primary hover:underline">
          חזרה להתחברות
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">שחזור סיסמה</h1>
        <p className="text-[13px] text-muted-foreground">
          הזינו את כתובת האימייל שלכם ונשלח לכם קישור לאיפוס הסיסמה
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12px]">אימייל</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            className="rounded-xl text-right text-[13px]"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[12px] text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          שליחת קישור איפוס
        </Button>
      </form>

      <p className="text-center text-[12px] text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          חזרה להתחברות
        </Link>
      </p>
    </div>
  );
}
