import Link from "next/link";
import { UserCog } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ProfileRequiredCard() {
  return (
    <Card className="animate-fade-in">
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <UserCog className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-[13px] text-muted-foreground">
          לא נמצא פרופיל משתמש. יש להשלים את הפרופיל שלכם כדי לצפות בעמוד זה.
        </p>
        <Link href="/profile" className="text-[13px] font-semibold text-primary hover:underline">
          עבור לפרופיל
        </Link>
      </CardContent>
    </Card>
  );
}
