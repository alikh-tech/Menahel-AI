import Link from "next/link";
import { ChevronLeft, FileSignature, Inbox } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS_META, REQUEST_TYPE_META } from "@/lib/constants";
import { getActiveRequests, sortRequests } from "@/lib/requests";
import type { AdminRequest } from "@/types";

export function ActiveRequestsCard({ requests }: { requests: AdminRequest[] }) {
  const active = sortRequests(getActiveRequests(requests)).slice(0, 3);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-[14px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#EEF2FF" }}>
            <FileSignature className="h-4 w-4" style={{ color: "#4F46E5" }} />
          </div>
          בקשות פעילות
        </CardTitle>
        <Link
          href="/requests"
          className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          הכל
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0">
        {active.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">אין בקשות פעילות</p>
          </div>
        ) : (
          active.map((request) => {
            const statusMeta = REQUEST_STATUS_META[request.status];
            return (
              <div key={request.id} className="flex items-center justify-between gap-3 rounded-xl px-1 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-foreground">{request.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{REQUEST_TYPE_META[request.type].label}</p>
                </div>
                <Badge variant={statusMeta.variant} className="shrink-0 text-[10px]">
                  {statusMeta.label}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
