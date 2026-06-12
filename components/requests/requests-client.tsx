"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewRequestDialog } from "@/components/requests/new-request-dialog";
import { REQUEST_STATUS_META, REQUEST_TYPE_META } from "@/lib/constants";
import { sortRequests } from "@/lib/requests";
import { formatDate } from "@/lib/utils";
import type { AdminRequest } from "@/types";

type Filter = "all" | "active" | "closed";

export function RequestsClient({ initialRequests }: { initialRequests: AdminRequest[] }) {
  const [requests, setRequests] = useState<AdminRequest[]>(initialRequests);
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const sorted = sortRequests(requests);
    if (filter === "active") {
      return sorted.filter((r) => ["received", "in_progress", "document_required"].includes(r.status));
    }
    if (filter === "closed") {
      return sorted.filter((r) => ["approved", "rejected"].includes(r.status));
    }
    return sorted;
  }, [requests, filter]);

  function handleAdded(request: AdminRequest) {
    setRequests((prev) => [request, ...prev]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">בקשות מנהלתיות</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            הגישו בקשות למשרדי הסטודנטים ועקבו אחר הסטטוס שלהן
          </p>
        </div>
        <NewRequestDialog onAdded={handleAdded} />
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
        <TabsList>
          <TabsTrigger value="all">הכל ({requests.length})</TabsTrigger>
          <TabsTrigger value="active">פעילות</TabsTrigger>
          <TabsTrigger value="closed">סגורות</TabsTrigger>
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-[13px] text-muted-foreground">אין בקשות להצגה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((request, i) => {
            const statusMeta = REQUEST_STATUS_META[request.status];
            const StatusIcon = statusMeta.icon;
            return (
              <Card key={request.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <StatusIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[13px] font-semibold text-foreground">{request.title}</p>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {REQUEST_TYPE_META[request.type].label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{request.description}</p>
                      {request.course && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">קורס: {request.course}</p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        הוגש בתאריך {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                    <Badge variant={statusMeta.variant} className="text-[11px]">
                      {statusMeta.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
