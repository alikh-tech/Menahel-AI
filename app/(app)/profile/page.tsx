import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "פרופיל | מנהל.AI",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">פרופיל</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          נהלו את הפרטים האישיים והאקדמיים שלכם
        </p>
      </div>

      <ProfileForm profile={profile} email={user!.email ?? ""} />
    </div>
  );
}
