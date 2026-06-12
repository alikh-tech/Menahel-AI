"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/constants";
import { NavIcon } from "@/components/layout/nav-icon";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-all",
              isActive
                ? "border border-indigo-200 bg-indigo-50 font-semibold text-primary"
                : "border border-transparent text-muted-foreground hover:bg-accent"
            )}
          >
            <NavIcon name={item.icon} className="h-[13px] w-[13px] shrink-0" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
