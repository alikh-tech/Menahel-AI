"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationIcon } from "@/components/notifications/notification-icon";
import { createClient } from "@/lib/supabase/client";
import { NOTIFICATION_SEVERITY_STYLE, sortNotifications } from "@/lib/notifications";
import { formatDate } from "@/lib/utils";
import type { AppNotification } from "@/types";

type Filter = "all" | "unread";

export function NotificationsClient({ initialNotifications }: { initialNotifications: AppNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<Filter>("all");
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const visible = useMemo(() => {
    const sorted = sortNotifications(notifications);
    return filter === "unread" ? sorted.filter((n) => !n.is_read) : sorted;
  }, [notifications, filter]);

  async function markAsRead(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    if (error) {
      toast.error("שגיאה בעדכון ההתראה");
      return;
    }

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const supabase = createClient();
    const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);

    if (error) {
      toast.error("שגיאה בעדכון ההתראות");
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleClick(notification: AppNotification) {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.href) {
      router.push(notification.href);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList>
            <TabsTrigger value="all">הכל ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">לא נקראו ({unreadCount})</TabsTrigger>
          </TabsList>
        </Tabs>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5">
            <CheckCheck className="h-3.5 w-3.5" />
            סמן הכל כנקרא
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-[13px] text-muted-foreground">
              {filter === "unread" ? "אין התראות שלא נקראו" : "אין התראות כרגע"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((notification) => {
            const style = NOTIFICATION_SEVERITY_STYLE[notification.severity];
            return (
              <Card
                key={notification.id}
                className={`animate-fade-in cursor-pointer transition-colors hover:bg-accent/50 ${notification.is_read ? "" : "border-primary/30"}`}
                onClick={() => handleClick(notification)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: style.bg }}
                  >
                    <NotificationIcon name={notification.icon} className="h-4 w-4" style={{ color: style.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-[13px] ${notification.is_read ? "font-medium text-muted-foreground" : "font-semibold text-foreground"}`}>
                        {notification.title}
                      </p>
                      <Badge variant={style.badge} className="shrink-0 text-[10px]">
                        {style.label}
                      </Badge>
                    </div>
                    {notification.description && (
                      <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{notification.description}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground/70">{formatDate(notification.created_at)}</p>
                  </div>
                  {!notification.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
