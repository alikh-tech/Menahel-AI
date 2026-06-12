"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronLeft, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationIcon } from "@/components/notifications/notification-icon";
import { createClient } from "@/lib/supabase/client";
import { NOTIFICATION_SEVERITY_STYLE, sortNotifications } from "@/lib/notifications";
import type { AppNotification } from "@/types";

export function NotificationBell({ initialNotifications }: { initialNotifications: AppNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const recent = sortNotifications(notifications).slice(0, 5);

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">התראות</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>התראות</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-[11px] font-normal text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              סמן הכל כנקרא
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">אין התראות חדשות</p>
          </div>
        ) : (
          recent.map((notification) => {
            const style = NOTIFICATION_SEVERITY_STYLE[notification.severity];
            return (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleClick(notification)}
                className="flex items-start gap-3 py-2"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: style.bg }}
                >
                  <NotificationIcon name={notification.icon} className="h-4 w-4" style={{ color: style.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[12px] ${notification.is_read ? "font-medium text-muted-foreground" : "font-semibold text-foreground"}`}>
                    {notification.title}
                  </p>
                  {notification.description && (
                    <p className="truncate text-[11px] text-muted-foreground">{notification.description}</p>
                  )}
                </div>
                {!notification.is_read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="flex items-center justify-center gap-1 text-[12px] font-semibold text-primary">
            לכל ההתראות
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
