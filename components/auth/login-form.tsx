"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("אימייל או סיסמה שגויים. נסו שוב.");
      return;
    }

    toast.success("התחברת בהצלחה!");
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          ברוכים הבאים בחזרה
        </h1>
        <p className="text-[13px] text-muted-foreground">
          התחברו לחשבון שלכם כדי להמשיך לנהל את העניינים האקדמיים
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
            autoComplete="email"
            dir="ltr"
            className="rounded-xl text-right text-[13px]"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[12px]">סיסמה</Label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              שכחתם סיסמה?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            dir="ltr"
            className="rounded-xl text-right text-[13px]"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          התחברות
        </Button>
      </form>

      <p className="text-center text-[12px] text-muted-foreground">
        אין לכם חשבון?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          הרשמה חינם
        </Link>
      </p>
    </div>
  );
}
