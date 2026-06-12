import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ScheduleClient } from "@/components/schedule/schedule-client";
import { ProfileRequiredCard } from "@/components/shared/profile-required-card";

export const metadata: Metadata = {
  title: "מערכת שעות | מנהל.AI",
};

export default async function SchedulePage() {
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

  return <ScheduleClient profile={profile} />;
}
