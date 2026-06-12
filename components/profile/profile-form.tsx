"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, User, Award, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { computeAcademicStats } from "@/lib/academics";
import type { Profile } from "@/types";

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const router = useRouter();
  const academicStats = computeAcademicStats();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [institution, setInstitution] = useState(profile?.institution ?? "");
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.field_of_study ?? "");
  const [academicYear, setAcademicYear] = useState(
    profile?.academic_year ? String(profile.academic_year) : ""
  );
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingAvatar(true);
    const supabase = createClient();

    const filePath = `${profile.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("שגיאה בהעלאת התמונה");
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", profile.id);

    setUploadingAvatar(false);

    if (updateError) {
      toast.error("שגיאה בשמירת התמונה");
      return;
    }

    setAvatarUrl(data.publicUrl);
    toast.success("התמונה עודכנה");
    router.refresh();
  }

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        institution: institution.trim() || null,
        field_of_study: fieldOfStudy.trim() || null,
        academic_year: academicYear ? Number(academicYear) : null,
        phone: phone.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      toast.error("שגיאה בשמירת הפרופיל");
      return;
    }

    toast.success("הפרופיל עודכן בהצלחה");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Avatar + identity card */}
      <Card className="animate-fade-in">
        <CardContent className="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:text-right">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={avatarUrl || undefined} alt={fullName} />
            <AvatarFallback className="text-base text-white" style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
              {getInitials(fullName || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-foreground">{fullName || "סטודנט"}</p>
            <p className="truncate text-[12px] text-muted-foreground">{email}</p>
          </div>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-[12px] font-semibold transition-colors hover:bg-accent">
                {uploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
                החלפת תמונה
              </div>
            </Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="animate-fade-in [animation-delay:50ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#EEF2FF" }}>
              <Award className="h-4 w-4" style={{ color: "#4F46E5" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{academicStats.average}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">ממוצע אקדמי</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in [animation-delay:100ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#ECFDF5" }}>
              <GraduationCap className="h-4 w-4" style={{ color: "#10B981" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">
                {academicStats.creditsEarned}/{academicStats.creditsRequired}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">נקודות זכות</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in [animation-delay:150ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#F5F3FF" }}>
              <User className="h-4 w-4" style={{ color: "#7C3AED" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{academicYear || "—"}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">שנת לימודים</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal details */}
      <Card className="animate-fade-in [animation-delay:200ms]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[14px]">פרטים אישיים</CardTitle>
          <p className="text-[12px] text-muted-foreground">עדכנו את הפרטים האישיים והאקדמיים שלכם</p>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-[12px]">שם מלא</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12px]">אימייל</Label>
              <Input id="email" value={email} disabled dir="ltr" className="rounded-xl text-right text-[13px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="institution" className="text-[12px]">מוסד לימודים</Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="לדוגמה: אוניברסיטת תל אביב"
                className="rounded-xl text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fieldOfStudy" className="text-[12px]">תחום לימודים</Label>
              <Input
                id="fieldOfStudy"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="לדוגמה: מדעי המחשב"
                className="rounded-xl text-[13px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="academicYear" className="text-[12px]">שנת לימודים</Label>
              <Input
                id="academicYear"
                type="number"
                min="1"
                max="8"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="1"
                className="rounded-xl text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[12px]">טלפון</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="rounded-xl text-right text-[13px]"
                placeholder="050-0000000"
              />
            </div>
          </div>

          <Separator />

          <Button onClick={handleSave} disabled={saving} className="rounded-xl">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            שמירת שינויים
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
