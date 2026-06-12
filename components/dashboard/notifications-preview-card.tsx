import Link from "next/link";
import { ChevronLeft, Bell, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationIcon } from "@/components/notifications/notification-icon";
import { NOTIFICATION_SEVERITY_STYLE } from "@/lib/notifications";
import type { AppNotification } from "@/types";

export function NotificationsPreviewCard({ notifications }: { notifications: AppNotification[] }) {
  const top = notifications.slice(0, 3);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-[14px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#F5F3FF" }}>
            <Sparkles className="h-4 w-4" style={{ color: "#7C3AED" }} />
          </div>
          התראות חכמות
        </CardTitle>
        <Link
          href="/notifications"
          className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          הכל
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0">
        {top.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">אין התראות חכמות כרגע</p>
          </div>
        ) : (
          top.map((notification) => {
            const style = NOTIFICATION_SEVERITY_STYLE[notification.severity];
            return (
              <div key={notification.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: style.bg }}
                >
                  <NotificationIcon name={notification.icon} className="h-4 w-4" style={{ color: style.color }} />
                </div>
                <div className="min-w-0">
                  <p className={`truncate text-[12px] ${notification.is_read ? "font-medium text-muted-foreground" : "font-semibold text-foreground"}`}>
                    {notification.title}
                  </p>
                  {notification.description && (
                    <p className="truncate text-[11px] text-muted-foreground">{notification.description}</p>
                  )}
                </div>
                {!notification.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
