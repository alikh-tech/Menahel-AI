import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { DocumentsClient } from "@/components/documents/documents-client";
import { ProfileRequiredCard } from "@/components/shared/profile-required-card";

export const metadata: Metadata = {
  title: "מרכז מסמכים | מנהל.AI",
};

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          מרכז מסמכים
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          נהלו את כל המסמכים האקדמיים והאישיים שלכם במקום אחד ובצורה מאובטחת
        </p>
      </div>

      {profile ? (
        <DocumentsClient initialDocuments={documents ?? []} profile={profile} />
      ) : (
        <ProfileRequiredCard />
      )}
    </div>
  );
}
