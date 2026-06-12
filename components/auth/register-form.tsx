"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        email,
      });
    }

    setLoading(false);
    toast.success("נרשמת בהצלחה! ברוכים הבאים למנהל.AI");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          יצירת חשבון חדש
        </h1>
        <p className="text-[13px] text-muted-foreground">
          הצטרפו אלינו ותתחילו לנהל את הלימודים בצורה חכמה
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-[12px]">שם מלא</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="ישראל ישראלי"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="rounded-xl text-[13px]"
          />
        </div>

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
          <Label htmlFor="password" className="text-[12px]">סיסמה</Label>
          <Input
            id="password"
            type="password"
            placeholder="לפחות 6 תווים"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
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
          יצירת חשבון
        </Button>
      </form>

      <p className="text-center text-[12px] text-muted-foreground">
        כבר יש לכם חשבון?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          התחברות
        </Link>
      </p>
    </div>
  );
}
