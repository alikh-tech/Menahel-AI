import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ExamsClient } from "@/components/exams/exams-client";
import { ProfileRequiredCard } from "@/components/shared/profile-required-card";

export const metadata: Metadata = {
  title: "מבחנים | מנהל.AI",
};

export default async function ExamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  if (!profile) {
    return <ProfileRequiredCard />;
  }

  return <ExamsClient profile={profile} />;
}
