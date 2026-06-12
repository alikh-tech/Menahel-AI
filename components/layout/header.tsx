"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Sparkles, LogOut, Settings, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { PAGE_SUBTITLES } from "@/lib/constants";
import type { AppNotification } from "@/types";

interface HeaderProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  institution?: string | null;
  academicYear?: number | null;
  notifications: AppNotification[];
}

export function Header({
  userName,
  userEmail,
  avatarUrl,
  institution,
  academicYear,
  notifications,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const currentEntry = Object.entries(PAGE_SUBTITLES).find(([href]) =>
    pathname.startsWith(href)
  );
  const title = currentEntry?.[1] ?? "מנהל.AI";

  const subtitle = [institution, academicYear ? `שנה ${academicYear}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="sticky top-0 z-30 flex h-[66px] shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 shadow-card sm:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">פתח תפריט</span>
          </Button>
          <SheetContent side="right" className="flex w-72 flex-col p-0">
            <SheetHeader className="border-b border-border px-6 py-4">
              <SheetTitle className="flex items-center gap-2 text-right">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold">
                  מנהל<span className="text-primary">.AI</span>
                </span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 py-6">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-bold leading-none text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell initialNotifications={notifications} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full p-1 transition-colors hover:bg-accent">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {userName}
                </p>
                <p className="text-xs leading-tight text-muted-foreground">
                  {userEmail}
                </p>
              </div>
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={avatarUrl ?? undefined} alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(userName || "U")}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>החשבון שלי</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="h-4 w-4" />
                פרופיל
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <Settings className="h-4 w-4" />
                הגדרות
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              התנתקות
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
